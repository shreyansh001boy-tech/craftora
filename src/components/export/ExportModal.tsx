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
  const { currentProjectName } = useEditorStore()
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(90)
  const [filename, setFilename] = useState(
    currentProjectName?.replace(/[^a-z0-9]/gi, '-').toLowerCase() ||
    `craftora-design-${new Date().toISOString().split('T')[0]}`
  )
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!canvas) return
    setExporting(true)
    await exportCanvas(canvas, format, quality / 100, filename)
    setExporting(false)
    onClose()
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
              <div style={{ display: 'flex', gap: 6 }}>
                {(['png', 'jpeg'] as ExportFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    style={{
                      flex: 1, height: 36, borderRadius: 7, border: '1px solid',
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
              <div style={{ fontSize: 11, color: 'var(--color-base-500)' }}>
                Full resolution output at canvas dimensions. No watermarks.
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
