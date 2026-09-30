import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'
import { Slider } from '@/components/ui/Slider'
import { Input } from '@/components/ui/Input'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { useEditorStore } from '@/store/editorStore'
import { exportCanvas, type ExportFormat } from '@/lib/export'
import { modalVariants, modalOverlayVariants } from '@/lib/motion'

interface ExportModalProps {
  onClose: () => void
}

export function ExportModal({ onClose }: ExportModalProps) {
  const canvas = useFabricCanvas()
  const { currentProjectName, canvasSize } = useEditorStore()
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(90)
  const [scale, setScale] = useState(1)
  const [transparent, setTransparent] = useState(false)
  const [filename, setFilename] = useState(
    currentProjectName?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ||
    `craftora-design-${new Date().toISOString().split('T')[0]}`
  )
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!canvas) return
    setExporting(true)
    try {
      await exportCanvas(canvas, format, quality / 100, filename, { scale, transparent })
      onClose()
    } finally {
      setExporting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={modalOverlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 360,
            background: 'var(--color-base-850)',
            border: '1px solid var(--color-base-600)',
            borderRadius: 12,
            boxShadow: 'var(--shadow-float)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--color-base-600)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-base-100)' }}>Export Design</div>
              <div style={{ fontSize: 11, color: 'var(--color-base-500)', marginTop: 2 }}>Download to your device</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 4 }} aria-label="Close">
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Format */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Format</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(['png', 'jpeg', 'svg', 'pdf', 'pptx'] as ExportFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    style={{
                      flex: '1 0 28%', height: 36, borderRadius: 7, border: '1px solid',
                      borderColor: format === f ? 'var(--color-accent-400)' : 'var(--color-base-600)',
                      background: format === f ? 'rgba(244,63,94,0.12)' : 'var(--color-base-800)',
                      color: format === f ? 'var(--color-accent-400)' : 'var(--color-base-400)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
                      transition: 'all 150ms',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            {format !== 'svg' && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Scale</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3].map((s) => (
                    <button
                      key={s}
                      onClick={() => setScale(s)}
                      style={{
                        flex: 1, height: 32, borderRadius: 7, border: '1px solid',
                        borderColor: scale === s ? 'var(--color-accent-400)' : 'var(--color-base-600)',
                        background: scale === s ? 'rgba(244,63,94,0.12)' : 'var(--color-base-800)',
                        color: scale === s ? 'var(--color-accent-400)' : 'var(--color-base-400)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms',
                      }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transparent background */}
            {format === 'png' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--color-base-200)' }}>
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  style={{ accentColor: 'var(--color-accent-400)', width: 14, height: 14 }}
                />
                Transparent background
              </label>
            )}

            {/* JPEG Quality */}
            {format === 'jpeg' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <Slider label="Quality" value={quality} min={40} max={100} step={5} onChange={setQuality} showValue unit="%" />
              </motion.div>
            )}

            {/* Filename */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Filename</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  className="input-base"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 11, color: 'var(--color-base-500)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>.{format}</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '10px 12px', background: 'var(--color-base-800)', borderRadius: 7, border: '1px solid var(--color-base-600)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-base-500)', lineHeight: 1.5 }}>
                {format === 'svg'
                  ? `Vector output, ${canvasSize.width} × ${canvasSize.height} viewBox. Text stays live but the typeface is not embedded.`
                  : format === 'pdf'
                  ? `One page sized to the design, ${Math.round(canvasSize.width * 0.75)} × ${Math.round(canvasSize.height * 0.75)} pt, artwork embedded at ${Math.round(canvasSize.width * scale)} × ${Math.round(canvasSize.height * scale)} px.`
                  : format === 'pptx'
                  ? `One ${(canvasSize.width / 96).toFixed(2)} × ${(canvasSize.height / 96).toFixed(2)} in slide, artwork embedded as a picture at ${Math.round(canvasSize.width * scale)} × ${Math.round(canvasSize.height * scale)} px.`
                  : `${Math.round(canvasSize.width * scale)} × ${Math.round(canvasSize.height * scale)} px${transparent ? ', transparent' : ''}. No watermarks.`}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '0 20px 20px' }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleExport}
              disabled={exporting}
              className="btn-primary btn-base"
              style={{ width: '100%', height: 38, fontSize: 13, gap: 8, opacity: exporting ? 0.7 : 1 }}
            >
              <Download size={14} />
              {exporting ? 'Exporting…' : `Download ${format.toUpperCase()}`}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
