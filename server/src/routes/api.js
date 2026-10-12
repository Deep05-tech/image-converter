import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import crypto from 'crypto';
import archiver from 'archiver';
import { CONFIG } from '../config.js';
import { inspectImage, convertImage, convertToWebp } from '../services/imageService.js';
import { enqueueTask } from '../services/queueService.js';
import { sanitizeFilename, getWebpFilename, getConvertedFilename } from '../utils/sanitize.js';

const router = express.Router();

// Configure Multer storage to memory for fast processing without disk thrashing,
// or disk storage for large batches. Memory storage is ideal for sharp which takes Buffers directly.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: CONFIG.MAX_BATCH_SIZE
  }
});

// Cache map of converted files for download/ZIP (id -> metadata & disk path)
const convertedStore = new Map();

// Helper to generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * Inspect uploaded image without converting
 */
router.post('/inspect', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const inspection = await inspectImage(req.file.buffer);
    if (!inspection.isValid) {
      return res.status(400).json({ error: inspection.error });
    }

    res.json({
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      ...inspection
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Convert a single image
 */
router.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      targetFormat = 'webp',
      mode = 'lossless',
      quality = 85,
      keepMetadata = 'false',
      resize = 'false',
      targetWidth,
      targetHeight,
      fit = 'inside',
      allowEnlarge = 'false',
      seoFilename = 'false'
    } = req.body;

    // First validate image through sharp
    const inspection = await inspectImage(req.file.buffer);
    if (!inspection.isValid) {
      return res.status(400).json({ error: inspection.error });
    }

    // Process conversion through bounded concurrency queue
    const result = await enqueueTask(() =>
      convertImage(req.file.buffer, {
        targetFormat,
        mode,
        quality: Number(quality),
        keepMetadata: keepMetadata === 'true',
        resize: resize === 'true',
        targetWidth: targetWidth ? Number(targetWidth) : null,
        targetHeight: targetHeight ? Number(targetHeight) : null,
        fit,
        allowEnlarge: allowEnlarge === 'true'
      })
    );

    const fileId = generateId();
    const useSeo = seoFilename === 'true';
    const outputFilename = getConvertedFilename(req.file.originalname, targetFormat, useSeo);

    // Save converted file to output cache directory
    const outputFilePath = path.join(CONFIG.OUTPUT_DIR, `${fileId}_${outputFilename}`);
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputFilePath, result.buffer);

    // Calculate real savings
    const originalSize = req.file.size;
    const convertedSize = result.info.size;
    const byteDiff = originalSize - convertedSize;
    const percentDiff = ((byteDiff / originalSize) * 100);

    const fileRecord = {
      id: fileId,
      originalName: req.file.originalname,
      filename: outputFilename,
      filePath: outputFilePath,
      originalSize,
      convertedSize,
      targetFormat: result.info.targetFormat || targetFormat,
      mimeType: result.info.mimeType || 'image/webp',
      savingsPercent: Number(percentDiff.toFixed(1)),
      savingsBytes: byteDiff,
      originalWidth: inspection.width,
      originalHeight: inspection.height,
      outputWidth: result.info.width,
      outputHeight: result.info.height,
      mode: result.info.mode,
      quality: result.info.quality,
      warnings: result.info.warnings,
      createdAt: Date.now()
    };

    convertedStore.set(fileId, fileRecord);

    res.json({
      success: true,
      data: {
        ...fileRecord,
        downloadUrl: `/api/download/${fileId}`,
        previewUrl: `/api/preview/${fileId}`
      }
    });
  } catch (err) {
    console.error('[Convert Error]:', err);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

/**
 * Preview single converted file inline
 */
router.get('/preview/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = convertedStore.get(id);

    if (!record || !existsSync(record.filePath)) {
      return res.status(404).json({ error: 'File not found or expired' });
    }

    res.setHeader('Content-Type', record.mimeType || 'image/webp');
    res.setHeader('Content-Length', record.convertedSize);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const stream = createReadStream(record.filePath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Download single converted file
 */
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = convertedStore.get(id);

    if (!record || !existsSync(record.filePath)) {
      return res.status(404).json({ error: 'File not found or expired' });
    }

    res.setHeader('Content-Type', record.mimeType || 'image/webp');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(record.filename)}"`);
    res.setHeader('Content-Length', record.convertedSize);

    const stream = createReadStream(record.filePath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Batch download multiple converted files as a ZIP archive
 */
router.post('/download-zip', async (req, res) => {
  try {
    const { fileIds } = req.body;

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ error: 'No file IDs provided for ZIP download' });
    }

    const archive = archiver('zip', {
      zlib: { level: 6 } // Good balance of compression and CPU
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="converted-webp-images.zip"');

    archive.on('error', (err) => {
      console.error('[Archive Error]:', err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    // Track used names in zip to handle collisions safely
    const usedNames = new Map();

    for (const id of fileIds) {
      const record = convertedStore.get(id);
      if (record && existsSync(record.filePath)) {
        let zipName = record.filename;

        // Collision avoidance
        if (usedNames.has(zipName)) {
          const count = usedNames.get(zipName) + 1;
          usedNames.set(zipName, count);
          const parsed = path.parse(zipName);
          zipName = `${parsed.name}-${count}${parsed.ext}`;
        } else {
          usedNames.set(zipName, 1);
        }

        archive.file(record.filePath, { name: zipName });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('[ZIP Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;
