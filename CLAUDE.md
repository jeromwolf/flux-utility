# Flux Utility - AI Context & Architecture Guide

## Project Overview

**Flux Utility** is a modern, client-side utility application offering 9 powerful tools for file conversion, image processing, PDF annotation, and stock media search. All processing happens in the browser for privacy and speed.

- **Live**: https://flux-utility.vercel.app
- **Stack**: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4
- **Deploy**: Vercel (automatic on push)
- **Language**: Korean UI + English documentation

## Core Architecture

### Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Framework** | Next.js | 16 | App Router, Turbopack enabled |
| **UI Library** | React | 19 | Client-side only, no SSR for canvas |
| **Language** | TypeScript | 5.9 | Strict mode recommended |
| **Styling** | Tailwind CSS | 4.1 | `@theme` custom variables in globals.css |
| **PDF** | pdfjs-dist | 5.4 | Dynamic import for SSR safety |
| **PDF Gen** | jspdf | 4.1 | Client-side PDF creation |
| **QR Codes** | qrcode | 1.5 | Client-side QR generation |
| **Icons** | lucide-react | 0.563 | Icon library |
| **Utils** | clsx, tailwind-merge | latest | Class merging utilities |
| **Download** | file-saver | 2.0 | Browser download triggering |
| **Archives** | jszip | 3.10 | ZIP export for batch downloads |

### Directory Structure

```
src/
├── app/
│   ├── api/pixabay/              # API routes (server-side only)
│   │   ├── images/route.ts       # Image search proxy
│   │   ├── videos/route.ts       # Video search proxy
│   │   └── download/route.ts     # Binary download proxy
│   │
│   ├── tools/                    # Tool pages (one per tool)
│   │   ├── pdf-to-image/
│   │   ├── image-to-pdf/
│   │   ├── pdf-annotate/
│   │   ├── image-edit/
│   │   ├── bg-remove/
│   │   ├── image-resize/
│   │   ├── qr-generator/
│   │   ├── video-scene-detect/
│   │   ├── stock-image/
│   │   └── layout.tsx            # Tools layout wrapper
│   │
│   ├── layout.tsx                # Root layout (theme, metadata)
│   └── page.tsx                  # Homepage with tool grid
│
├── components/
│   ├── layout/                   # Global layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx       # Light/dark mode toggle
│   │
│   ├── ui/                       # Shared UI components
│   │   ├── Button.tsx
│   │   ├── FileUpload.tsx        # Generic file input
│   │   └── ProgressBar.tsx       # Progress indicator
│   │
│   └── tools/
│       └── ToolCard.tsx          # Tool card on homepage
│
├── lib/
│   ├── image/                    # Image processing
│   │   ├── image-editor.ts       # Adjustments, filters, crop
│   │   ├── image-resizer.ts      # Resize with aspect ratio
│   │   ├── background-remover.ts # Color-based transparency
│   │   └── image-to-pdf.ts       # Combine images to PDF
│   │
│   ├── pdf/                      # PDF processing
│   │   ├── pdf-renderer.ts       # pdfjs wrapper for display
│   │   ├── pdf-annotator.ts      # Drawing, text, shapes on PDF
│   │   ├── lecture-recorder.ts   # WebM video recording (1920x1080)
│   │   └── export.ts             # PDF/ZIP export utilities
│   │
│   ├── video/                    # Video processing
│   │   └── scene-detector.ts     # Frame difference detection
│   │
│   ├── qr/                       # QR code generation
│   │   └── qr-generator.ts       # qrcode wrapper
│   │
│   ├── pixabay/                  # Pixabay integration
│   │   ├── types.ts              # API response types
│   │   └── api.ts                # Client-side API client
│   │
│   ├── constants.ts              # TOOL REGISTRY (master list)
│   └── utils.ts                  # Helper: cn() for class merging
│
├── types/
│   ├── tools.ts                  # ToolDefinition interface
│   ├── pdf.ts                    # PDF types
│   └── video.ts                  # Video types
│
└── hooks/
    └── usePdfProcessor.ts        # PDF processing hook
```

### Key Design Patterns

#### 1. Tool Registry (Single Source of Truth)
All tools are defined in `src/lib/constants.ts`:

```typescript
export const tools: ToolDefinition[] = [
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: '...',
    icon: 'FileImage',
    href: '/tools/pdf-to-image',
    category: 'PDF',
    isNew: false,
  },
  // ... more tools
];
```

The homepage (`src/app/page.tsx`) loops through this array to render ToolCards.

