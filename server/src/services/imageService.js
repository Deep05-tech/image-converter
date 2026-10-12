import sharp from 'sharp';

/**
 * Validate and inspect image metadata
 */
export async function inspectImage(filePathOrBuffer) {
  try {
    const image = sharp(filePathOrBuffer);
    const metadata = await image.metadata();

    if (!metadata.format) {
      throw new Error('Unsupported or unrecognizable image format');
    }

    return {
      isValid: true,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      hasAlpha: metadata.hasAlpha || false,
      space: metadata.space,
      channels: metadata.channels,
      isAnimated: (metadata.pages && metadata.pages > 1) || false,
      pages: metadata.pages || 1,
      orientation: metadata.orientation || 1
    };
  } catch (err) {
    return {
      isValid: false,
      error: `Invalid or corrupted image: ${err.message}`
    };
  }
}

/**
 * Convert image with Sharp to target format (WebP, PNG, JPEG, AVIF, TIFF, GIF)
 */
export async function convertImage(input, options = {}) {
  const {
    targetFormat = 'webp',
    mode = 'lossless',
    quality = 85,
    keepMetadata = false,
    resize = false,
    targetWidth = null,
    targetHeight = null,
    fit = 'inside',
    allowEnlarge = false
  } = options;

  let pipeline = sharp(input);

  // Auto-rotate based on EXIF orientation first
  pipeline = pipeline.rotate();

  // Inspect source metadata
  const meta = await pipeline.metadata();
  if (!meta.format) {
    throw new Error('Failed to decode image metadata');
  }

  const warnings = [];
  if (meta.pages && meta.pages > 1) {
    warnings.push(`Animated source detected (${meta.pages} frames). Extracted primary frame for static conversion.`);
  }

  // Handle resizing if requested
  if (resize && (targetWidth || targetHeight)) {
    const width = targetWidth ? parseInt(targetWidth, 10) : undefined;
    const height = targetHeight ? parseInt(targetHeight, 10) : undefined;

    pipeline = pipeline.resize({
      width,
      height,
      fit: fit || 'inside',
      withoutEnlargement: !allowEnlarge,
      background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent letterbox for contain
    });
  }

  // Preserve ICC profile and metadata if requested
  if (keepMetadata) {
    pipeline = pipeline.withMetadata();
  }

  const fmt = targetFormat.toLowerCase();
  const q = Math.max(1, Math.min(100, parseInt(quality, 10) || 85));

  let outputMime = 'image/webp';

  switch (fmt) {
    case 'jpeg':
    case 'jpg': {
      outputMime = 'image/jpeg';
      // Flatten transparency to white background if source has alpha
      if (meta.hasAlpha) {
        pipeline = pipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
        warnings.push('Transparency flattened onto white background for JPEG format.');
      }
      const jpegQuality = mode === 'max_quality' ? 95 : (mode === 'balanced' ? 85 : q);
      pipeline = pipeline.jpeg({
        quality: jpegQuality,
        mozjpeg: true,
        chromaSubsampling: jpegQuality >= 90 ? '4:4:4' : '4:2:0'
      });
      break;
    }

    case 'png': {
      outputMime = 'image/png';
      if (mode === 'lossless') {
        pipeline = pipeline.png({ compressionLevel: 9, effort: 7 });
      } else {
        const pngQuality = mode === 'max_quality' ? 95 : (mode === 'balanced' ? 85 : q);
        pipeline = pipeline.png({ quality: pngQuality, compressionLevel: 8 });
      }
      break;
    }

    case 'avif': {
      outputMime = 'image/avif';
      if (mode === 'lossless') {
        pipeline = pipeline.avif({ lossless: true, effort: 5 });
      } else {
        const avifQuality = mode === 'max_quality' ? 90 : (mode === 'balanced' ? 75 : Math.round(q * 0.9));
        pipeline = pipeline.avif({ quality: avifQuality, effort: 4 });
      }
      break;
    }

    case 'tiff': {
      outputMime = 'image/tiff';
      pipeline = pipeline.tiff({
        quality: mode === 'lossless' ? 100 : q,
        compression: 'lzw'
      });
      break;
    }

    case 'gif': {
      outputMime = 'image/gif';
      pipeline = pipeline.gif({ effort: 7 });
      break;
    }

    case 'webp':
    default: {
      outputMime = 'image/webp';
      let webpOptions = {};
      if (mode === 'lossless') {
        webpOptions = {
          lossless: true,
          effort: 6,
          alphaQuality: 100
        };
      } else if (mode === 'max_quality') {
        webpOptions = {
          lossless: false,
          quality: 95,
          effort: 5,
          smartSubsample: true
        };
      } else if (mode === 'balanced') {
        webpOptions = {
          lossless: false,
          quality: 85,
          effort: 4,
          smartSubsample: true
        };
      } else {
        webpOptions = {
          lossless: false,
          quality: q,
          effort: 4,
          smartSubsample: true
        };
      }
      pipeline = pipeline.webp(webpOptions);
      break;
    }
  }

  // Execute processing
  const { data: outputBuffer, info } = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: outputBuffer,
    info: {
      format: info.format,
      targetFormat: fmt,
      mimeType: outputMime,
      width: info.width,
      height: info.height,
      size: info.size,
      channels: info.channels,
      mode,
      quality: mode === 'lossless' ? 100 : (mode === 'max_quality' ? 95 : (mode === 'balanced' ? 85 : q)),
      isLossless: mode === 'lossless',
      warnings
    }
  };
}

/**
 * Backwards compatibility for convertToWebp
 */
export async function convertToWebp(input, options = {}) {
  return convertImage(input, { ...options, targetFormat: 'webp' });
}
