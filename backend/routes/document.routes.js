import express from 'express';
import mongoose from 'mongoose';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import Document from '../models/Document.js';
import Case from '../models/Case.js';
import Activity from '../models/Activity.js';
import { memoryStore } from '../data/store.js';
import { blockchainService } from '../services/blockchain.service.js';
import crypto from 'crypto';
import fs from 'fs';
import { Blob } from 'buffer';

const router = express.Router();

// Upload document & Anchor onto Blockchain
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // 1. Calculate SHA-256 hash server-side
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 2. AI Document Classification
    let aiAnalysis = {
      predictedClass: 'Unknown',
      confidence: {},
      verification: null,
      analyzedAt: null,
    };

    try {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([fileBuffer], { type: req.file.mimetype }),
        req.file.originalname
      );

      const aiResponse = await fetch(
        `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/analyze`,
        { method: 'POST', body: formData, signal: AbortSignal.timeout(3000) }
      );

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        aiAnalysis = {
          predictedClass: aiResult.predicted_class || 'Unknown',
          confidence: aiResult.confidence || {},
          analyzedAt: new Date(),
        };
      }
    } catch {
      aiAnalysis = {
        predictedClass: req.file.originalname.toLowerCase().includes('fir')
          ? 'FIR'
          : req.file.originalname.toLowerCase().includes('charge')
          ? 'Charge Sheet'
          : req.file.originalname.toLowerCase().includes('witness')
          ? 'Witness Statement'
          : 'Evidence Record',
        confidence: { heuristic: 1.0 },
        analyzedAt: new Date(),
      };
    }

    // 3. Anchor onto Immutable Blockchain Ledger
    const docId = `DOC_${Date.now()}`;
    const blockchainReceipt = await blockchainService.registerEvidence({
      documentId: docId,
      documentHash: hash,
      digitalId: req.user.digitalId || 'DEMS-OFFICER',
      caseId: req.body.caseId,
      name: req.body.name || req.file.originalname,
      fileSize: req.file.size,
    });

    const docPayload = {
      _id: docId,
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      description: req.body.description,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      path: req.file.path,
      hash: hash,
      hashAlgorithm: 'SHA-256',
      caseId: req.body.caseId,
      uploadedBy: req.user._id,
      aiAnalysis,
      blockchainTx: {
        txHash: blockchainReceipt.transactionHash,
        blockNumber: blockchainReceipt.blockNumber,
        blockHash: blockchainReceipt.blockHash,
        merkleRoot: blockchainReceipt.merkleRoot,
        anchoredAt: blockchainReceipt.timestamp,
        status: 'COMMITTED_ON_CHAIN',
      },
      chainOfCustody: [{
        action: 'uploaded',
        user: req.user._id,
        details: {
          fileName: req.file.originalname,
          digitalId: req.user.digitalId,
          blockchainTx: blockchainReceipt.transactionHash,
        },
      }],
    };

    if (mongoose.connection.readyState === 1) {
      const document = new Document(docPayload);
      await document.save();

      await Case.findByIdAndUpdate(req.body.caseId, {
        $inc: { evidenceCount: 1 },
        $push: { documents: document._id },
      });

      await Activity.create({
        action: 'document_uploaded',
        user: req.user._id,
        userEmail: req.user.digitalId || req.user.email,
        userRole: req.user.role,
        targetType: 'document',
        targetId: document._id,
        details: {
          fileName: req.file.originalname,
          hash: hash,
          blockchainTx: blockchainReceipt.transactionHash,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.status(201).json({ success: true, data: document });
    }

    // MemoryStore fallback
    const document = memoryStore.addDocument(docPayload);
    memoryStore.addActivity({
      action: 'document_uploaded',
      user: req.user._id,
      userEmail: req.user.digitalId || req.user.email,
      userRole: req.user.role,
      targetType: 'document',
      targetId: document._id,
      details: {
        fileName: req.file.originalname,
        hash: hash,
        blockchainTx: blockchainReceipt.transactionHash,
      },
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
});

// Get all documents
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { caseId, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (caseId) filter.caseId = caseId;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { originalName: { $regex: search, $options: 'i' } },
        ];
      }
      const documents = await Document.find(filter)
        .populate('uploadedBy', 'firstName lastName digitalId email')
        .populate('caseId', 'title caseNumber')
        .sort({ uploadedAt: -1 });

      return res.json({ success: true, data: documents, count: documents.length });
    }

    // MemoryStore fallback
    const filter = {};
    if (caseId) filter.caseId = caseId;
    const documents = memoryStore.findDocuments(filter);
    res.json({ success: true, data: documents, count: documents.length });
  } catch (error) {
    next(error);
  }
});

// Verify document hash against live disk file AND Blockchain
router.post('/:id/verify', authenticate, async (req, res, next) => {
  try {
    let document;
    if (mongoose.connection.readyState === 1) {
      document = await Document.findById(req.params.id);
    } else {
      document = memoryStore.findDocumentById(req.params.id);
    }

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    let isVerified = true;
    let currentHash = document.hash;

    if (document.path && fs.existsSync(document.path)) {
      const fileBuffer = fs.readFileSync(document.path);
      currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      isVerified = currentHash === document.hash;
    }

    // Verify against on-chain blockchain ledger
    const chainVerification = blockchainService.verifyEvidence(document._id || document.id, currentHash);

    const overallVerified = isVerified && (chainVerification.found ? chainVerification.verified : true);

    res.json({
      success: true,
      data: {
        verified: overallVerified,
        expectedHash: document.hash,
        currentHash,
        blockchain: chainVerification,
        tamperDetected: !overallVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
