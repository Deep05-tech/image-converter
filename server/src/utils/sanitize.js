import path from 'path';

/**
 * Sanitize filename to prevent directory traversal and invalid characters
 */
export function sanitizeFilename(filename) {
  const base = path.basename(filename).replace(/[\/\?<>\\:\*\|":]/g, '');
  return base || 'unnamed-image';
}

/**
 * Format filename into SEO-friendly slug
 */
export function seoFriendlySlug(filename, targetFormat = 'webp') {
  const ext = targetFormat.toLowerCase() === 'jpeg' ? 'jpg' : targetFormat.toLowerCase();
  const parsed = path.parse(filename);
  const name = parsed.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '-')     // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens

  return (name || 'image') + `.${ext}`;
}

/**
 * Get converted filename with target format
 */
export function getConvertedFilename(originalName, targetFormat = 'webp', useSeo = false) {
  const ext = targetFormat.toLowerCase() === 'jpeg' ? 'jpg' : targetFormat.toLowerCase();
  if (useSeo) {
    return seoFriendlySlug(originalName, targetFormat);
  }
  const parsed = path.parse(originalName);
  const cleanName = sanitizeFilename(parsed.name);
  return `${cleanName}.${ext}`;
}

/**
 * Backwards compatibility for WebP
 */
export function getWebpFilename(originalName, useSeo = false) {
  return getConvertedFilename(originalName, 'webp', useSeo);
}
