import { useEffect, useRef, useCallback } from 'react'
import { Canvas as FabricCanvas } from 'fabric'
import { useEditorStore } from '@/store/editorStore'
import { nanoid } from 'nanoid'
import { addImageFromDataUrl } from '@/lib/shapes'
import { attachAlignmentGuides } from '@/lib/snapping'

const PAD = 80

export function CanvasBoard() {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const guidesRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  const spaceRef = useRef(false)

  const {
    canvasSize, viewZoom, viewNonce, fabricCanvas, showGrid,
    setFabricCanvas, setActiveObjectId, snapshot, setFitScale, setViewZoom,
  } = useEditorStore()

  const applyView = useCallback(() => {
    const wrapper = wrapperRef.current
    const container = containerRef.current
    if (!wrapper || !container) return

    const fit = Math.min(
      (container.clientWidth - PAD) / canvasSize.width,
      (container.clientHeight - PAD) / canvasSize.height,
      1,
    )
    const scale = fit * viewZoom
    scaleRef.current = scale
    wrapper.style.transform =
      `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${scale})`

    if (Math.abs(useEditorStore.getState().fitScale - fit) > 0.001) setFitScale(fit)
  }, [canvasSize, viewZoom, setFitScale])

  // Build the Fabric canvas exactly once. Rebuilding it on a page-size switch is
  // what used to erase every object.
  useEffect(() => {
    if (!canvasEl.current) return
    const size = useEditorStore.getState().canvasSize

    const canvas = new FabricCanvas(canvasEl.current, {
      width: size.width,
      height: size.height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
    })

    setFabricCanvas(canvas)
    // Fabric only repaints on object add/remove/modify, so an empty artboard
    // would never paint its own background without this.
    canvas.renderAll()

    canvas.on('object:added', (e) => {
      if (!(e.target as any).__uid) (e.target as any).__uid = nanoid(8)
      snapshot()
    })
    canvas.on('object:removed', snapshot)
    canvas.on('object:modified', snapshot)

    const select = (e: any) => setActiveObjectId((e.selected?.[0] as any)?.__uid || null)
    canvas.on('selection:created', select)
    canvas.on('selection:updated', select)
    canvas.on('selection:cleared', () => setActiveObjectId(null))

    snapshot()

    return () => {
      canvas.dispose()
      setFabricCanvas(null)
    }
  }, [])

  // Resize the artboard in place: objects keep their coordinates.
  useEffect(() => {
    if (!fabricCanvas) return
    fabricCanvas.setDimensions({ width: canvasSize.width, height: canvasSize.height })
    fabricCanvas.renderAll()
    applyView()
  }, [fabricCanvas, canvasSize, applyView])

  useEffect(() => applyView(), [applyView, viewNonce])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const zoomAt = (clientX: number, clientY: number, nextZoom: number) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const state = useEditorStore.getState()
      const prevScale = scaleRef.current
      const nextScale = prevScale * (nextZoom / state.viewZoom)
      const rect = wrapper.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const keep = 1 - nextScale / prevScale
      panRef.current = {
        x: panRef.current.x + (clientX - centerX) * keep,
        y: panRef.current.y + (clientY - centerY) * keep,
      }
      state.setViewZoom(nextZoom)
    }

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const current = useEditorStore.getState().viewZoom
      zoomAt(e.clientX, e.clientY, current * (e.deltaY < 0 ? 1.1 : 1 / 1.1))
    }
    container.addEventListener('wheel', onWheel, { passive: false })

    // Capture phase, so Fabric never sees a pan gesture.
    const onMouseDown = (e: MouseEvent) => {
      const panning = e.button === 1 || (e.button === 0 && spaceRef.current)
      if (!panning) return
      e.preventDefault()
      e.stopPropagation()
      const origin = { ...panRef.current }
      const startX = e.clientX
      const startY = e.clientY
      const onMove = (ev: MouseEvent) => {
        panRef.current = {
          x: origin.x + ev.clientX - startX,
          y: origin.y + ev.clientY - startY,
        }
        applyView()
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
    container.addEventListener('mousedown', onMouseDown, true)

    const isTyping = () => {
      const tag = (document.activeElement?.tagName || '').toLowerCase()
      const editing = (useEditorStore.getState().fabricCanvas?.getActiveObject() as any)?.isEditing
      return tag === 'input' || tag === 'textarea' || !!editing
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || spaceRef.current || isTyping()) return
      spaceRef.current = true
      e.preventDefault()
      const canvas = useEditorStore.getState().fabricCanvas
      if (canvas) canvas.defaultCursor = 'grab'
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      spaceRef.current = false
      const canvas = useEditorStore.getState().fabricCanvas
      if (canvas) canvas.defaultCursor = 'default'
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const ro = new ResizeObserver(() => applyView())
    if (containerRef.current) ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('mousedown', onMouseDown, true)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [applyView])

  useEffect(() => {
    if (!fabricCanvas || !guidesRef.current) return
    return attachAlignmentGuides(fabricCanvas, guidesRef.current, () => scaleRef.current)
  }, [fabricCanvas])

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

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden relative"
      style={{ background: 'var(--color-base-950)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
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
          position: 'relative',
          transformOrigin: 'center center',
          boxShadow: 'var(--shadow-canvas)',
          borderRadius: 2,
          lineHeight: 0,
          flexShrink: 0,
        }}
      >
        <canvas ref={canvasEl} />
        {showGrid && (
          <div
            data-grid="true"
            style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              backgroundImage: [
                'linear-gradient(to right, rgba(244,63,94,0.22) 1px, transparent 1px)',
                'linear-gradient(to bottom, rgba(244,63,94,0.22) 1px, transparent 1px)',
                'linear-gradient(to right, rgba(244,63,94,0.09) 1px, transparent 1px)',
                'linear-gradient(to bottom, rgba(244,63,94,0.09) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
            }}
          />
        )}
        <div
          ref={guidesRef}
          data-guides="true"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
        />
      </div>
    </div>
  )
}