#### 2. Client-Side Processing First
- All image/video/PDF operations happen in the browser
- No file uploads to servers (except Pixabay search proxy)
- Uses Canvas API, WebGL for heavy processing
- WebCodecs API for video frame extraction

#### 3. SSR-Safe PDF.js Usage
PDF.js worker requires special handling:

```typescript
// In lib/pdf/pdf-renderer.ts
import * as pdfjs from 'pdfjs-dist';
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}
```

This file is copied to public/ via `npm run copy-pdf-worker` (runs in predev/prebuild).

#### 4. Tailwind CSS v4 with @theme
Custom design tokens in `src/app/globals.css`:

```css
@theme {
  --color-primary: #6366f1;
  --color-background: #ffffff;
  /* ... more tokens ... */
}

.dark {
  --color-background: #0a0a0a;
  /* ... dark mode overrides ... */
}
```

This enables semantic color names like `bg-background`, `text-foreground`, `border-border`.

#### 5. API Proxy Pattern
Only server-side API calls:
- `/api/pixabay/images` - Search images
- `/api/pixabay/videos` - Search videos
- `/api/pixabay/download` - Stream binary files (avoids CORS issues)

All other processing is client-side.

## How to Add a New Tool

### Step 1: Define in Tool Registry
Edit `src/lib/constants.ts`:

```typescript
{
  id: 'my-tool',
  name: 'My Tool',
  description: 'Brief description in Korean',
  icon: 'IconName', // From lucide-react
  href: '/tools/my-tool',
  category: 'Image', // or 'PDF', 'Video', 'Utility', 'Search'
  isNew: true,
}
```

### Step 2: Create Tool Page
Create `src/app/tools/my-tool/page.tsx`:

```typescript
'use client';
import { useState } from 'react';

export default function MyToolPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Tool</h1>
      {/* Tool UI here */}
    </div>
  );
}
```

Mark with `'use client'` if using hooks.

### Step 3: Add Processing Logic
Create utility function in `src/lib/{category}/{tool-name}.ts`:

```typescript
export async function processMyTool(input: InputType): Promise<OutputType> {
  // Processing logic
  return result;
}
```

### Step 4: Optional - Create Sub-components
For complex tools, create `src/app/tools/my-tool/_components/` folder:
- `FileUpload.tsx` - Input handling
- `Settings.tsx` - Configuration UI
- `Preview.tsx` - Output preview
- `Controls.tsx` - Action buttons

### Step 5: Build and Deploy
```bash
npm run build
# Vercel auto-deploys on git push
```

## Environment Variables

### Required
- `PIXABAY_API_KEY` - Pixabay API key (server-side only, never exposed to client)

### Setup
Create `.env.local`:
```env
PIXABAY_API_KEY=your_key_here
```

This is used only in `src/app/api/pixabay/` routes.

## Important Conventions

### 1. Korean UI
All user-facing text should be in Korean:
- UI labels, buttons, descriptions
- Error messages
- Tool descriptions in constants.ts
- Comments in code should be English or Korean (consistently)

### 2. No SSR for Canvas/WebWorkers
Always wrap canvas-based code with:
```typescript
if (typeof window !== 'undefined') {
  // Canvas/WebWorker code here
}
```

Examples: PDF rendering, annotation, image editing, video processing.

### 3. Dynamic Imports for Large Libs
For libraries that require browser APIs:
```typescript
// Bad - breaks SSR
import pdfjs from 'pdfjs-dist';

// Good - dynamic import
const pdfjs = await import('pdfjs-dist');
```

### 4. File Download Pattern
Use `file-saver` consistently:
```typescript
import { saveAs } from 'file-saver';

const blob = new Blob([data], { type: 'application/pdf' });
saveAs(blob, 'filename.pdf');
```

### 5. Error Handling
Show user-friendly error messages:
```typescript
try {
  // operation
} catch (error) {
  setError('작업 중 오류가 발생했습니다. 다시 시도하세요.');
  console.error(error); // Log full error for debugging
}
```

### 6. Theme Support
The app supports light/dark mode. Always use semantic colors:
```tsx
// Good
<div className="bg-background text-foreground border border-border">

// Avoid hardcoding colors
<div className="bg-white text-black border border-gray-300">
```

## Build & Deployment

### Local Development
```bash
npm install
npm run dev
# Server runs on http://localhost:3000
```

Note: `predev` hook runs `copy-pdf-worker` automatically.

### Production Build
```bash
npm run build
npm run start
```

