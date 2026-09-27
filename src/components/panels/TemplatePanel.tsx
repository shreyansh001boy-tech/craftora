import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { motion } from 'framer-motion'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion'

const PRESET_COLORS = [
  '#ffffff', '#000000', '#F43F5E', '#3B82F6', '#10B981',
  '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#1E293B', '#334155', '#64748B', '#CBD5E1', '#F1F5F9',
]

// Templates metadata
const TEMPLATES = [
  { id: 'minimal-white', name: 'Minimal White', category: 'Social Post', bg: '#ffffff', accent: '#111111' },
  { id: 'dark-studio', name: 'Dark Studio', category: 'Social Post', bg: '#09090B', accent: '#F43F5E' },
  { id: 'gradient-purple', name: 'Purple Gradient', category: 'Social Post', bg: 'linear-gradient(135deg,#7C3AED,#DB2777)', accent: '#ffffff' },
  { id: 'forest-green', name: 'Forest', category: 'Poster', bg: '#052e16', accent: '#4ade80' },
  { id: 'sunset-orange', name: 'Sunset', category: 'Poster', bg: '#7c2d12', accent: '#fb923c' },
  { id: 'ocean-blue', name: 'Ocean', category: 'Presentation', bg: '#0c4a6e', accent: '#38bdf8' },
  { id: 'paper-beige', name: 'Paper', category: 'Card', bg: '#fef3c7', accent: '#92400e' },
  { id: 'neon-dark', name: 'Neon Dark', category: 'Banner', bg: '#030712', accent: '#a78bfa' },
  { id: 'rose-gold', name: 'Rose Gold', category: 'Card', bg: '#fdf2f8', accent: '#be185d' },
  { id: 'tech-blue', name: 'Tech Blue', category: 'Presentation', bg: '#0f172a', accent: '#3b82f6' },
  { id: 'warm-gray', name: 'Warm Gray', category: 'Banner', bg: '#292524', accent: '#e7e5e4' },
  { id: 'vibrant-yellow', name: 'Vibrant', category: 'Custom Art', bg: '#fef08a', accent: '#713f12' },
]

export function TemplatePanel() {
  const canvas = useFabricCanvas()
  const [showPicker, setShowPicker] = useState(false)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [confirmTemplate, setConfirmTemplate] = useState<typeof TEMPLATES[0] | null>(null)

  const applyBg = (color: string) => {
    if (!canvas) return
    setBgColor(color)
    canvas.set({ backgroundColor: color })
    canvas.requestRenderAll()
  }

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    if (!canvas) return
    // Clear canvas objects
    canvas.getObjects().slice().forEach((o) => canvas.remove(o))
    const bg = tpl.bg.startsWith('linear') ? '#1a1a2e' : tpl.bg
    canvas.set({ backgroundColor: bg })
    canvas.requestRenderAll()
    setConfirmTemplate(null)
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Background Color */}
      <div className="panel-heading">Background Color</div>
      <div style={{ padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => applyBg(c)}
            style={{
              width: 22, height: 22, borderRadius: 4,
              background: c,
              border: bgColor === c ? '2px solid var(--color-accent-400)' : '1.5px solid var(--color-base-600)',
              cursor: 'pointer',
              transition: 'transform 100ms var(--ease-spring)',
            }}
            aria-label={`Set background ${c}`}
          />
        ))}
        <button
          onClick={() => setShowPicker(!showPicker)}
          style={{ width: 22, height: 22, borderRadius: 4, background: 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', border: '1.5px solid var(--color-base-600)', cursor: 'pointer' }}
          aria-label="Custom color"
        />
      </div>
      {showPicker && (
        <div style={{ padding: '0 12px 12px' }}>
          <HexColorPicker color={bgColor} onChange={applyBg} style={{ width: '100%' }} />
        </div>
      )}

      {/* Templates */}
      <div className="panel-heading" style={{ marginTop: 8 }}>Starter Templates</div>
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '8px 12px' }}
      >
        {TEMPLATES.map((tpl) => (
          <motion.button
            key={tpl.id}
            variants={staggerItemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setConfirmTemplate(tpl)}
            style={{
              height: 64,
              borderRadius: 6,
              background: tpl.bg,
              border: '1px solid var(--color-base-600)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              overflow: 'hidden',
              position: 'relative',
            }}
            aria-label={`Apply template: ${tpl.name}`}
          >
            <span style={{ fontSize: 10, fontWeight: 600, color: tpl.accent, textShadow: '0 1px 3px rgba(0,0,0,0.5)', zIndex: 1 }}>{tpl.name}</span>
            <span style={{ fontSize: 9, color: tpl.accent, opacity: 0.7, zIndex: 1 }}>{tpl.category}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Confirm dialog */}
      {confirmTemplate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ padding: 24, background: 'var(--color-base-800)', border: '1px solid var(--color-base-600)', borderRadius: 10, maxWidth: 320, width: '90%', boxShadow: 'var(--shadow-float)' }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-base-100)', marginBottom: 8 }}>Apply Template?</div>
            <div style={{ fontSize: 12, color: 'var(--color-base-400)', marginBottom: 20 }}>
              This will clear your current canvas and apply the "{confirmTemplate.name}" template. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmTemplate(null)} className="btn-base" style={{ padding: '0 16px', height: 32, fontSize: 12 }}>Cancel</button>
              <button onClick={() => applyTemplate(confirmTemplate)} className="btn-primary btn-base" style={{ padding: '0 16px', height: 32, fontSize: 12 }}>Apply</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
