import React from 'react';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Zap,
  Maximize2,
  Lock,
  Unlock,
  Info,
  RotateCcw,
  Check,
  FileType
} from 'lucide-react';

const TARGET_FORMATS = [
  { id: 'webp', name: 'WebP', desc: 'Modern web standard • 30-70% smaller • Lossless & Lossy' },
  { id: 'png', name: 'PNG', desc: 'Lossless raster • Preserves transparent alpha channel' },
  { id: 'jpeg', name: 'JPEG', desc: 'Universal photographic format • High compatibility' },
  { id: 'avif', name: 'AVIF', desc: 'Next-gen extreme compression • High dynamic range' },
  { id: 'tiff', name: 'TIFF', desc: 'Archival & print quality • Uncompressed/LZW lossless' }
];

const PRESETS = [
  { label: 'Original Size', width: null, height: null },
  { label: '1920 × 1080 (Hero / Desktop)', width: 1920, height: 1080 },
  { label: '1536 × 667 (Web Banner)', width: 1536, height: 667 },
  { label: '1080 × 1350 (Social Portrait)', width: 1080, height: 1350 },
  { label: '1080 × 1920 (Story / 9:16)', width: 1080, height: 1920 },
  { label: '800 × 800 (Product Square)', width: 800, height: 800 },
  { label: 'Custom Dimensions', width: '', height: '' }
];

