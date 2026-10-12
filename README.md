# Image to WebP Converter — Premium High-Performance Web Application

A production-grade, fast, and modern web application engineered to convert images into **WebP** format without compromising image quality. Built for digital marketing agencies, SEO specialists, graphic designers, and WordPress developers.

---

## ⚡ Highlights & Key Capabilities

- **True Lossless WebP Compression (Default)**: Preserves 100% of decoded pixel values, transparency channels, and color profiles without compression artifacts.
- **4 Professional Conversion Modes**:
  1. **Lossless WebP (Default)**: Mathematical pixel preservation.
  2. **Maximum Visual Quality (Lossy 95)**: Imperceptible loss for hero banners & photography.
  3. **Balanced Optimization (Lossy 85)**: Ideal for web & SEO with 40–70% typical byte savings.
  4. **Custom Quality (1–100)**: Fine-grained quality slider with live indicator.
- **Interactive Before & After Comparison**: Draggable split-screen inspection slider with zoom controls and side-by-side spec sheets.
- **Smart Image Resizing**:
  - Keep original dimensions by default.
  - Aspect ratio lock / unlock.
  - Standard presets: `1920×1080`, `1536×667`, `1080×1350`, `1080×1920`, `800×800`, or Custom.
  - Fit strategies: Fit Inside (no crop), Cover (crop center), Contain (letterbox).
  - Upscaling prevention toggle.
- **Bulk Queue Processing**: Convert 100+ images per batch safely with bounded concurrency.
- **Download Flexibility**: Single WebP download or one-click **Batch ZIP download** with duplicate collision resolution.
- **SEO-Friendly Filenames**: Optional automatic kebab-casing and sanitization (e.g. `product-photo-1.webp`).
- **Dark & Light Mode**: Smooth theme toggle with system preference detection and local storage persistence.
- **Privacy-First & Zero Paid APIs**: Runs 100% locally with open-source libvips/Sharp; images are never sent to external services.
- **Automated Temp File Cleanup**: Automatic background garbage collector prunes converted temp files.

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Lucide React
- **Backend**: Node.js + Express
- **Image Processing**: Sharp (libvips native C++ pipeline)
- **ZIP Packaging**: Archiver
- **Concurrency Management**: p-limit

---

## 🚀 Quick Start Guide (Beginner Friendly)

### 1. Prerequisites
Ensure you have Node.js (v18 or higher) installed on your system. Check with:
```bash
node -v
npm -v
```

### 2. Install Dependencies
Run the install command from the root directory to install both server and client packages:
```bash
npm run install:all
```

### 3. Start the Development Server
Launch both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:3000`) simultaneously:
```bash
npm run dev
```

### 4. Open in Your Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Running the Automated Test Suite

A comprehensive test suite is included that validates image conversions, alpha transparency, aspect ratio preservation, resizing, corrupted file handling, and ZIP archiving:

1. In one terminal, start the backend:
   ```bash
   npm run dev:server
   ```
2. In another terminal, run the test runner:
   ```bash
   node test-suite.js
   ```

All 11 tests will execute and confirm end-to-end functionality.

---

## 🏗️ Production Build

To build the client application for production deployment:
```bash
npm run build
```
The optimized static build will be placed in `client/dist`.

To start the production server:
```bash
npm start
```

---

## 📂 Project Structure

```
Image-converter/
├── package.json              # Root scripts (dev, build, install:all)
├── test-suite.js             # Automated end-to-end test runner
├── README.md                 # Documentation
├── server/                   # Node.js + Express backend
│   ├── package.json
│   ├── uploads/              # Isolated temporary conversion cache
│   └── src/
│       ├── server.js         # Express app entry point
│       ├── config.js         # Server configurations & limits
│       ├── routes/
│       │   └── api.js        # /convert, /inspect, /download, /download-zip
│       ├── services/
│       │   ├── imageService.js # Sharp conversion & resizing pipeline
│       │   └── queueService.js # Bounded concurrency controller
│       └── utils/
│           ├── fileCleaner.js# Automatic TTL cache cleanup
│           └── sanitize.js   # Filename sanitation & SEO slugifier
└── client/                   # React + Vite + Tailwind CSS frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx           # Main application view
        ├── main.jsx
        ├── index.css         # Tailwind styles & theme variables
        ├── components/
        │   ├── Header.jsx           # App bar & theme toggle
        │   ├── Dropzone.jsx         # Drag-and-drop zone with format validation
        │   ├── SettingsPanel.jsx    # 4 modes, quality slider, resize presets
        │   ├── StatsBar.jsx         # Real storage savings & count cards
        │   ├── ImageQueue.jsx       # Batch queue management & filters
        │   ├── ImageItem.jsx        # Row item with thumbnail, stats & actions
        │   ├── ComparisonModal.jsx  # Draggable before/after slider & zoom
        │   └── ActionBar.jsx        # Convert All, Download ZIP, Clear All
        ├── hooks/
        │   ├── useTheme.js          # Dark/Light mode manager
        │   └── useConversionQueue.js# Queue state & concurrent processor
        └── services/
            └── api.js               # Client API helpers & download triggers
```

---

## 🔒 Security & Data Integrity

- **Server-Side Verification**: File headers and magic bytes are inspected by Sharp; renamed or corrupted files are caught and handled gracefully.
- **Bounded Concurrency**: Queue processing uses `p-limit` to prevent CPU and memory exhaustion when processing hundreds of large images.
- **Filename Sanitization**: Directory traversal patterns and special characters are stripped before disk write.
- **Automatic Cleanup**: Temporary conversion files are pruned on a 15-minute interval for files older than 30 minutes.
