import React, { useState } from 'react';
import { ImageItem } from './ImageItem';
import { Layers, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export function ImageQueue({
  items,
  onConvertSingle,
  onRemove,
  onCompare,
  options
}) {
  const [filter, setFilter] = useState('all');

  if (items.length === 0) return null;

  const filteredItems = items.filter(it => {
    if (filter === 'completed') return it.status === 'completed';
    if (filter === 'pending') return it.status === 'pending' || it.status === 'converting';
    if (filter === 'error') return it.status === 'error';
    return true;
  });

  const countCompleted = items.filter(it => it.status === 'completed').length;
  const countPending = items.filter(it => it.status === 'pending' || it.status === 'converting').length;
  const countError = items.filter(it => it.status === 'error').length;

  return (
    <div className="my-8">
      
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Image Queue</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {items.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Preview, convert individually, inspect savings, and compare side-by-side
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer
              ${filter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer
              ${filter === 'completed'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            Done ({countCompleted})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer
              ${filter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            Pending ({countPending})
          </button>
          {countError > 0 && (
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer
                ${filter === 'error'
                  ? 'bg-red-500 text-white shadow-xs font-semibold'
                  : 'text-red-600 dark:text-red-400'
                }`}
            >
              Failed ({countError})
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <ImageItem
            key={item.id}
            item={item}
            onConvertSingle={onConvertSingle}
            onRemove={onRemove}
            onCompare={onCompare}
            options={options}
          />
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No images match current filter.
          </div>
        )}
      </div>

    </div>
  );
}
