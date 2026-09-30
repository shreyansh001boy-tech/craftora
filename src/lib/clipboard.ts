import { Canvas as FabricCanvas, FabricObject } from 'fabric'
import { useEditorStore } from '@/store/editorStore'

let clipboard: FabricObject | null = null

export async function copyActive(canvas: FabricCanvas) {
  const active = canvas.getActiveObject()
  if (!active) return
  clipboard = await active.clone()
}

export async function cutActive(canvas: FabricCanvas) {
  await copyActive(canvas)
  const active = canvas.getActiveObject()
  if (!active) return
  canvas.remove(active)
  canvas.discardActiveObject()
  canvas.requestRenderAll()
}

export async function pasteClipboard(canvas: FabricCanvas) {
  if (!clipboard) return
  const copy = await clipboard.clone()
  copy.set({
    left: (copy.left || 0) + 20,
    top: (copy.top || 0) + 20,
  })
  ;(copy as any).__uid = Math.random().toString(36).slice(2, 10)
  canvas.discardActiveObject()
  canvas.add(copy)
  canvas.setActiveObject(copy)
  canvas.requestRenderAll()
  clipboard = copy
}

export type ZMove = 'front' | 'forward' | 'backward' | 'back'

export function moveZOrder(canvas: FabricCanvas, where: ZMove) {
  const active = canvas.getActiveObject()
  if (!active) return
  if (where === 'front') canvas.bringObjectToFront(active)
  if (where === 'forward') canvas.bringObjectForward(active)
  if (where === 'backward') canvas.sendObjectBackwards(active)
  if (where === 'back') canvas.sendObjectToBack(active)
  canvas.requestRenderAll()
  useEditorStore.getState().snapshot()
}