export function SettingsPanel({ options, onOptionsChange, onReset }) {
  const currentFormat = options.targetFormat || 'webp';

  const handleFormatChange = (fmtId) => {
    // If switching to JPEG, JPEG doesn't support lossless mode
    let newMode = options.mode;
    if (fmtId === 'jpeg' && newMode === 'lossless') {
      newMode = 'max_quality';
    }
    onOptionsChange({
      ...options,
      targetFormat: fmtId,
      mode: newMode
    });
  };

  const handleModeSelect = (mode) => {
    onOptionsChange({ ...options, mode });
  };

  const handlePresetSelect = (preset) => {
    if (preset.width === null && preset.height === null) {
      onOptionsChange({
        ...options,
        resize: false,
        presetName: preset.label,
        targetWidth: '',
        targetHeight: ''
      });
    } else if (preset.width === '' && preset.height === '') {
      onOptionsChange({
        ...options,
        resize: true,
        presetName: 'Custom',
      });
    } else {
      onOptionsChange({
        ...options,
        resize: true,
        presetName: preset.label,
        targetWidth: preset.width,
        targetHeight: preset.height
      });
    }
  };

  const handleWidthChange = (val) => {
    const width = val ? parseInt(val, 10) : '';
    let newHeight = options.targetHeight;

    if (options.lockAspectRatio && width && options.targetWidth && options.targetHeight) {
      const ratio = options.targetHeight / options.targetWidth;
      newHeight = Math.round(width * ratio);
    }

    onOptionsChange({
      ...options,
      resize: true,
      targetWidth: width,
      targetHeight: newHeight,
      presetName: 'Custom'
    });
  };

  const handleHeightChange = (val) => {
    const height = val ? parseInt(val, 10) : '';
    let newWidth = options.targetWidth;

    if (options.lockAspectRatio && height && options.targetWidth && options.targetHeight) {
      const ratio = options.targetWidth / options.targetHeight;
      newWidth = Math.round(height * ratio);
    }

    onOptionsChange({
      ...options,
      resize: true,
      targetWidth: newWidth,
      targetHeight: height,
      presetName: 'Custom'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Conversion & Optimization Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Convert from any source format into WebP, PNG, JPEG, AVIF, or TIFF
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset to recommended defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 1. Target Format Selection */}
      <div className="mb-7">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center space-x-1.5">
          <FileType className="w-3.5 h-3.5 text-blue-600" />
          <span>1. Target Output Format</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {TARGET_FORMATS.map((fmt) => {
            const isSelected = currentFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => handleFormatChange(fmt.id)}
                className={`relative rounded-xl p-3.5 text-left border-2 transition-all cursor-pointer flex flex-col justify-between
                  ${isSelected
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
                  }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      {fmt.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {fmt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Four Conversion Modes */}
      <div className="mb-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          2. Compression & Quality Mode ({currentFormat.toUpperCase()})
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Mode 1: Lossless (Disabled for JPEG) */}
          <div
            onClick={() => currentFormat !== 'jpeg' && handleModeSelect('lossless')}
            className={`relative rounded-xl p-4 border-2 transition-all duration-200 flex flex-col justify-between
              ${currentFormat === 'jpeg'
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40'
                : options.mode === 'lossless'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm cursor-pointer'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 cursor-pointer'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {currentFormat === 'jpeg' ? 'Lossless (N/A)' : `Lossless ${currentFormat.toUpperCase()}`}
                  </span>
                </div>
                {currentFormat !== 'jpeg' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                {currentFormat === 'jpeg'
                  ? 'JPEG is inherently a lossy format and does not support mathematical lossless compression.'
                  : '100% exact mathematical pixel preservation. Zero compression artifacts. Flawless transparency.'}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
              <span>{currentFormat === 'jpeg' ? 'Not supported' : 'Quality: 100% (Lossless)'}</span>
              {options.mode === 'lossless' && currentFormat !== 'jpeg' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </div>
          </div>

          {/* Mode 2: Maximum Visual Quality */}
          <div
            onClick={() => handleModeSelect('max_quality')}
            className={`relative rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 flex flex-col justify-between
              ${options.mode === 'max_quality'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Max Visual Quality</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Quality 95. Visually indistinguishable from source. Ideal for photography and hero banners.
              </p>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
              <span>Quality: 95</span>
              {options.mode === 'max_quality' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </div>
          </div>

          {/* Mode 3: Balanced Optimization */}
          <div
            onClick={() => handleModeSelect('balanced')}
            className={`relative rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 flex flex-col justify-between
              ${options.mode === 'balanced'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Balanced (Web/SEO)</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Quality 85. Sweet spot balancing crisp sharpness with 40-70% file size reduction.
              </p>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
              <span>Quality: 85</span>
              {options.mode === 'balanced' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </div>
          </div>

          {/* Mode 4: Custom Quality */}
          <div
            onClick={() => handleModeSelect('custom')}
            className={`relative rounded-xl p-4 cursor-pointer border-2 transition-all duration-200 flex flex-col justify-between
              ${options.mode === 'custom'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
              }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400">
                  <Sliders className="w-4 h-4" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Custom Quality</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Fine-tune compression factor from 1 to 100 to fit strict page speed or storage targets.
              </p>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
              <span>Quality: {options.quality || 80}</span>
              {options.mode === 'custom' && <Check className="w-3.5 h-3.5 text-blue-600" />}
            </div>
          </div>

        </div>

        {/* Custom Quality Slider */}
        {options.mode === 'custom' && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Quality Factor: <span className="text-blue-600 dark:text-blue-400 font-bold">{options.quality}%</span>
              </span>
              <span className="text-[11px] text-slate-500">
                1 (Maximum Compression) — 100 (Minimum Lossy Compression)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={options.quality}
              onChange={(e) => onOptionsChange({ ...options, quality: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 flex items-center space-x-1">
              <Info className="w-3 h-3 shrink-0 text-blue-500" />
              <span>Note: Quality 100 in lossy mode is not mathematically lossless. Select "Lossless" for exact pixel parity.</span>
            </p>
          </div>
        )}

        {/* JPEG note */}
        {currentFormat === 'jpeg' && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold">JPEG Conversion Note:</span> JPEG does not support alpha transparency. Any transparent areas from source images (e.g. PNG, WebP) will be automatically flattened onto a clean white background.
            </div>
          </div>
        )}
      </div>

      {/* 3. Smart Image Resizing Section */}
      <div className="mb-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Maximize2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              3. Smart Image Resizing (Optional)
            </label>
          </div>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.resize}
              onChange={(e) => onOptionsChange({ ...options, resize: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-xs font-medium text-slate-600 dark:text-slate-400">
              {options.resize ? 'Resizing Enabled' : 'Original Dimensions'}
            </span>
          </label>
        </div>

        {options.resize && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-4 animate-fadeIn">
            <div>
              <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Standard Web Dimension Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => {
                  const isSelected = options.presetName === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border
                        ${isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Target Width (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g. 1920"
                  value={options.targetWidth || ''}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Target Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g. 1080"
                  value={options.targetHeight || ''}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onOptionsChange({ ...options, lockAspectRatio: !options.lockAspectRatio })}
                  className={`w-full py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer
                    ${options.lockAspectRatio
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {options.lockAspectRatio ? <Lock className="w-3.5 h-3.5 text-blue-600" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{options.lockAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Resizing Fit Strategy
                </label>
                <select
                  value={options.fit || 'inside'}
                  onChange={(e) => onOptionsChange({ ...options, fit: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="inside">Fit Inside (Preserves entire image, no crop)</option>
                  <option value="cover">Cover (Fill exact dimensions, crops edges)</option>
                  <option value="contain">Contain (Letterbox with transparent borders)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!options.allowEnlarge}
                    onChange={(e) => onOptionsChange({ ...options, allowEnlarge: !e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Prevent upscaling (Do not enlarge smaller images)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Advanced & SEO Options */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          4. Metadata & SEO Formatting
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start space-x-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={options.seoFilename}
              onChange={(e) => onOptionsChange({ ...options, seoFilename: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0"
            />
            <div>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                SEO-Friendly Filenames
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Sanitizes, lowercases, and kebab-cases filenames (e.g., <code className="text-blue-600 dark:text-blue-400">my-photo-1.{currentFormat === 'jpeg' ? 'jpg' : currentFormat}</code>).
              </span>
            </div>
          </label>

          <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start space-x-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={options.keepMetadata}
              onChange={(e) => onOptionsChange({ ...options, keepMetadata: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0"
            />
            <div>
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Preserve EXIF & ICC Metadata
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Keeps camera metadata and embedded color profiles. Uncheck to strip metadata for minimal byte size.
              </span>
            </div>
          </label>

        </div>
      </div>

    </div>
  );
}
