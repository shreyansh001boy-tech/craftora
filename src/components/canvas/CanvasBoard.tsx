import { useEffect, useRef, useCallback } from 'react'
import { Canvas as FabricCanvas } from 'fabric'
import { useEditorStore } from '@/store/editorStore'
import { nanoid } from 'nanoid'
import { addImageFromDataUrl } from '@/lib/shapes'

export function CanvasBoard() {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    canvasSize, setFabricCanvas, setActiveObjectId,
    syncLayersFromCanvas, pushHistory, fabricCanvas,
  } = useEditorStore()

  const applyScale = useCallback(() => {
    if (!containerRef.current || !wrapperRef.current) return
    const cw = containerRef.current.clientWidth - 80
    const ch = containerRef.current.clientHeight - 80
    const scaleX = cw / canvasSize.width
    const scaleY = ch / canvasSize.height
    const scale = Math.min(scaleX, scaleY, 1)
    wrapperRef.current.style.transform = `scale(${scale})`
  }, [canvasSize])

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

    // Apply scale after mount (give DOM time to settle)
    setTimeout(applyScale, 50)

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

    pushHistory({ json: JSON.stringify(canvas.toJSON()), background: '#ffffff' })

    // ResizeObserver to keep scale in sync
    const ro = new ResizeObserver(() => applyScale())
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', applyScale)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', applyScale)
      canvas.dispose()
    }
  }, [canvasSize])

  // Re-apply scale when canvasSize changes
  useEffect(() => {
    setTimeout(applyScale, 50)
  }, [canvasSize, applyScale])

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
      style={{ background: 'var(--color-base-950)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}
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
        data-canvas-wrapper="true"
        style={{
          transformOrigin: 'center center',
          boxShadow: 'var(--shadow-canvas)',
          borderRadius: 2,
          lineHeight: 0,
          flexShrink: 0,
        }}
      >
        <canvas ref={canvasEl} />
      </div>
    </div>
  )
}
