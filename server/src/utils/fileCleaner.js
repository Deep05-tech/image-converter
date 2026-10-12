import fs from 'fs/promises';
import path from 'path';
import { CONFIG } from '../config.js';

export async function cleanupOldFiles() {
  const dirsToClean = [CONFIG.UPLOAD_DIR, CONFIG.OUTPUT_DIR];
  const now = Date.now();

  for (const dir of dirsToClean) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const files = await fs.readdir(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile() && (now - stats.mtimeMs > CONFIG.FILE_MAX_AGE_MS)) {
            await fs.unlink(filePath);
            console.log(`[Cleaner] Removed aged file: ${file}`);
          }
        } catch (err) {
          // ignore individual stat/unlink errors
        }
      }
    } catch (err) {
      console.error(`[Cleaner] Failed to read directory ${dir}:`, err.message);
    }
  }
}

export function startAutoCleaner() {
  // Run on startup
  cleanupOldFiles();
  // Run periodically
  return setInterval(cleanupOldFiles, CONFIG.CLEANUP_INTERVAL_MS);
}
