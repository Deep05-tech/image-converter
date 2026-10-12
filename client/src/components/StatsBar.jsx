import React from 'react';
import { Files, CheckCircle2, HardDrive, TrendingDown, TrendingUp } from 'lucide-react';
import { formatBytes } from '../services/api';

export function StatsBar({ stats }) {
  if (stats.totalFiles === 0) return null;

  const isSaving = stats.totalSavedBytes >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-6">
      
      {/* 1. Total Images */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm flex items-center space-x-3.5 transition-colors">
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0">
          <Files className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Queue
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {stats.totalFiles} {stats.totalFiles === 1 ? 'Image' : 'Images'}
          </span>
        </div>
      </div>

      {/* 2. Processed Count */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm flex items-center space-x-3.5 transition-colors">
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Converted
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {stats.completedFiles} / {stats.totalFiles}
          </span>
        </div>
      </div>

      {/* 3. Original Size */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm flex items-center space-x-3.5 transition-colors">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Original Total
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {formatBytes(stats.totalOriginalBytes)}
          </span>
        </div>
      </div>

      {/* 4. Net Storage Savings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm flex items-center space-x-3.5 transition-colors">
        <div className={`p-3 rounded-xl shrink-0 ${
          stats.completedFiles === 0
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            : isSaving
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
        }`}>
          {isSaving ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
        </div>
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Storage Saved
          </span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {stats.completedFiles > 0
              ? `${formatBytes(Math.abs(stats.totalSavedBytes))} (${stats.overallSavingsPercent > 0 ? '-' : '+'}${Math.abs(stats.overallSavingsPercent)}%)`
              : 'Waiting...'}
          </span>
        </div>
      </div>

    </div>
  );
}
