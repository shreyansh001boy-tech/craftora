import { useState, useEffect } from 'react'
import { TopBar } from '@/components/topbar/TopBar'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { CanvasBoard } from '@/components/canvas/CanvasBoard'
import { RightPanel } from '@/components/panels/RightPanel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useEditorStore } from '@/store/editorStore'
import { ZoomIn, ZoomOut, Maximize2, Grid3x3 } from 'lucide-react'

function StatusBar() {
  const canvasSize = useEditorStore((s) => s.canvasSize)
  const fabricCanvas = useEditorStore((s) => s.fabricCanvas)
  const viewZoom = useEditorStore((s) => s.viewZoom)
  const fitScale = useEditorStore((s) => s.fitScale)
  const setViewZoom = useEditorStore((s) => s.setViewZoom)
  const resetView = useEditorStore((s) => s.resetView)
  const showGrid = useEditorStore((s) => s.showGrid)
  const toggleGrid = useEditorStore((s) => s.toggleGrid)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  // Track cursor on canvas
  useEffect(() => {
    if (!fabricCanvas) return
    const handler = (e: any) => {
      const p = (fabricCanvas as any).getScenePoint?.(e.e) || { x: 0, y: 0 }
      setCursorPos({ x: Math.round(p.x), y: Math.round(p.y) })
    }
    fabricCanvas.on('mouse:move', handler)
    return () => { fabricCanvas.off('mouse:move', handler) }
  }, [fabricCanvas])

  const effectiveZoom = Math.round(fitScale * viewZoom * 100)

  return (
    <div style={{
      height: 26, background: 'var(--color-base-875)',
      borderTop: '1px solid var(--color-base-600)',
      display: 'flex', alignItems: 'center', padding: '0 12px',
      gap: 12, fontSize: 11, color: 'var(--color-base-500)',
      flexShrink: 0, fontFamily: 'var(--font-mono)',
      userSelect: 'none',
    }}>
      {/* Brand */}
      <span style={{ color: 'var(--color-base-600)', fontSize: 10 }}>craftora</span>
      <span style={{ color: 'var(--color-base-700)' }}>|</span>

      {/* Canvas size */}
      <span>{canvasSize.width} × {canvasSize.height}px</span>
      <span style={{ color: 'var(--color-base-700)' }}>|</span>

      {/* Cursor */}
      <span>{cursorPos.x}, {cursorPos.y}</span>
      <span style={{ color: 'var(--color-base-700)' }}>|</span>

      {/* Zoom controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
        <button onClick={() => setViewZoom(viewZoom / 1.2)} aria-label="Zoom out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 2, display: 'flex' }}>
          <ZoomOut size={12} />
        </button>
        <span style={{ minWidth: 36, textAlign: 'center' }}>{effectiveZoom}%</span>
        <button onClick={() => setViewZoom(viewZoom * 1.2)} aria-label="Zoom in"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 2, display: 'flex' }}>
          <ZoomIn size={12} />
        </button>
        <button onClick={resetView} aria-label="Fit to screen" title="Fit to screen"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 2, display: 'flex' }}>
          <Maximize2 size={11} />
        </button>
        <button onClick={toggleGrid} aria-label="Toggle grid" title="Toggle grid (Ctrl + ')"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex',
            color: showGrid ? 'var(--color-accent-400)' : 'var(--color-base-500)' }}>
          <Grid3x3 size={12} />
        </button>
      </div>

      <span style={{ color: 'var(--color-base-700)', marginLeft: 4 }}>|</span>
      <span style={{ color: 'var(--color-base-600)', fontSize: 10 }}>No backend · No account · Fully yours</span>
    </div>
  )
}

function EditorLayout() {
  useKeyboardShortcuts()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--color-base-900)' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Toolbar />
        <CanvasBoard />
        <RightPanel />
      </div>
      <StatusBar />
    </div>
  )
}

export default function App() {
  return <EditorLayout />
}
