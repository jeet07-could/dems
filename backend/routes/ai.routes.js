// DEMS AI Routes — AI Copilot, Document Intelligence, Timeline & Evaluation
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  copilot,
  documentAnalysis,
  timeline,
  discrepancies,
  relationships,
  briefing,
  semanticSearch,
  redactionPreview,
  listKnowledge,
  addKnowledge,
  deleteKnowledge,
  runEvaluation,
  getAuditLogs,
} from '../controllers/ai.controller.js';

const router = express.Router();

// All AI features require authentication (Digital ID login verification)
router.use(authenticate);

// 1. Interactive Case Copilot
router.post('/copilot', copilot);

// 2. Document Entity & Classification Analysis
router.post('/document-analysis', documentAnalysis);

// 3. Chronological Event Timeline Reconstruction
router.post('/timeline', timeline);

// 4. Comparative Discrepancy & Inconsistency Analysis
router.post('/discrepancies', discrepancies);

// 5. Forensic Evidence Relationship Graph
router.post('/relationships', relationships);

// 6. Case Briefing Generator
router.post('/briefing', briefing);

// 7. Semantic Search Across Case Artifacts
router.post('/semantic-search', semanticSearch);

// 8. PII Redaction Suggestions & Preview
router.post('/redaction-preview', redactionPreview);

// 9. Knowledge Base Management
router.get('/knowledge', listKnowledge);
router.post('/knowledge', authorize('admin', 'district_dm'), addKnowledge);
router.delete('/knowledge/:id', authorize('admin', 'district_dm'), deleteKnowledge);

// 10. AI Evaluation Benchmark
router.get('/evaluation', authorize('admin', 'district_dm'), runEvaluation);
router.post('/evaluation', authorize('admin', 'district_dm'), runEvaluation);
router.post('/evaluation/run', authorize('admin', 'district_dm'), runEvaluation);

// 11. AI Activity & Token Audit Logs
router.get('/audit', getAuditLogs);

export default router;
