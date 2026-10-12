import React from 'react';
import {
  Download,
  Trash2,
  RotateCw,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { formatBytes, formatDimensions, triggerFileDownload } from '../services/api';

export function ImageItem({
  item,
  onConvertSingle,
  onRemove,
  onCompare,
  options
}) {
  const isPending = item.status === 'pending';
  const isConverting = item.status === 'converting';
  const isCompleted = item.status === 'completed';
  const isError = item.status === 'error';

  const ext = item.name.split('.').pop()?.toUpperCase() || 'IMG';

  return (
    <div className={`group rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
      ${isCompleted
        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
        : isError
          ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
          : isConverting
            ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Left: Thumbnail & Image Info */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        
        {/* Thumbnail Preview */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
          <img
            src={item.previewUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-black/70 text-white backdrop-blur-xs">
            {ext}
          </span>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={item.name}>
              {item.name}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Original: <strong className="font-semibold text-slate-700 dark:text-slate-300">{formatBytes(item.size)}</strong></span>
            <span>•</span>
            <span className="font-mono">{formatDimensions(item.width, item.height)}</span>
          </div>

          {/* Converted Result Details */}
          {isCompleted && item.convertedData && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <FileCheck className="w-3.5 h-3.5" />
                <span>{(item.convertedData.targetFormat || 'webp').toUpperCase()}: {formatBytes(item.convertedData.convertedSize)}</span>
              </span>

              {item.convertedData.savingsBytes >= 0 ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <TrendingDown className="w-3 h-3" />
                  <span>-{Math.abs(item.convertedData.savingsPercent)}% ({formatBytes(item.convertedData.savingsBytes)} saved)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{Math.abs(item.convertedData.savingsPercent)}% (Lossless mode)</span>
                </span>
              )}

              {options.resize && (
                <span className="text-[11px] font-mono text-slate-500">
                  Output: {formatDimensions(item.convertedData.outputWidth, item.convertedData.outputHeight)}
                </span>
              )}
            </div>
          )}

          {/* Error Message */}
          {isError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{item.error || 'Conversion failed'}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Status Pill & Action Buttons */}
      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
        
        {/* Status Indicator */}
        {isPending && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Ready
          </span>
        )}

        {isConverting && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Converting...</span>
          </span>
        )}

        {/* Completed Actions */}
        {isCompleted && item.convertedData && (
          <>
            <button
              onClick={() => onCompare(item)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Compare before and after"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Compare</span>
            </button>

            <button
              onClick={() => triggerFileDownload(item.convertedData.downloadUrl, item.convertedData.filename)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition cursor-pointer"
              title={`Download ${item.convertedData.filename}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </>
        )}

        {/* Retry Button */}
        {(isError || isCompleted) && (
          <button
            onClick={() => onConvertSingle(item.id, options)}
            disabled={isConverting}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Re-convert with current settings"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}

        {/* Convert Single Button for Pending */}
        {isPending && (
          <button
            onClick={() => onConvertSingle(item.id, options)}
            disabled={isConverting}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            Convert
          </button>
        )}

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={isConverting}
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
          title="Remove from queue"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
