# Craftora — Browser-Only Design Studio

> **Craft anything. No backend. No account. Completely free.**

A professional-grade graphic design editor that runs entirely in your browser. No signups, no subscriptions, no data leaves your device. Built for creators, hackers, and everyone in between.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shreyansh001boy-tech/craftora)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎨 **Canvas Editor** | Full Fabric.js 6 object model — drag, resize, rotate, group |
| 📐 **Shapes** | Rectangle, Circle, Triangle, Line, Arrow, Freehand Pencil |
| ✍️ **Rich Text** | 25 Google Fonts, bold/italic/underline, alignment, line height |
| 🖼️ **Images** | Upload PNG/JPEG/WEBP/SVG/GIF, drag-and-drop onto canvas |
| 😊 **Emoji & Stickers** | 5000+ emoji via emoji-mart, fully searchable, zero external requests |
| 🎭 **Templates** | 12 starter templates across Social, Presentation, Poster, Card, Banner |
| 🗂️ **Layers Panel** | Drag-to-reorder, lock, hide, rename — just like Figma |
| 💾 **Local Projects** | Save/load projects to IndexedDB, thumbnail previews, auto-named |
| ↩️ **Undo / Redo** | 50-step history stack, Ctrl+Z / Ctrl+Shift+Z |
| ⬇️ **Export** | PNG and JPEG at full canvas resolution, no watermarks |
| ⌨️ **Keyboard Shortcuts** | V/R/C/T/P tools, Delete, Ctrl+D, arrow nudge, Ctrl+A |
| 📱 **Page Sizes** | 9 presets (Instagram, YouTube, A4, Twitter, OG Image…) + custom |

---

## 🚀 Zero Backend Architecture

```
Browser
  ├── Fabric.js 6          ← Canvas rendering engine
  ├── Zustand 4            ← Global state (no Redux overhead)
  ├── Dexie.js + IndexedDB ← Local project persistence
  ├── Google Fonts API     ← Client-side font loading
  ├── emoji-mart           ← Self-hosted emoji data
  └── file-saver           ← Client-side PNG/JPEG download

Hosting: Vercel / Cloudflare Pages (free tier, static only)
```

No server. No database. No authentication. No cost to run.

---

## 🛠 Tech Stack

All libraries are **MIT, Apache 2.0, or ISC licensed** — fully open source.

| Layer | Library | License |
|---|---|---|
| Framework | React 19 + Vite 8 | MIT |
| Canvas Engine | **Fabric.js 6** | MIT |
| State | Zustand 4 | MIT |
| Styling | Tailwind CSS v4 | MIT |
| Animations | **Framer Motion 11** | MIT |
| UI Primitives | Radix UI | MIT |
| Icons | Lucide React | ISC |
| Color Picker | react-colorful | MIT |
| Drag & Drop | @dnd-kit | MIT |
| IndexedDB | Dexie.js | Apache 2.0 |
| Emoji | @emoji-mart | MIT |
| File Save | file-saver | MIT |
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
| `Ctrl+A` | Select all |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Arrow keys` | Nudge 1px |
| `Shift+Arrow` | Nudge 10px |
| `Escape` | Deselect |

---

## 🏆 Hackathon Pitch

**The problem:** Canva and Adobe Express require accounts, upload your data, and cost money beyond basic tiers.

**Craftora's answer:** Everything runs in the browser. Your designs stay on your device. Export when you're done. Delete your browser history and it's gone. No account needed. No freemium wall. Open source.

**Technical moat:** Fabric.js 6 ESM + React 19 + Tailwind v4 + Framer Motion spring physics is a stack combination no existing free design tool uses. The 13px power-user UI density signals "professional tool" without a word of marketing.

---

## 📄 License

MIT — fork it, ship it, build on it.

---

<div align="center">
  Made with ❤️ and <strong>craftora</strong>
</div>
