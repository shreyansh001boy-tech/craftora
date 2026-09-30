# Craftora — Browser-Only Design Studio

> **Craft anything. No backend. No account. Completely free.**

A professional-grade graphic design editor that runs entirely in your browser. No signups, no subscriptions, no server round-trip — your designs are stored in IndexedDB on your own machine. (The only outbound requests are to Google Fonts, for the typefaces you pick.) Built for creators, hackers, and everyone in between.

**Live demo:** [craftora-sigma.vercel.app](https://craftora-sigma.vercel.app)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shreyansh001boy-tech/craftora)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 **Canvas Editor** | Full Fabric.js 7 object model — drag, resize, rotate, group |
| 📐 **Shapes** | Rectangle, Circle, Triangle, Line, Arrow, Freehand Pencil |
| ✍️ **Rich Text** | 25 Google Fonts, bold/italic/underline, alignment, line height |
| 🖼️ **Images** | Upload any image type, drag-and-drop onto canvas |
| 🔧 **Image Adjustments** | Brightness, contrast, saturation and blur as live Fabric filters |
| 🌈 **Gradient Fills** | Linear and radial gradients on shapes, with angle and two stops |
| 🌒 **Drop Shadow** | Colour, blur, offset X/Y and opacity per object |
| 🎭 **Blend Modes** | 16 canvas composite modes (multiply, screen, overlay, difference…) |
| 🧲 **Snapping** | Edge and centre alignment guides while you drag |
| #️⃣ **Grid Overlay** | Toggleable 20px minor / 100px major grid, `Ctrl+'` |
| 🔍 **Zoom & Pan** | 25%–400% view zoom, fit-to-window, tracked in the status bar |
| 😊 **Emoji & Stickers** | 313 emoji across 10 categories, bundled locally — no network request |
| 📚 **Templates** | 12 starter templates across Social, Presentation, Poster, Card, Banner, Custom |
| 🗂️ **Layers Panel** | Drag-to-reorder, lock, hide, rename — just like Figma |
| 💾 **Local Projects** | Save/load projects to IndexedDB, thumbnail previews, auto-named |
| ↩️ **Undo / Redo** | 50-step history stack, Ctrl+Z / Ctrl+Shift+Z |
| ⬇️ **Export** | PNG, JPEG, SVG, PDF and PPTX at 1x/2x/3x, transparent PNG option, no watermarks |
| 📋 **Clipboard** | Copy, cut, paste objects; `Ctrl+Alt+C/V` copies an object's style |
| ⌨️ **Keyboard Shortcuts** | V/R/C/T/P tools, Delete, Ctrl+D, arrow nudge, Ctrl+A, z-order |
| 📱 **Page Sizes** | 9 presets (Instagram, YouTube, A4, Twitter, OG Image…) + custom |

---

## 🚀 Zero Backend Architecture

```
Browser
  ├── Fabric.js 7          ← Canvas rendering engine
  ├── Zustand 5            ← Global state (no Redux overhead)
  ├── Dexie.js + IndexedDB ← Local project persistence
  ├── Google Fonts API     ← Client-side font loading
  ├── Bundled emoji grid   ← 313 emoji shipped in the JS bundle
  ├── file-saver           ← Client-side PNG/JPEG/SVG download
  └── jsPDF + PptxGenJS    ← PDF/PPTX, lazy-loaded only when you pick those formats

Hosting: Vercel / Cloudflare Pages (free tier, static only)
```

No server. No database. No authentication. No cost to run.

---

## 🛠 Tech Stack

All libraries are **MIT, Apache 2.0, or ISC licensed** — fully open source.

| Layer | Library | License |
|---|---|---|
| Framework | React 19 + Vite 8 | MIT |
| Canvas Engine | **Fabric.js 7** | MIT |
| State | Zustand 5 | MIT |
| Styling | Tailwind CSS v4 | MIT |
| Animations | **Framer Motion 13** | MIT |
| UI Primitives | Radix UI | MIT |
| Icons | Lucide React | ISC |
| Color Picker | react-colorful | MIT |
| Drag & Drop | @dnd-kit | MIT |
| IndexedDB | Dexie.js | Apache 2.0 |
| File Save | file-saver | MIT |
| PDF Export | jsPDF | MIT |
| PPTX Export | PptxGenJS | MIT |
| Keyboard | react-hotkeys-hook | MIT |

---

## 🎨 Design Language

- **Dark, editorial** — Obsidian backgrounds (`#09090B`) with Rose accent (`#F43F5E`)
- **Inter 13px UI** — power-user density (same as Figma, Linear, VS Code)
- **Spring physics** — `cubic-bezier(0.34, 1.56, 0.64, 1)` for micro-interactions
- **Frosted glass** — `backdrop-filter: blur(16px)` surfaces for panels and modals
- **Zero pure black** — every surface has a subtle violet tint for warmth

---

## 🔧 Development

```bash
# Clone
git clone https://github.com/shreyansh001boy-tech/craftora
cd craftora

# Install
npm install --legacy-peer-deps

# Dev server
npm run dev

# Build
npm run build
```

---

## 🌐 Deploy to Vercel (free)

1. Fork or clone this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo
4. Settings: Framework = Vite, Build Command = `npm run build`, Output = `dist`
5. Deploy → done

No environment variables needed. Zero config.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `V` | Select tool |
| `R` | Rectangle |
| `C` | Circle |
| `T` | Text |
| `P` | Pencil |
| `Delete` / `Backspace` | Remove selected object |
| `Ctrl+D` | Duplicate |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy / cut / paste object |
| `Ctrl+Alt+C` / `Ctrl+Alt+V` | Copy / paste style only |
| `Ctrl+A` | Select all |
| `Ctrl+]` / `Ctrl+[` | Bring forward / send backward |
| `Ctrl+Shift+]` / `Ctrl+Shift+[` | Bring to front / send to back |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+'` | Toggle grid overlay |
| `Arrow keys` | Nudge 1px |
| `Shift+Arrow` | Nudge 10px |
| `Escape` | Deselect |

Every `Ctrl+` binding also works with `Cmd+` on macOS.

---

## 🏆 Hackathon Pitch

**The problem:** Canva and Adobe Express require accounts, upload your data, and cost money beyond basic tiers.

**Craftora's answer:** Everything runs in the browser. Your designs stay on your device. Export when you're done. Delete your browser history and it's gone. No account needed. No freemium wall. Open source.

**Technical moat:** Fabric.js 7 ESM + React 19 + Tailwind v4 + Framer Motion spring physics is a stack combination no existing free design tool uses. The 13px power-user UI density signals "professional tool" without a word of marketing.

---

## 📄 License

[MIT](LICENSE) — fork it, ship it, build on it.

---

<div align="center">
  Made with ❤️ and <strong>craftora</strong>
</div>
