import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';

export function Dropzone({ onFilesSelected, totalFiles }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateAndAddFiles = (files) => {
    setErrorMessage(null);
    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isImageMime = file.type && (file.type.startsWith('image/') || file.type.includes('octet-stream'));
      const isKnownImageExt = [
        'jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif',
        'tiff', 'tif', 'bmp', 'gif', 'svg', 'ico', 'raw', 'cr2',
        'nef', 'arw', 'dng', 'psd', 'jfif', 'pjpeg', 'pjp'
      ].includes(ext);

      // Support converting from ANY format
      if (isImageMime || isKnownImageExt || file.type === '') {
        if (file.size > 50 * 1024 * 1024) {
          invalidFiles.push(`${file.name} exceeds 50MB limit`);
        } else {
          validFiles.push(file);
        }
      } else {
        invalidFiles.push(`${file.name} is not recognized as an image`);
      }
    });

    if (invalidFiles.length > 0) {
      setErrorMessage(`${invalidFiles.length} file(s) skipped: ${invalidFiles[0]}`);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden p-8 sm:p-12 text-center
          ${isDragOver
            ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 scale-[1.005] shadow-lg shadow-blue-500/10'
            : 'border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/60 dark:hover:bg-slate-800/60'
          }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.heic,.heif,.tiff,.tif,.bmp,.gif,.svg,.ico,.raw,.psd"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 shadow-sm
            ${isDragOver
              ? 'bg-blue-600 text-white'
              : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Upload images from any format
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            Drag & drop or <span className="text-blue-600 dark:text-blue-400 font-medium hover:underline">browse files</span> from your device
          </p>

          {/* Formats badges */}
          <div className="flex flex-wrap justify-center items-center gap-1.5 mb-4">
            {['JPG', 'PNG', 'WEBP', 'AVIF', 'HEIC', 'TIFF', 'BMP', 'SVG', 'GIF', '+ ANY'].map((fmt) => (
              <span
                key={fmt}
                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
              >
                {fmt}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Convert from any format to WebP, PNG, JPEG, AVIF, or TIFF • Up to 150 images per batch
          </p>
        </div>

        {totalFiles > 0 && (
          <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>{totalFiles} file{totalFiles > 1 ? 's' : ''} currently loaded</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
