import pLimit from 'p-limit';
import { CONFIG } from '../config.js';

// Concurrency limiter to protect server memory and CPU during 100+ batch conversions
const limit = pLimit(CONFIG.CONCURRENCY_LIMIT);

/**
 * Execute an async conversion task through bounded queue
 * @param {Function} taskFn 
 * @returns {Promise<any>}
 */
export function enqueueTask(taskFn) {
  return limit(taskFn);
}
