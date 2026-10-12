import React from 'react';
import { Sun, Moon, Sparkles, Layers } from 'lucide-react';

export function Header({ isDark, toggleTheme, activeCount }) {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Image to WebP Converter
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50">
                PRO Sharp Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Convert Images to WebP Without Compromising Quality
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {activeCount > 0 && (
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{activeCount} images in queue</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark / Light theme"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

      </div>
    </header>
  );
}
