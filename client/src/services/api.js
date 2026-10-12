/**
 * Format bytes into human-readable string
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '-';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${val} ${sizes[i]}`;
}

/**
 * Format dimension string
 */
export function formatDimensions(w, h) {
  if (!w || !h) return 'Auto';
  return `${w} × ${h}px`;
}

/**
 * Inspect image file with server Sharp engine
 */
export async function inspectImageFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/inspect', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to inspect image');
  }

  return res.json();
}

/**
 * Convert image file via backend API
 */
export async function convertImageFile(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('targetFormat', options.targetFormat || 'webp');
  formData.append('mode', options.mode || 'lossless');
  formData.append('quality', options.quality || 85);
  formData.append('keepMetadata', String(Boolean(options.keepMetadata)));
  formData.append('resize', String(Boolean(options.resize)));
  if (options.resize) {
    if (options.targetWidth) formData.append('targetWidth', String(options.targetWidth));
    if (options.targetHeight) formData.append('targetHeight', String(options.targetHeight));
    formData.append('fit', options.fit || 'inside');
    formData.append('allowEnlarge', String(Boolean(options.allowEnlarge)));
  }
  formData.append('seoFilename', String(Boolean(options.seoFilename)));

  const res = await fetch('/api/convert', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Conversion failed');
  }

  const result = await res.json();
  return result.data;
}

/**
 * Download converted images batch as a ZIP
 */
export async function downloadZipArchive(fileIds, archiveName = 'converted-webp-images.zip') {
  if (!fileIds || fileIds.length === 0) {
    throw new Error('No files selected for download');
  }

  const res = await fetch('/api/download-zip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileIds })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate ZIP archive');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = archiveName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Trigger browser download for a single converted WebP
 */
export function triggerFileDownload(downloadUrl, filename) {
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
