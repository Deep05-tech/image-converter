import React, { useState } from 'react';
import { Play, Download, Trash2, XCircle, Loader2, Archive } from 'lucide-react';
import { downloadZipArchive } from '../services/api';

export function ActionBar({
  items,
  isProcessing,
  onConvertAll,
  onCancelQueue,
  onClearAll,
  options
}) {
  const [isZipping, setIsZipping] = useState(false);
  const [zipError, setZipError] = useState(null);

  if (items.length === 0) return null;

  const completedItems = items.filter(it => it.status === 'completed' && it.convertedData);
  const pendingItems = items.filter(it => it.status === 'pending' || it.status === 'error');

  const handleDownloadZip = async () => {
    if (completedItems.length === 0) return;
    setIsZipping(true);
    setZipError(null);

    try {
      const fileIds = completedItems.map(it => it.convertedData.id);
      await downloadZipArchive(fileIds, 'converted-webp-images.zip');
    } catch (err) {
      setZipError(err.message || 'Failed to download ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="sticky bottom-6 z-20 mt-8">
      <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-xl shadow-slate-900/10 flex flex-wrap items-center justify-between gap-3 transition-colors">
        
        {/* Left: Quick status summary */}
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-white">
            {completedItems.length} of {items.length}
          </span> converted
          {pendingItems.length > 0 && (
            <span className="text-slate-400 dark:text-slate-500 ml-1.5">
              ({pendingItems.length} awaiting conversion)
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Clear All */}
          <button
            onClick={onClearAll}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer disabled:opacity-50"
            title="Clear all images"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>

          {/* Cancel queue button if processing */}
          {isProcessing ? (
            <button
              onClick={onCancelQueue}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Queue</span>
            </button>
          ) : (
            /* Convert All Button */
            pendingItems.length > 0 && (
              <button
                onClick={() => onConvertAll(options)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition cursor-pointer transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Convert All ({pendingItems.length})</span>
              </button>
            )
          )}

          {/* Download All as ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={completedItems.length === 0 || isZipping}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer transform active:scale-95
              ${completedItems.length > 0 && !isZipping
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            title={completedItems.length === 0 ? 'Convert images first to download ZIP' : 'Download all converted WebP files in a single ZIP'}
          >
            {isZipping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Archive className="w-4 h-4" />
            )}
            <span>
              {isZipping ? 'Archiving...' : `Download All (ZIP)`}
            </span>
          </button>

        </div>

      </div>

      {zipError && (
        <div className="max-w-4xl mx-auto mt-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 text-xs text-center">
          {zipError}
        </div>
      )}
    </div>
  );
}
