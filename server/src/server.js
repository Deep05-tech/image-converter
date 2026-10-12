import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { CONFIG } from './config.js';
import apiRouter from './routes/api.js';
import { startAutoCleaner } from './utils/fileCleaner.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload and output directories exist
await fs.mkdir(CONFIG.UPLOAD_DIR, { recursive: true });
await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

// Start automatic cleaner for temp conversion files
startAutoCleaner();

// API routes
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`[Server] Image to WebP backend running on http://localhost:${CONFIG.PORT}`);
});
