import { useState } from 'react'
import { motion } from 'framer-motion'
import { Undo2, Redo2, Download, Save, ChevronDown } from 'lucide-react'
import { useEditorStore } from '@/store/editorStore'
import { Tooltip } from '@/components/ui/Tooltip'
import { ExportModal } from '@/components/export/ExportModal'
import { CANVAS_PRESETS } from '@/types'
import type { CanvasSize } from '@/types'

// Craftora Logomark SVG
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="1" y="1" width="20" height="20" rx="5" stroke="#F43F5E" strokeWidth="1.5"/>
        <line x1="14" y1="6" x2="20" y2="14" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <span style={{ fontFamily: 'Sora, Inter, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '-0.03em', lineHeight: 1 }}>
        <span style={{ color: 'var(--color-base-50)' }}>craft</span>
        <span style={{ color: 'var(--color-accent-400)' }}>ora</span>
      </span>
    </div>
  )
}

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
    if (w > 0 && h > 0) {
      apply({ width: w, height: h, label: `${w}×${h}` })
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="btn-base"
        style={{ height: 28, padding: '0 10px', gap: 4, fontSize: 11 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-base-400)' }}>
          {canvasSize.width}×{canvasSize.height}
        </span>
        <span style={{ color: 'var(--color-base-500)', fontSize: 10 }}>{canvasSize.label}</span>
        <ChevronDown size={10} style={{ color: 'var(--color-base-500)' }} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'absolute', top: 32, left: 0, zIndex: 200,
            background: 'var(--color-base-800)', border: '1px solid var(--color-base-600)',
            borderRadius: 8, boxShadow: 'var(--shadow-float)', minWidth: 220, overflow: 'hidden',
          }}
        >
          {CANVAS_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => apply(preset)}
              style={{
                display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
                padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'var(--color-base-200)', transition: 'background 80ms',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).closest('button')!.style.background = 'var(--color-base-750)' }}
              onMouseLeave={(e) => { (e.target as HTMLElement).closest('button')!.style.background = 'none' }}
            >
              <span>{preset.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-base-500)' }}>{preset.width}×{preset.height}</span>
            </button>
          ))}
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-base-600)' }}>
            <div style={{ fontSize: 10, color: 'var(--color-base-500)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custom</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input className="input-base" value={customW} onChange={(e) => setCustomW(e.target.value)} style={{ width: 60 }} placeholder="W" />
              <span style={{ color: 'var(--color-base-500)', fontSize: 10 }}>×</span>
              <input className="input-base" value={customH} onChange={(e) => setCustomH(e.target.value)} style={{ width: 60 }} placeholder="H" />
              <button onClick={applyCustom} className="btn-base" style={{ height: 28, padding: '0 10px', fontSize: 11 }}>Apply</button>
            </div>
          </div>
        </motion.div>
      )}
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setOpen(false)} />}
    </div>
  )
}

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
          padding: '0 12px',
          gap: 8,
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Logo />

        <div style={{ width: 1, height: 20, background: 'var(--color-base-600)', margin: '0 4px' }} />

        {/* Page Size */}
        <PageSizePicker />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Undo / Redo */}
        <Tooltip content="Undo" shortcut="⌘Z" side="bottom">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={undo}
            disabled={!canUndo}
            aria-label="Undo"
            className="btn-ghost btn-icon"
            style={{ opacity: canUndo ? 1 : 0.35 }}
          >
            <Undo2 size={15} strokeWidth={1.5} />
          </motion.button>
        </Tooltip>
        <Tooltip content="Redo" shortcut="⌘⇧Z" side="bottom">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={redo}
            disabled={!canRedo}
            aria-label="Redo"
            className="btn-ghost btn-icon"
            style={{ opacity: canRedo ? 1 : 0.35 }}
          >
            <Redo2 size={15} strokeWidth={1.5} />
          </motion.button>
        </Tooltip>

        <div style={{ width: 1, height: 20, background: 'var(--color-base-600)', margin: '0 4px' }} />

        {/* Export */}
        <Tooltip content="Export Design" side="bottom">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowExport(true)}
            className="btn-primary btn-base"
            style={{ height: 30, padding: '0 14px', gap: 6, fontSize: 12 }}
            aria-label="Export design"
          >
            <Download size={13} strokeWidth={1.5} />
            Export
          </motion.button>
        </Tooltip>
      </motion.header>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  )
}
