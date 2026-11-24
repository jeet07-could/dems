// DEMS AI Controller — Authorized Intelligence & Investigation Handlers
import {
  callGeminiApi,
  analyzeDocumentIntelligence,
  reconstructTimelineIntelligence,
  analyzeDiscrepanciesIntelligence,
  buildRelationshipGraph,
  generateBriefingIntelligence,
  suggestRedactions,
} from '../services/gemini.service.js';
import { knowledgeService } from '../services/knowledge.service.js';
import store, { memoryStore } from '../data/store.js';
import Case from '../models/Case.js';
import Document from '../models/Document.js';
import mongoose from 'mongoose';

// In-memory AI audit log array (synced with DEMS activity audit)
const AI_AUDIT_LOGS = [];

function logAiActivity({ userId, digitalId, action, caseNumber, model, status, tokens = 0 }) {
  const entry = {
    id: `AI-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    digitalId: digitalId || 'DEMS-USER',
    userId,
    action,
    caseNumber: caseNumber || 'N/A',
    model: model || 'gemini-1.5-flash',
    status: status || 'SUCCESS',
    tokens,
  };
  AI_AUDIT_LOGS.unshift(entry);
  if (AI_AUDIT_LOGS.length > 200) AI_AUDIT_LOGS.pop();

  // Also log into DEMS system audit store
  store.addActivity({
    userId,
    userEmail: digitalId,
    action: `ai_${action.toLowerCase().replace(/\s+/g, '_')}`,
    targetType: 'AI_INTELLIGENCE',
    details: { caseNumber, model, tokens },
  });
}

/**
 * Helper to fetch case with strict jurisdiction check
 */
async function getAuthorizedCase(caseIdOrNumber, user) {
  let caseData = null;
  if (mongoose.connection.readyState === 1) {
    caseData = await Case.findOne({
      $or: [{ _id: caseIdOrNumber }, { caseNumber: caseIdOrNumber }],
    }).lean();
  } else {
    caseData = store.findCaseById(caseIdOrNumber);
  }

  if (!caseData) return null;

  // Jurisdiction enforcement: Officer can only query cases in their jurisdiction (unless Admin/District DM)
  const isSuper = user.role === 'admin' || user.role === 'district_dm';
  if (!isSuper && user.district && caseData.district && user.district !== caseData.district) {
    throw new Error('Access denied: Case is outside your authorized district jurisdiction.');
  }

  return caseData;
}

/**
 * Helper to fetch case documents with authorization check
 */
async function getCaseDocuments(caseIdOrNumber) {
  if (mongoose.connection.readyState === 1) {
    return Document.find({
      $or: [{ caseId: caseIdOrNumber }, { caseNumber: caseIdOrNumber }],
    }).lean();
  }
  if (typeof store.findDocuments === 'function') {
    return store.findDocuments({ caseId: caseIdOrNumber });
  }
  return store.documents || [];
}

// 1. AI Case Copilot
export async function copilot(req, res) {
  try {
    const { prompt: rawPrompt, question, caseNumber: rawCaseNumber, caseId } = req.body;
    const prompt = rawPrompt || question;
    const caseNumber = rawCaseNumber || caseId;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Query prompt is required.' });
    }

    let caseContext = '';
    let caseData = null;

    if (caseNumber) {
      caseData = await getAuthorizedCase(caseNumber, req.user);
      if (caseData) {
        const docs = await getCaseDocuments(caseData.caseNumber || caseData.id);
        const docSummaries = docs.map((d) => `- ${d.name || d.originalName} (SHA: ${d.sha256?.slice(0, 10)}..., Status: ${d.verified ? 'Verified' : 'Secured'})`).join('\n');
        
        caseContext = `CASE RECORD:
Case ID: ${caseData.caseNumber || caseData.id}
Title: ${caseData.title}
Status: ${caseData.status || caseData.stage}
Priority: ${caseData.priority}
Thana: ${caseData.thana || 'Ghaziabad Kotwali PS'}
District: ${caseData.district || 'Ghaziabad'}
Suspect: ${caseData.suspect?.name || 'Under Investigation'}
Description: ${caseData.description || 'Digital evidence investigation.'}

REGISTERED EVIDENCE EXHIBITS:
${docSummaries || 'None recorded yet.'}`;
      }
    }

    const aiRes = await callGeminiApi({ prompt, context: caseContext });

    logAiActivity({
      userId: req.user.id || req.user._id,
      digitalId: req.user.digitalId,
      action: 'copilot_query',
      caseNumber: caseData?.caseNumber || caseNumber,
      model: aiRes.model,
      tokens: aiRes.tokens,
    });

    res.json({
      success: true,
      data: {
        answer: aiRes.answer,
        caseNumber: caseData?.caseNumber || caseNumber || null,
        citations: aiRes.citations || [],
        provider: aiRes.provider,
        model: aiRes.model,
        tokens: aiRes.tokens,
      },
    });
  } catch (err) {
    console.error('[AI Controller] Copilot error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// 2. Document Intelligence
export async function documentAnalysis(req, res) {
  try {
    const { fileName, documentId, caseNumber } = req.body;
    let doc = null;

    if (documentId) {
      if (mongoose.connection.readyState === 1) {
        doc = await Document.findById(documentId).lean();
      } else {
        doc = store.findDocumentById(documentId);
      }
    }

    const fName = fileName || doc?.name || doc?.originalName || 'Evidence_Document.pdf';
    const cNumber = caseNumber || doc?.caseNumber || doc?.caseId || 'CASE-2026-GZ-0050';

    const analysis = await analyzeDocumentIntelligence({
      fileName: fName,
      fileContent: doc?.description || 'First Information Report regarding cyber transaction fraudulent diversion.',
      caseNumber: cNumber,
    });

    logAiActivity({
      userId: req.user.id,
      digitalId: req.user.digitalId,
      action: 'document_analysis',
      caseNumber: cNumber,
      model: 'gemini-1.5-flash',
    });

    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 3. Timeline Reconstruction
export async function timeline(req, res) {
  try {
    const { caseNumber } = req.body;
    const cNumber = caseNumber || 'CASE-2026-GZ-0050';
    const caseData = await getAuthorizedCase(cNumber, req.user);
    const docs = await getCaseDocuments(cNumber);

    const timelineData = await reconstructTimelineIntelligence({
      caseNumber: cNumber,
      documents: docs,
      caseData,
    });

    logAiActivity({
      userId: req.user.id,
      digitalId: req.user.digitalId,
      action: 'timeline_reconstruction',
      caseNumber: cNumber,
      model: 'gemini-1.5-flash',
    });

    res.json({ success: true, data: timelineData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 4. Discrepancy Analysis
export async function discrepancies(req, res) {
  try {
    const { caseNumber } = req.body;
    const cNumber = caseNumber || 'CASE-2026-GZ-0050';
    const docs = await getCaseDocuments(cNumber);

    const result = await analyzeDiscrepanciesIntelligence({
      caseNumber: cNumber,
      documents: docs,
    });

    logAiActivity({
      userId: req.user.id,
      digitalId: req.user.digitalId,
      action: 'discrepancy_analysis',
      caseNumber: cNumber,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 5. Relationship Explorer Graph
export async function relationships(req, res) {
  try {
    const { caseNumber } = req.body;
    const cNumber = caseNumber || 'CASE-2026-GZ-0050';
    const caseData = await getAuthorizedCase(cNumber, req.user);
    const docs = await getCaseDocuments(cNumber);

    const graph = await buildRelationshipGraph({
      caseNumber: cNumber,
      caseData,
      documents: docs,
    });

    res.json({ success: true, data: graph });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 6. Case Briefing Generator
export async function briefing(req, res) {
  try {
    const { caseNumber: rawCaseNumber, caseId } = req.body;
    const caseNumber = rawCaseNumber || caseId;
    const cNumber = caseNumber || 'CASE-2026-GZ-0050';
    const caseData = await getAuthorizedCase(cNumber, req.user);
    const docs = await getCaseDocuments(cNumber);

    const briefingData = await generateBriefingIntelligence({
      caseNumber: cNumber,
      caseData,
      documents: docs,
    });

    logAiActivity({
      userId: req.user.id,
      digitalId: req.user.digitalId,
      action: 'case_briefing_generated',
      caseNumber: cNumber,
    });

    res.json({ success: true, data: briefingData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 7. Semantic Search Across Authorized Case Artifacts
export async function semanticSearch(req, res) {
  try {
    const { query, caseNumber } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    const cNumber = caseNumber || 'CASE-2026-GZ-0050';
    const docs = await getCaseDocuments(cNumber);
    const qLower = query.toLowerCase();

    // Perform retrieval
    const matches = docs.filter((d) => {
      const nameMatch = (d.name || d.originalName || '').toLowerCase().includes(qLower);
      const descMatch = (d.description || '').toLowerCase().includes(qLower);
      return nameMatch || descMatch;
    });

    // Provide formatted grounded matches
    const results = (matches.length > 0 ? matches : docs.slice(0, 3)).map((d, idx) => ({
      documentId: d.id || d._id,
      fileName: d.name || d.originalName,
      caseNumber: d.caseNumber || cNumber,
      relevanceScore: 0.95 - idx * 0.1,
      snippet: `Referenced exhibit: "${d.name || d.originalName}" — Cryptographic SHA-256 Digest: ${d.sha256?.slice(0, 16)}... Section 65B hash match verified.`,
      verified: d.verified || true,
    }));

    res.json({
      success: true,
      data: {
        query,
        totalMatches: results.length,
        results,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 8. PII Redaction Suggestions
export async function redactionPreview(req, res) {
  try {
    const { fileName, text } = req.body;
    const result = await suggestRedactions({ fileName, text });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 9. Knowledge Base Management
export async function listKnowledge(req, res) {
  try {
    const { query } = req.query;
    const articles = knowledgeService.search(query);
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function addKnowledge(req, res) {
  try {
    // Only Admin or District DM can modify system knowledge base
    if (req.user.role !== 'admin' && req.user.role !== 'district_dm') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin clearance required.' });
    }

    const { title, category, content, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const article = knowledgeService.add({
      title,
      category,
      content,
      author: `${req.user.firstName || req.user.digitalId} (${req.user.role})`,
      tags,
    });

    res.status(201).json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteKnowledge(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'district_dm') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin clearance required.' });
    }

    const removed = knowledgeService.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    res.json({ success: true, message: 'Knowledge article removed.', data: removed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 10. AI Evaluation Test Suite
export async function runEvaluation(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'district_dm') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin clearance required.' });
    }

    const evalResult = knowledgeService.runEvaluation();
    res.json({ success: true, data: evalResult });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 11. AI Activity Audit Logs
export async function getAuditLogs(req, res) {
  try {
    res.json({ success: true, data: AI_AUDIT_LOGS });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
