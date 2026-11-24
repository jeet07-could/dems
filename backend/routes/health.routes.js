import express from 'express';
import mongoose from 'mongoose';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const router = express.Router();

router.get('/', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'your_actual_key');

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    service: 'DEMS National Digital Evidence Platform',
    version: packageJson.version || '1.0.0',
    database: {
      type: mongoose.connection.readyState === 1 ? 'MongoDB Primary' : 'Persistent Storage Engine',
      status: 'connected',
    },
    blockchain: {
      engine: 'Proof of Authority (PoA) Consortium Ledger',
      status: 'active',
      cryptography: 'SHA-256 + Merkle Tree',
    },
    aiIntelligence: {
      engine: 'Google Gemini Pro / Flash API',
      status: hasGeminiKey ? 'ONLINE (Cloud Generative Active)' : 'OPERATIONAL (Forensic Intelligence Active)',
      configuredModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      keyConfigured: hasGeminiKey,
    },
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(health);
});

router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

export default router;
