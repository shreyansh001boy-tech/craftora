import { useEffect, useRef, useCallback } from 'react'
import { Canvas as FabricCanvas } from 'fabric'
import { useEditorStore } from '@/store/editorStore'
import { nanoid } from 'nanoid'
import { addImageFromDataUrl } from '@/lib/shapes'

export function CanvasBoard() {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { canvasSize, setFabricCanvas, setActiveObjectId, syncLayersFromCanvas, pushHistory, fabricCanvas } = useEditorStore()

  // Scale to fit viewport
  const getScale = useCallback(() => {
    if (!containerRef.current) return 1
    const cw = containerRef.current.clientWidth - 80
    const ch = containerRef.current.clientHeight - 80
    const scaleX = cw / canvasSize.width
    const scaleY = ch / canvasSize.height
    return Math.min(scaleX, scaleY, 1)
  }, [canvasSize])

  const applyScale = useCallback(() => {
    if (!wrapperRef.current) return
    const scale = getScale()
    wrapperRef.current.style.transform = `scale(${scale})`
  }, [getScale])

  useEffect(() => {
    if (!canvasEl.current) return

    const canvas = new FabricCanvas(canvasEl.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    })

    setFabricCanvas(canvas)
    applyScale()

    // Snapshot helper
    const snapshot = () => {
      if ((canvas as any)._isRestoring) return
      pushHistory({
        json: JSON.stringify(canvas.toJSON()),
        background: (canvas.backgroundColor as string) || '#ffffff',
      })
      syncLayersFromCanvas()
    }

    canvas.on('object:added', (e) => {
      if (!(e.target as any).__uid) (e.target as any).__uid = nanoid(8)
      snapshot()
    })
    canvas.on('object:removed', snapshot)
    canvas.on('object:modified', snapshot)

    canvas.on('selection:created', (e) => {
      setActiveObjectId((e.selected?.[0] as any)?.__uid || null)
    })
    canvas.on('selection:updated', (e) => {
      setActiveObjectId((e.selected?.[0] as any)?.__uid || null)
    })
    canvas.on('selection:cleared', () => setActiveObjectId(null))

    // Initial snapshot
    pushHistory({ json: JSON.stringify(canvas.toJSON()), background: '#ffffff' })

    const handleResize = () => applyScale()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      canvas.dispose()
    }
  }, [canvasSize])

  // Drag & drop images
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/') || !fabricCanvas) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      await addImageFromDataUrl(fabricCanvas, ev.target!.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden relative"
      style={{ background: 'var(--color-base-950)' }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Subtle center glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 50%, rgba(244,63,94,0.04) 0%, transparent 65%)',
      }} />

      <div
        ref={wrapperRef}
        style={{
          transformOrigin: 'center center',
          boxShadow: 'var(--shadow-canvas)',
          borderRadius: 2,
          lineHeight: 0,
        }}
      >
        <canvas ref={canvasEl} />
      </div>
    </div>
  )
}