### Vercel Deployment
Push to git repository - Vercel auto-detects Next.js and deploys.
Environment variables set in Vercel dashboard: `Settings > Environment Variables`

## Performance Notes

### Turbopack
- Enabled in `next.config.ts`
- Provides ~5x faster builds than Webpack
- Watch mode is instant

### Code Splitting
- Each tool route is automatically code-split
- Tool-specific libraries only loaded when needed

### Image Optimization
- Large PDF files processed with streaming
- Video frame extraction uses requestAnimationFrame
- Image canvas operations batched where possible

## Testing & QA

### Manual Testing Checklist
- [ ] All tools load without console errors
- [ ] File uploads work with various formats
- [ ] Export/download works across browsers
- [ ] Dark mode toggle works
- [ ] Responsive design on mobile/tablet
- [ ] Pixabay search returns results
- [ ] Performance acceptable on large files

### Common Issues

| Issue | Solution |
|-------|----------|
| PDF.js worker not found | Run `npm run copy-pdf-worker` |
| Canvas memory error | Reduce max file size or add cleanup |
| Pixabay search 401 | Check `PIXABAY_API_KEY` in .env.local |
| Dark mode not applying | Check ThemeScript in layout.tsx |
| Build fails with SSR error | Wrap browser code in `typeof window` check |

## Useful Patterns

### Video Frame Extraction
```typescript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
ctx.drawImage(video, 0, 0);
const frameData = canvas.toDataURL('image/png');
```

### PDF Generation
```typescript
import jsPDF from 'jspdf';

const pdf = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});
pdf.addImage(imageData, 'PNG', x, y, width, height);
pdf.save('output.pdf');
```

### QR Code Generation
```typescript
import QRCode from 'qrcode';

const canvas = await QRCode.toCanvas(text, {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  width: 300,
});
```

## Dependencies Overview

| Dependency | Size | Purpose | Notes |
|------------|------|---------|-------|
| pdfjs-dist | ~2.5MB | PDF rendering | Use dynamic import, separate worker file |
| jspdf | ~350KB | PDF generation | Client-side only |
| jszip | ~200KB | ZIP archiving | For batch exports |
| qrcode | ~100KB | QR generation | Lightweight, SSR-safe |
| lucide-react | ~300KB | Icons | Tree-shakeable |
| tailwindcss | ~15KB | CSS framework | v4 with @theme support |

## File Format Support

### Images
- Input: JPG, PNG, GIF, WebP, BMP
- Output: JPG, PNG, WebP

### PDF
- Input: Standard PDF (encrypted PDFs may fail)
- Output: PDF (via jsPDF)

### Video
- Input: MP4, WebM, MOV (browser video codec dependent)
- Output: WebM (recording), JSON (scene detection)

### QR Codes
- Input: Text, URLs, email, phone
- Output: PNG

## Security & Privacy Notes

1. **No Server Storage**: Files never uploaded to servers (except Pixabay proxy)
2. **Client Processing**: All image/PDF/video work is local
3. **API Key**: PIXABAY_API_KEY never exposed to client (server-side only)
4. **CORS**: Pixabay `/download` route handles CORS issues
5. **No Analytics**: No tracking of user activities

## Contributing Guidelines

1. Follow existing patterns in `src/lib/` and `src/app/tools/`
2. Use TypeScript strictly (no `any` types)
3. Support both light and dark modes
4. Write Korean UI text
5. Test on mobile before committing
6. Use semantic color tokens from globals.css
7. Add tool to constants.ts before creating page
8. Ensure SSR-safe (wrap browser APIs in `typeof window` check)

## Troubleshooting for AI Assistants

### When Working on Bugs
1. Check error in browser DevTools console first
2. Verify SSR safety: PDF.js, canvas, WebWorkers
3. Check environment variables in `.env.local`
4. Verify file permissions and CORS (for Pixabay)
5. Test with minimal reproduction first

### When Adding Features
1. Update tool registry in constants.ts first
2. Create page at `/tools/{tool-id}/page.tsx`
3. Add processing logic in `lib/{category}/`
4. Test dark mode and mobile responsiveness
5. Verify no console warnings or errors
6. Run `npm run build` to catch SSR issues

### When Debugging Performance
1. Check Network tab for large file transfers
2. Check Performance tab for long tasks
3. Look for memory leaks in DevTools Memory profiler
4. Consider code-splitting or lazy loading
5. Profile canvas operations for efficiency

---

**Last Updated**: 2026-02-11
**Next.js Version**: 16.1.6
**React Version**: 19.2.4
