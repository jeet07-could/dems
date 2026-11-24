import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { blockchainService } from '../services/blockchain.service.js';
import Document from '../models/Document.js';
import { memoryStore } from '../data/store.js';
import fs from 'fs';
import crypto from 'crypto';
import mongoose from 'mongoose';

const router = express.Router();

// ── Get Blockchain Network Statistics ──
router.get('/stats', authenticate, (req, res) => {
  const stats = blockchainService.getStats();
  res.json({
    success: true,
    data: stats,
  });
});

// ── Get All Blocks (Ledger Explorer) ──
router.get('/blocks', authenticate, (req, res) => {
  const blocks = blockchainService.getAllBlocks();
  res.json({
    success: true,
    data: blocks,
    count: blocks.length,
  });
});

// ── Verify Full Blockchain Mathematical Integrity ──
router.get('/chain-check', authenticate, (req, res) => {
  const integrity = blockchainService.verifyFullChain();
  res.json({
    success: true,
    data: integrity,
  });
});

// ── Zero-Trust Tamper Verification for Specific Evidence ──
router.get('/verify/:documentId', authenticate, async (req, res) => {
  try {
    const { documentId } = req.params;

    // Find document to get current physical file path
    let doc;
    if (mongoose.connection.readyState === 1) {
      doc = await Document.findById(documentId);
    } else {
      doc = memoryStore.findDocumentById(documentId);
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Evidence document not found in system index.',
      });
    }

    // Recompute live hash from file on disk
    let currentHash = doc.hash;
    let fileFoundOnDisk = false;

    if (doc.path && fs.existsSync(doc.path)) {
      fileFoundOnDisk = true;
      const fileBuffer = fs.readFileSync(doc.path);
      currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }

    const verification = blockchainService.verifyEvidence(documentId, currentHash);

    res.json({
      success: true,
      data: {
        ...verification,
        documentName: doc.name,
        fileFoundOnDisk,
        tamperDetected: verification.tamperDetected,
        status: verification.verified
          ? 'VERIFIED_UNTAMPERED'
          : 'TAMPER_ALERT_HASH_MISMATCH',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
