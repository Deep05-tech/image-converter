import http from 'http';
import fs from 'fs';
import path from 'path';
import sharp from './server/node_modules/sharp/lib/index.js';
import assert from 'assert';

const SERVER_URL = 'http://localhost:5000';

// Helper to create test sample images
async function generateTestImages() {
  const testDir = path.join(process.cwd(), 'test-temp');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  // 1. JPEG image
  const jpgPath = path.join(testDir, 'sample-photo.jpg');
  await sharp({
    create: {
      width: 800,
      height: 600,
      channels: 3,
      background: { r: 70, g: 130, b: 180 }
    }
  }).jpeg({ quality: 90 }).toFile(jpgPath);

  // 2. PNG with transparent alpha channel
  const pngPath = path.join(testDir, 'sample-transparent.png');
  await sharp({
    create: {
      width: 400,
      height: 400,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 0.5 }
    }
  }).png().toFile(pngPath);

  // 3. Corrupted / invalid file
  const corruptPath = path.join(testDir, 'corrupt.jpg');
  fs.writeFileSync(corruptPath, 'This is definitely not an image buffer');

  return { testDir, jpgPath, pngPath, corruptPath };
}

// Multipart POST helper using standard Node fetch
async function postFile(endpoint, filePath, fields = {}) {
  const formData = new FormData();
  if (filePath && fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, path.basename(filePath));
  }
  for (const [k, v] of Object.entries(fields)) {
    formData.append(k, String(v));
  }

  const res = await fetch(`${SERVER_URL}${endpoint}`, {
    method: 'POST',
    body: formData
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  } else {
    const buffer = await res.arrayBuffer();
    return { status: res.status, ok: res.ok, buffer: Buffer.from(buffer), headers: res.headers };
  }
}

