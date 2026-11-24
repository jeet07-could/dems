import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import caseRoutes from './routes/case.routes.js';
import documentRoutes from './routes/document.routes.js';
import activityRoutes from './routes/activity.routes.js';
import healthRoutes from './routes/health.routes.js';
import blockchainRoutes from './routes/blockchain.routes.js';
import aiRoutes from './routes/ai.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Connect to MongoDB (with graceful fallback if offline)
connectDB();

// ── Cybersecurity Hardened Headers (Defense-in-Depth) ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
  xFrameOptions: { action: "deny" }, // Anti-clickjacking
  xContentTypeOptions: true,         // Prevent MIME-sniffing
  xDnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// CORS configuration (restricted to trusted origins)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting (DDoS & Brute-force protection)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Anti-bruteforce rate limit triggered.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Cybersecurity: Request Sanitizer (Path Traversal & Injection Guard)
app.use((req, res, next) => {
  const checkString = `${req.url} ${JSON.stringify(req.body || {})}`;
  if (checkString.includes('../') || checkString.includes('..\\')) {
    console.warn(`🚨 SECURITY ALERT: Path traversal attempt from ${req.ip} on ${req.originalUrl}`);
    return res.status(400).json({ success: false, message: 'Invalid request path or payload.' });
  }
  next();
});

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.use('/api/health', healthRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const server = app.listen(PORT, () => {
  console.log(`🚀 DEMS Secure Server running on port ${PORT}`);
  console.log(`⛓️ Blockchain Ledger initialized and active`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exitCode = 1;
    return;
  }
  throw error;
});

export default app;
