import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useConversionQueue } from './hooks/useConversionQueue';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsBar } from './components/StatsBar';
import { ImageQueue } from './components/ImageQueue';
import { ActionBar } from './components/ActionBar';
import { ComparisonModal } from './components/ComparisonModal';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  CheckCircle,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

const DEFAULT_OPTIONS = {
  targetFormat: 'webp',
  mode: 'lossless',
  quality: 85,
  resize: false,
  presetName: 'Original Size',
  targetWidth: '',
  targetHeight: '',
  lockAspectRatio: true,
  fit: 'inside',
  allowEnlarge: false,
  seoFilename: false,
  keepMetadata: false
};

export function App() {
  const { isDark, toggleTheme } = useTheme();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [selectedForCompare, setSelectedForCompare] = useState(null);

  const {
    items,
    isProcessing,
    addFiles,
    removeFile,
    clearAll,
    convertSingle,
    convertAll,
    cancelQueue,
    stats
  } = useConversionQueue();

  const handleResetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        activeCount={items.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upload Dropzone */}
        <section className="mb-8">
          <Dropzone
            onFilesSelected={addFiles}
            totalFiles={items.length}
          />
        </section>

        {/* Conversion Settings Panel */}
        <section className="mb-6">
          <SettingsPanel
            options={options}
            onOptionsChange={setOptions}
            onReset={handleResetOptions}
          />
        </section>

        {/* Stats Summary Bar */}
        <StatsBar stats={stats} />

        {/* Image Queue List */}
        <ImageQueue
          items={items}
          onConvertSingle={convertSingle}
          onRemove={removeFile}
          onCompare={setSelectedForCompare}
          options={options}
        />

        {/* Empty State / Feature Explanations when no images loaded */}
        {items.length === 0 && (
          <section className="mt-12 pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Engineered for Modern Web & SEO Standards
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                WebP delivers superior lossless and lossy compression for web images, boosting Google Core Web Vitals and site load performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  True Lossless Precision
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Decoded pixels, alpha transparency channels, and color profiles remain mathematically exact. Zero blurring or compression artifacts.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  High-Speed Batch Engine
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Processes batches of 100+ images concurrently using Sharp’s native libvips pipeline with bounded memory concurrency and single-click ZIP export.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <Search className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  SEO & WordPress Ready
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Automatic clean URL slug generation, EXIF rotation correction, custom dimensions, and standard web presets for banner and product media.
                </p>
              </div>

            </div>
          </section>
        )}

        {/* Sticky Action Bar */}
        <ActionBar
          items={items}
          isProcessing={isProcessing}
          onConvertAll={convertAll}
          onCancelQueue={cancelQueue}
          onClearAll={clearAll}
          options={options}
        />

      </main>

      {/* Before / After Draggable Comparison Modal */}
      {selectedForCompare && (
        <ComparisonModal
          item={selectedForCompare}
          onClose={() => setSelectedForCompare(null)}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>Image to WebP Converter • Powered by Sharp native image processing • Privacy-first local processing</p>
      </footer>

    </div>
  );
}

export default App;
