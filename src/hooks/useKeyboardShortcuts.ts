import { useHotkeys } from 'react-hotkeys-hook'
import { ActiveSelection } from 'fabric'
import { useEditorStore } from '@/store/editorStore'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { duplicateActiveObject, addRect, addCircle, addIText, enablePencil, disablePencil } from '@/lib/shapes'

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

  // Tool shortcuts
  useHotkeys('v', () => { setActiveTool('select'); if (canvas) canvas.isDrawingMode = false })
  useHotkeys('r', () => { if (canvas) { addRect(canvas); setActiveTool('select') } })
  useHotkeys('c', () => { if (canvas) { addCircle(canvas); setActiveTool('select') } })
  useHotkeys('t', () => { if (canvas) { addIText(canvas); setActiveTool('select') } })
  useHotkeys('p', () => { if (canvas) { enablePencil(canvas); setActiveTool('pencil') } })

  // Arrow nudge — 1px
  useHotkeys('up', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ top: (obj.top || 0) - 1 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })
  useHotkeys('down', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ top: (obj.top || 0) + 1 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })
  useHotkeys('left', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ left: (obj.left || 0) - 1 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })
  useHotkeys('right', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ left: (obj.left || 0) + 1 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })

  // Shift+Arrow — 10px nudge
  useHotkeys('shift+up', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ top: (obj.top || 0) - 10 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })
  useHotkeys('shift+down', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ top: (obj.top || 0) + 10 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })
  useHotkeys('shift+left', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ left: (obj.left || 0) - 10 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })
  useHotkeys('shift+right', (e) => {
    e.preventDefault()
    const obj = canvas?.getActiveObject()
    if (!obj) return
    obj.set({ left: (obj.left || 0) + 10 })
    canvas?.requestRenderAll()
  }, { enableOnFormTags: false })
}
