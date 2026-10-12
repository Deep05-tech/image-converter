import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  UPLOAD_DIR: path.join(__dirname, '../uploads'),
  OUTPUT_DIR: path.join(__dirname, '../uploads/converted'),
  MAX_FILE_SIZE_MB: 50,
  MAX_BATCH_SIZE: 150,
  CLEANUP_INTERVAL_MS: 15 * 60 * 1000, // run cleanup every 15 minutes
  FILE_MAX_AGE_MS: 30 * 60 * 1000, // files older than 30 mins cleaned up
  CONCURRENCY_LIMIT: 4, // Max simultaneous sharp transforms
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'image/gif',
    'image/avif',
    'image/svg+xml'
  ]
};
