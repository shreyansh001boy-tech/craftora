import { useHotkeys } from 'react-hotkeys-hook'
import { ActiveSelection } from 'fabric'
import { useEditorStore } from '@/store/editorStore'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { duplicateActiveObject, addRect, addCircle, addIText, enablePencil, disablePencil } from '@/lib/shapes'
import { copyActive, cutActive, pasteClipboard, moveZOrder } from '@/lib/clipboard'
import { copyStyle, pasteStyle } from '@/lib/style'

export function useKeyboardShortcuts() {
  const canvas = useFabricCanvas()
  const { undo, redo, setActiveTool } = useEditorStore()

  // Undo
  useHotkeys('ctrl+z, meta+z', (e) => { e.preventDefault(); undo() }, { enableOnFormTags: false })
  // Redo
  useHotkeys('ctrl+shift+z, meta+shift+z, ctrl+y, meta+y', (e) => { e.preventDefault(); redo() }, { enableOnFormTags: false })

  // Delete selected
  useHotkeys('delete, backspace', (e) => {
    const active = canvas?.getActiveObject()
    if (!active || (active as any).isEditing) return
    // Don't delete if we're in a text input
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
    e.preventDefault()
    canvas?.remove(active)
    canvas?.requestRenderAll()
    useEditorStore.getState().syncLayersFromCanvas()
  }, { enableOnFormTags: false })

  // Duplicate
  useHotkeys('ctrl+d, meta+d', (e) => {
    e.preventDefault()
    if (!canvas) return
    duplicateActiveObject(canvas)
  })

  // Copy / cut / paste
  useHotkeys('ctrl+c, meta+c', (e) => {
    if (e.altKey) return
    e.preventDefault()
    if (canvas) void copyActive(canvas)
  }, { enableOnFormTags: false })
  useHotkeys('ctrl+x, meta+x', (e) => {
    e.preventDefault()
    if (canvas) void cutActive(canvas)
  }, { enableOnFormTags: false })
  useHotkeys('ctrl+v, meta+v', (e) => {
    if (e.altKey) return
    e.preventDefault()
    if (canvas) void pasteClipboard(canvas)
  }, { enableOnFormTags: false })

  // Copy / paste style
  useHotkeys('ctrl+alt+c, meta+alt+c', (e) => {
    e.preventDefault()
    const active = canvas?.getActiveObject()
    if (active) copyStyle(active)
  }, { enableOnFormTags: false })
  useHotkeys('ctrl+alt+v, meta+alt+v', (e) => {
    e.preventDefault()
    const active = canvas?.getActiveObject()
    if (!canvas || !pasteStyle(active)) return
    canvas.requestRenderAll()
    useEditorStore.getState().snapshotSoon()
  }, { enableOnFormTags: false })

  // Layer order
  useHotkeys('ctrl+], meta+]', (e) => {
    e.preventDefault()
    if (canvas) moveZOrder(canvas, 'forward')
  }, { enableOnFormTags: false })
  useHotkeys('ctrl+[, meta+[', (e) => {
    e.preventDefault()
    if (canvas) moveZOrder(canvas, 'backward')
  }, { enableOnFormTags: false })
  useHotkeys('ctrl+shift+], meta+shift+]', (e) => {
    e.preventDefault()
    if (canvas) moveZOrder(canvas, 'front')
  }, { enableOnFormTags: false })
  useHotkeys('ctrl+shift+[, meta+shift+[', (e) => {
    e.preventDefault()
    if (canvas) moveZOrder(canvas, 'back')
  }, { enableOnFormTags: false })

  // Select all
  useHotkeys('ctrl+a, meta+a', (e) => {
    e.preventDefault()
    if (!canvas) return
    const objs = canvas.getObjects()
    if (objs.length === 0) return
    canvas.discardActiveObject()
    const sel = new ActiveSelection(objs, { canvas })
    canvas.setActiveObject(sel)
    canvas.requestRenderAll()
  })

  // Escape — deselect
  useHotkeys('escape', () => {
    canvas?.discardActiveObject()
    canvas?.requestRenderAll()
  })

  // Grid overlay
  useHotkeys("ctrl+', meta+'", (e) => {
    e.preventDefault()
    useEditorStore.getState().toggleGrid()
  }, { enableOnFormTags: false })

  // Tool shortcuts
  useHotkeys('v', () => { setActiveTool('select'); if (canvas) canvas.isDrawingMode = false })
  useHotkeys('r', () => { if (canvas) { addRect(canvas); setActiveTool('select') } })
  useHotkeys('c', () => { if (canvas) { addCircle(canvas); setActiveTool('select') } })
  useHotkeys('t', () => { if (canvas) { addIText(canvas); setActiveTool('select') } })
  useHotkeys('p', () => { if (canvas) { enablePencil(canvas); setActiveTool('pencil') } })

  // Arrow nudge — 1px, or 10px with Shift. Nudges are recorded so undo steps
  // through them instead of jumping back to before the whole sequence.
  const nudge = (dx: number, dy: number) => {
    const obj = canvas?.getActiveObject()
    if (!obj || !canvas) return
    obj.set({ left: (obj.left || 0) + dx, top: (obj.top || 0) + dy })
    canvas.requestRenderAll()
    useEditorStore.getState().snapshotSoon()
  }
  useHotkeys('up', (e) => { e.preventDefault(); nudge(0, -1) }, { enableOnFormTags: false })
  useHotkeys('down', (e) => { e.preventDefault(); nudge(0, 1) }, { enableOnFormTags: false })
  useHotkeys('left', (e) => { e.preventDefault(); nudge(-1, 0) }, { enableOnFormTags: false })
  useHotkeys('right', (e) => { e.preventDefault(); nudge(1, 0) }, { enableOnFormTags: false })
  useHotkeys('shift+up', (e) => { e.preventDefault(); nudge(0, -10) }, { enableOnFormTags: false })
  useHotkeys('shift+down', (e) => { e.preventDefault(); nudge(0, 10) }, { enableOnFormTags: false })
  useHotkeys('shift+left', (e) => { e.preventDefault(); nudge(-10, 0) }, { enableOnFormTags: false })
  useHotkeys('shift+right', (e) => { e.preventDefault(); nudge(10, 0) }, { enableOnFormTags: false })
}
