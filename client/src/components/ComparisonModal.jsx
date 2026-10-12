import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeftRight,
  Columns,
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { formatBytes, formatDimensions, triggerFileDownload } from '../services/api';

export function ComparisonModal({ item, onClose }) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side'
  const [origLoaded, setOrigLoaded] = useState(false);
  const [convertedLoaded, setConvertedLoaded] = useState(false);
  const [imgError, setImgError] = useState(null);

  const containerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateSliderPos = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  }, []);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    updateSliderPos(e.clientX || (e.touches && e.touches[0]?.clientX));
  };

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false);
    const handlePointerMove = (e) => {
      if (isDragging) {
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0]?.clientX);
        if (clientX !== undefined) updateSliderPos(clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, updateSliderPos]);

  if (!item || !item.convertedData) return null;

  const { convertedData } = item;
  const isSavingsPositive = convertedData.savingsBytes >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col overflow-hidden transition-colors">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {item.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual Inspection & Spec Comparison
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle: Slider vs Side-by-Side */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer
                  ${viewMode === 'slider'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Slider</span>
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer
                  ${viewMode === 'side-by-side'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Side-by-Side</span>
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300 px-1 min-w-[42px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Stage Container with definite height */}
        <div className="relative w-full h-[440px] sm:h-[480px] md:h-[520px] bg-slate-950 flex items-center justify-center overflow-hidden select-none">
          
          {/* Loading indicator */}
          {(!origLoaded || !convertedLoaded) && !imgError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 text-white/80">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <span className="text-xs font-medium">Loading high-res preview...</span>
            </div>
          )}

          {imgError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-red-400 p-4 text-center">
              <AlertTriangle className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold">{imgError}</span>
            </div>
          )}

          {/* VIEW MODE 1: Interactive Draggable Slider */}
          {viewMode === 'slider' && (
            <div
              ref={containerRef}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              className="relative w-full h-full flex items-center justify-center cursor-ew-resize overflow-hidden"
            >
              {/* Converted WebP (Background Layer - Right side) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                <img
                  src={convertedData.previewUrl}
                  alt="Converted WebP"
                  onLoad={() => setConvertedLoaded(true)}
                  onError={() => setImgError('Failed to load converted image preview')}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  className="select-none pointer-events-none transition-transform duration-75"
                />
              </div>

              {/* Badge Right */}
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg backdrop-blur-md bg-blue-600/90 text-white text-xs font-semibold shadow-lg pointer-events-none">
                Converted {(convertedData.targetFormat || 'webp').toUpperCase()} ({convertedData.mode === 'lossless' ? 'Lossless' : `Q${convertedData.quality}`})
              </div>

              {/* Original Image (Foreground Layer - Left side, clipped) */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden p-4"
                style={{
                  clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                }}
              >
                <img
                  src={item.previewUrl}
                  alt="Original Source"
                  onLoad={() => setOrigLoaded(true)}
                  onError={() => setImgError('Failed to load original image preview')}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  className="select-none pointer-events-none transition-transform duration-75"
                />
              </div>

              {/* Badge Left */}
              <div
                className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg backdrop-blur-md bg-slate-900/90 text-white text-xs font-semibold shadow-lg pointer-events-none"
              >
                Original Image
              </div>

              {/* Draggable Divider Line */}
              <div
                className="absolute top-0 bottom-0 z-30 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.9)] cursor-ew-resize"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-2xl border-2 border-blue-600 flex items-center justify-center text-blue-600 cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Bottom helper text */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-[11px] text-white/80 pointer-events-none z-20">
                Drag the divider to compare pixels
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Side-by-Side View */}
          {viewMode === 'side-by-side' && (
            <div className="w-full h-full grid grid-cols-2 gap-2 p-3">
              {/* Left: Original */}
              <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center overflow-hidden p-3">
                <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/70 text-white text-[11px] font-semibold">
                  Original Image
                </span>
                <img
                  src={item.previewUrl}
                  alt="Original Source"
                  onLoad={() => setOrigLoaded(true)}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  className="select-none transition-transform duration-75"
                />
              </div>

              {/* Right: Converted */}
              <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center overflow-hidden p-3">
                <span className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-blue-600/90 text-white text-[11px] font-semibold">
                  Converted {(convertedData.targetFormat || 'webp').toUpperCase()}
                </span>
                <img
                  src={convertedData.previewUrl}
                  alt="Converted Result"
                  onLoad={() => setConvertedLoaded(true)}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  className="select-none transition-transform duration-75"
                />
              </div>
            </div>
          )}

        </div>

        {/* Specs & Inspection Table */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Original Size</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {formatBytes(convertedData.originalSize)}
              </span>
              <span className="block text-xs text-slate-500 font-mono mt-0.5">
                {formatDimensions(convertedData.originalWidth, convertedData.originalHeight)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{(convertedData.targetFormat || 'webp').toUpperCase()} Output Size</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                {formatBytes(convertedData.convertedSize)}
              </span>
              <span className="block text-xs text-slate-500 font-mono mt-0.5">
                {formatDimensions(convertedData.outputWidth, convertedData.outputHeight)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Actual Net Change</span>
              <span className={`text-base font-bold flex items-center space-x-1 ${
                isSavingsPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                <span>{isSavingsPositive ? '-' : '+'}{Math.abs(convertedData.savingsPercent)}%</span>
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {formatBytes(Math.abs(convertedData.savingsBytes))} {isSavingsPositive ? 'saved' : 'larger'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Compression Mode</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white capitalize truncate">
                {convertedData.mode === 'lossless' ? `Lossless ${(convertedData.targetFormat || 'webp').toUpperCase()}` : `${convertedData.mode} (Q${convertedData.quality})`}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                Sharp Native Engine
              </span>
            </div>

          </div>

          {convertedData.warnings && convertedData.warnings.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{convertedData.warnings.join(' ')}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => triggerFileDownload(convertedData.downloadUrl, convertedData.filename)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {(convertedData.targetFormat || 'webp').toUpperCase()}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
