import { useState } from 'react'
import { motion } from 'framer-motion'
import { Undo2, Redo2, Download, ChevronDown } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { ExportModal } from '@/components/export/ExportModal'
import { CANVAS_PRESETS } from '@/types'
import type { CanvasSize } from '@/types'

// ─── Craftora Logomark ────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, userSelect: 'none' }}>
      {/* Logomark: canvas square with a folded corner accent */}
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer rounded square */}
        <rect x="1" y="1" width="24" height="24" rx="6" stroke="#F43F5E" strokeWidth="1.5" fill="none"/>
        {/* Inner canvas surface */}
        <rect x="4.5" y="4.5" width="17" height="17" rx="3" fill="rgba(244,63,94,0.08)"/>
        {/* Corner fold lines — design handle metaphor */}
        <path d="M17 4.5 L21.5 9" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M17 4.5 L17 9 L21.5 9" stroke="rgba(244,63,94,0.35)" strokeWidth="1" fill="none" strokeLinejoin="round"/>
        {/* Small dot — cursor/pen nib */}
        <circle cx="13" cy="13" r="1.5" fill="#F43F5E"/>
      </svg>

      {/* Wordmark */}
      <span style={{
        fontFamily: "'Sora', 'Inter', sans-serif",
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: '-0.04em',
        lineHeight: 1,
      }}>
        <span style={{ color: '#E8E8F0' }}>craft</span>
        <span style={{ color: '#F43F5E' }}>ora</span>
      </span>
    </div>
  )
}

// ─── Page Size Picker ─────────────────────────────────────────────────────────
function PageSizePicker() {
  const { canvasSize, setCanvasSize } = useEditorStore()
  const [open, setOpen] = useState(false)
  const [customW, setCustomW] = useState(String(canvasSize.width))
  const [customH, setCustomH] = useState(String(canvasSize.height))

  const apply = (size: CanvasSize) => {
    setCanvasSize(size)
    setOpen(false)
  }

  const applyCustom = () => {
    const w = parseInt(customW)
    const h = parseInt(customH)
    if (w > 0 && h > 0) apply({ width: w, height: h, label: `Custom` })
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-base"
        style={{ height: 28, padding: '0 10px', gap: 5, fontSize: 11 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-base-300)', fontSize: 11 }}>
          {canvasSize.width}×{canvasSize.height}
        </span>
        <span style={{ color: 'var(--color-base-500)', fontSize: 10 }}>{canvasSize.label}</span>
        <ChevronDown size={10} style={{ color: 'var(--color-base-500)', flexShrink: 0 }} />
      </button>

      {open && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute', top: 34, left: 0, zIndex: 300,
              background: 'var(--color-base-800)',
              border: '1px solid var(--color-base-600)',
              borderRadius: 8, boxShadow: 'var(--shadow-float)',
              minWidth: 230, overflow: 'hidden',
            }}
          >
            {CANVAS_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => apply(preset)}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 14px', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12,
                  color: canvasSize.label === preset.label ? 'var(--color-accent-400)' : 'var(--color-base-200)',
                  transition: 'background 80ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-base-750)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <span>{preset.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-base-500)' }}>
                  {preset.width}×{preset.height}
                </span>
              </button>
            ))}
            {/* Custom */}
            <div style={{ padding: '8px 14px', borderTop: '1px solid var(--color-base-600)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custom size</span>
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <input className="input-base" value={customW} onChange={(e) => setCustomW(e.target.value)} style={{ width: 64 }} placeholder="W" />
                <span style={{ color: 'var(--color-base-500)', fontSize: 11 }}>×</span>
                <input className="input-base" value={customH} onChange={(e) => setCustomH(e.target.value)} style={{ width: 64 }} placeholder="H" />
                <button onClick={applyCustom} className="btn-base" style={{ height: 28, padding: '0 10px', fontSize: 11, flexShrink: 0 }}>Apply</button>
              </div>
            </div>
          </motion.div>
          <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
export function TopBar() {
  const { canUndo, canRedo, undo, redo } = useEditorStore()
  const [showExport, setShowExport] = useState(false)

  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
        style={{
          height: 44,
          background: 'var(--color-base-875)',
          borderBottom: '1px solid var(--color-base-600)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          gap: 8,
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <Logo />

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--color-base-600)', margin: '0 2px' }} />

        <PageSizePicker />

        <div style={{ flex: 1 }} />

        {/* Undo */}
        <Tooltip content="Undo" shortcut="⌘Z" side="bottom">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            className="btn-ghost btn-icon"
            style={{ opacity: canUndo ? 1 : 0.3, transition: 'opacity 150ms' }}
          >
            <Undo2 size={15} strokeWidth={1.5} />
          </motion.button>
        </Tooltip>

        {/* Redo */}
        <Tooltip content="Redo" shortcut="⌘⇧Z" side="bottom">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            className="btn-ghost btn-icon"
            style={{ opacity: canRedo ? 1 : 0.3, transition: 'opacity 150ms' }}
          >
            <Redo2 size={15} strokeWidth={1.5} />
          </motion.button>
        </Tooltip>

        <div style={{ width: 1, height: 20, background: 'var(--color-base-600)', margin: '0 2px' }} />

        {/* Export CTA */}
        <Tooltip content="Export as PNG or JPEG" side="bottom">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ translateY: -1 }}
            onClick={() => setShowExport(true)}
            aria-label="Export design"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 30, padding: '0 14px',
              background: 'linear-gradient(180deg, #F43F5E 0%, #E11D48 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 7,
              color: '#fff',
              fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(244,63,94,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
              transition: 'box-shadow 150ms',
            }}
          >
            <Download size={13} strokeWidth={2} />
            Export
          </motion.button>
        </Tooltip>
      </motion.header>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  )
}