async function runTests() {
  console.log('\n=============================================');
  console.log('--- STARTING IMAGE TO WEBP TEST SUITE ---');
  console.log('=============================================\n');

  const { testDir, jpgPath, pngPath, corruptPath } = await generateTestImages();

  try {
    // 1. Health check
    console.log('Test 1: Health check endpoint...');
    const healthRes = await fetch(`${SERVER_URL}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok');
    console.log('  [PASS] Backend is alive and reporting OK\n');

    // 2. Inspect endpoint with valid JPEG
    console.log('Test 2: Inspect JPEG image...');
    const inspectRes = await postFile('/api/inspect', jpgPath);
    assert.strictEqual(inspectRes.status, 200);
    assert.strictEqual(inspectRes.data.format, 'jpeg');
    assert.strictEqual(inspectRes.data.width, 800);
    assert.strictEqual(inspectRes.data.height, 600);
    console.log('  [PASS] Metadata accurately detected (800x600 jpeg)\n');

    // 3. Inspect endpoint with transparent PNG
    console.log('Test 3: Inspect transparent PNG image...');
    const inspectPng = await postFile('/api/inspect', pngPath);
    assert.strictEqual(inspectPng.status, 200);
    assert.strictEqual(inspectPng.data.format, 'png');
    assert.strictEqual(inspectPng.data.hasAlpha, true);
    console.log('  [PASS] PNG transparency accurately detected\n');

    // 4. Reject corrupted / invalid file
    console.log('Test 4: Error handling for corrupted file...');
    const corruptRes = await postFile('/api/inspect', corruptPath);
    assert.strictEqual(corruptRes.status, 400);
    console.log('  [PASS] Corrupted file gracefully rejected with 400 Bad Request\n');

    // 5. Convert Mode 1: Lossless WebP
    console.log('Test 5: Convert PNG to Lossless WebP...');
    const losslessRes = await postFile('/api/convert', pngPath, {
      mode: 'lossless'
    });
    assert.strictEqual(losslessRes.status, 200);
    assert.strictEqual(losslessRes.data.success, true);
    assert.strictEqual(losslessRes.data.data.mode, 'lossless');
    assert.strictEqual(losslessRes.data.data.outputWidth, 400);
    assert.strictEqual(losslessRes.data.data.outputHeight, 400);

    // Verify converted file format is genuine WebP via Sharp preview URL
    const prevFetch = await fetch(`${SERVER_URL}${losslessRes.data.data.previewUrl}`);
    assert.strictEqual(prevFetch.status, 200);
    const prevBuf = Buffer.from(await prevFetch.arrayBuffer());
    const convertedWebpSharp = sharp(prevBuf);
    const webpMeta = await convertedWebpSharp.metadata();
    assert.strictEqual(webpMeta.format, 'webp');
    assert.strictEqual(webpMeta.hasAlpha, true);
    console.log('  [PASS] Lossless WebP generated with verified alpha channel via /api/preview\n');

    // 6. Convert Mode 2 & 3: Lossy Visual & Balanced
    console.log('Test 6: Convert JPEG with Balanced Mode (Quality 85)...');
    const balancedRes = await postFile('/api/convert', jpgPath, {
      mode: 'balanced'
    });
    assert.strictEqual(balancedRes.status, 200);
    assert.strictEqual(balancedRes.data.data.quality, 85);
    console.log(`  [PASS] Balanced WebP created (Size: ${balancedRes.data.data.convertedSize} bytes)\n`);

    // 7. Convert Mode 4: Custom Quality Slider
    console.log('Test 7: Convert JPEG with Custom Quality (Quality 45)...');
    const customRes = await postFile('/api/convert', jpgPath, {
      mode: 'custom',
      quality: 45
    });
    assert.strictEqual(customRes.status, 200);
    assert.strictEqual(customRes.data.data.quality, 45);
    assert(customRes.data.data.convertedSize < balancedRes.data.data.convertedSize, 'Quality 45 must be smaller than Quality 85');
    console.log(`  [PASS] Quality 45 produces smaller file than Quality 85 (${customRes.data.data.convertedSize} vs ${balancedRes.data.data.convertedSize} bytes)\n`);

    // 8. Smart Resizing & Aspect Ratio handling
    console.log('Test 8: Smart Resizing to 400x300 (fit inside)...');
    const resizeRes = await postFile('/api/convert', jpgPath, {
      mode: 'balanced',
      resize: true,
      targetWidth: 400,
      targetHeight: 300,
      fit: 'inside'
    });
    assert.strictEqual(resizeRes.status, 200);
    assert.strictEqual(resizeRes.data.data.outputWidth, 400);
    assert.strictEqual(resizeRes.data.data.outputHeight, 300);
    console.log('  [PASS] Resized to exact requested dimensions\n');

    // 9. SEO Filename slugification
    console.log('Test 9: SEO Filename slugification option...');
    const seoRes = await postFile('/api/convert', jpgPath, {
      mode: 'lossless',
      seoFilename: true
    });
    assert.strictEqual(seoRes.status, 200);
    assert.strictEqual(seoRes.data.data.filename, 'sample-photo.webp');
    console.log(`  [PASS] SEO slug generated: "${seoRes.data.data.filename}"\n`);

    // 10. Single file download
    console.log('Test 10: Individual WebP file download endpoint...');
    const fileId = losslessRes.data.data.id;
    const dlRes = await fetch(`${SERVER_URL}/api/download/${fileId}`);
    assert.strictEqual(dlRes.status, 200);
    assert.strictEqual(dlRes.headers.get('content-type'), 'image/webp');
    const dlBuf = Buffer.from(await dlRes.arrayBuffer());
    const dlMeta = await sharp(dlBuf).metadata();
    assert.strictEqual(dlMeta.format, 'webp');
    console.log('  [PASS] Individual file download served valid image/webp stream\n');

    // 11. Preview endpoint for inline browser comparison
    console.log('Test 11: Inline WebP preview endpoint for comparison...');
    const prevRes = await fetch(`${SERVER_URL}/api/preview/${fileId}`);
    assert.strictEqual(prevRes.status, 200);
    assert.strictEqual(prevRes.headers.get('content-type'), 'image/webp');
    assert.strictEqual(prevRes.headers.get('cache-control'), 'public, max-age=3600');
    console.log('  [PASS] Inline preview served valid stream with cache headers\n');

    // 12. Batch ZIP download
    console.log('Test 12: Batch ZIP generation and download...');
    const zipPayload = {
      fileIds: [losslessRes.data.data.id, balancedRes.data.data.id, customRes.data.data.id]
    };
    const zipRes = await fetch(`${SERVER_URL}/api/download-zip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zipPayload)
    });
    assert.strictEqual(zipRes.status, 200);
    assert.strictEqual(zipRes.headers.get('content-type'), 'application/zip');
    const zipBuffer = Buffer.from(await zipRes.arrayBuffer());
    assert(zipBuffer.length > 500, 'ZIP archive must contain valid bytes');
    // Check ZIP magic header PK\x03\x04
    assert.strictEqual(zipBuffer.subarray(0, 4).toString(), 'PK\x03\x04');
    console.log(`  [PASS] Batch ZIP generated with valid PK zip header (${zipBuffer.length} bytes)\n`);

    // 13. Multi-format: Convert transparent PNG to JPEG
    console.log('Test 13: Convert transparent PNG to JPEG (with transparency flattening)...');
    const pngToJpgRes = await postFile('/api/convert', pngPath, {
      targetFormat: 'jpeg',
      mode: 'balanced'
    });
    assert.strictEqual(pngToJpgRes.status, 200);
    assert.strictEqual(pngToJpgRes.data.data.targetFormat, 'jpeg');
    assert.strictEqual(pngToJpgRes.data.data.filename.endsWith('.jpg'), true);
    console.log('  [PASS] Transparent PNG successfully converted to JPEG\n');

    // 14. Multi-format: Convert JPEG to Lossless PNG
    console.log('Test 14: Convert JPEG to Lossless PNG...');
    const jpgToPngRes = await postFile('/api/convert', jpgPath, {
      targetFormat: 'png',
      mode: 'lossless'
    });
    assert.strictEqual(jpgToPngRes.status, 200);
    assert.strictEqual(jpgToPngRes.data.data.targetFormat, 'png');
    assert.strictEqual(jpgToPngRes.data.data.filename.endsWith('.png'), true);
    console.log('  [PASS] JPEG successfully converted to PNG\n');

    // 15. Multi-format: Convert to AVIF
    console.log('Test 15: Convert JPEG to AVIF...');
    const jpgToAvifRes = await postFile('/api/convert', jpgPath, {
      targetFormat: 'avif',
      mode: 'balanced'
    });
    assert.strictEqual(jpgToAvifRes.status, 200);
    assert.strictEqual(jpgToAvifRes.data.data.targetFormat, 'avif');
    assert.strictEqual(jpgToAvifRes.data.data.filename.endsWith('.avif'), true);
    console.log('  [PASS] JPEG successfully converted to AVIF\n');

    console.log('=============================================');
    console.log('--- ALL 15 TESTS PASSED SUCCESSFULLY! ---');
    console.log('=============================================\n');
  } finally {
    // Cleanup test temp files
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

runTests().catch(err => {
  console.error('\n[FAIL] Test suite error:', err);
  process.exit(1);
});
