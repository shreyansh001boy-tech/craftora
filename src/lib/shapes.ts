import { Canvas as FabricCanvas, Rect, Circle, Triangle, Line, Path, IText, FabricImage, PencilBrush, type FabricObject } from 'fabric'
import { nanoid } from 'nanoid'

function uid() {
  return nanoid(8)
}

function setUid(obj: FabricObject) {
  ;(obj as any).__uid = uid()
}

function centerObj(canvas: FabricCanvas, obj: FabricObject) {
  const w = (obj as any).width || 100
  const h = (obj as any).height || 100
  obj.set({
    left: canvas.getWidth() / 2 - w / 2,
    top: canvas.getHeight() / 2 - h / 2,
  })
  setUid(obj)
}

export function addRect(canvas: FabricCanvas) {
  const obj = new Rect({
    width: 200,
    height: 140,
    fill: '#3C3C4E',
    stroke: 'transparent',
    strokeWidth: 0,
    rx: 4,
    ry: 4,
  })
  centerObj(canvas, obj)
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
  return obj
}

export function addCircle(canvas: FabricCanvas) {
  const obj = new Circle({
    radius: 80,
    fill: '#3C3C4E',
    stroke: 'transparent',
    strokeWidth: 0,
  })
  setUid(obj)
  obj.set({
    left: canvas.getWidth() / 2 - 80,
    top: canvas.getHeight() / 2 - 80,
  })
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
  return obj
}

export function addTriangle(canvas: FabricCanvas) {
  const obj = new Triangle({
    width: 160,
    height: 140,
    fill: '#3C3C4E',
    stroke: 'transparent',
    strokeWidth: 0,
  })
  centerObj(canvas, obj)
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
  return obj
}

export function addLine(canvas: FabricCanvas) {
  const obj = new Line(
    [canvas.getWidth() / 2 - 100, canvas.getHeight() / 2,
     canvas.getWidth() / 2 + 100, canvas.getHeight() / 2],
    {
      stroke: '#C4C4D4',
      strokeWidth: 2,
      selectable: true,
    }
  )
  setUid(obj)
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
  return obj
}

export function addArrow(canvas: FabricCanvas) {
  const cx = canvas.getWidth() / 2
  const cy = canvas.getHeight() / 2
  const obj = new Path(
    `M ${cx - 80} ${cy} L ${cx + 60} ${cy} M ${cx + 40} ${cy - 18} L ${cx + 80} ${cy} L ${cx + 40} ${cy + 18}`,
    {
      stroke: '#C4C4D4',
      strokeWidth: 2,
      fill: 'transparent',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
    }
  )
  setUid(obj)
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
  return obj
}

export function addIText(canvas: FabricCanvas, text = 'Double-click to edit') {
  const obj = new IText(text, {
    left: canvas.getWidth() / 2 - 150,
    top: canvas.getHeight() / 2 - 20,
    fontFamily: 'Inter',
    fontSize: 32,
    fill: '#E8E8F0',
    fontWeight: '400',
  })
  setUid(obj)
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
  return obj
}

export function addEmoji(emoji: string, canvas: FabricCanvas) {
  const obj = new IText(emoji, {
    left: canvas.getWidth() / 2 - 40,
    top: canvas.getHeight() / 2 - 40,
    fontSize: 72,
    selectable: true,
  })
  setUid(obj)
  canvas.add(obj)
  canvas.setActiveObject(obj)
  canvas.requestRenderAll()
  return obj
}

export async function addImageFromDataUrl(canvas: FabricCanvas, dataUrl: string) {
  const img = await FabricImage.fromURL(dataUrl)
  const maxW = canvas.getWidth() * 0.7
  const maxH = canvas.getHeight() * 0.7
  const scale = Math.min(maxW / (img.width || 1), maxH / (img.height || 1), 1)
  img.scale(scale)
  img.set({
    left: canvas.getWidth() / 2 - (img.width! * scale) / 2,
    top: canvas.getHeight() / 2 - (img.height! * scale) / 2,
  })
  ;(img as any).__uid = uid()
  canvas.add(img)
  canvas.setActiveObject(img)
  canvas.requestRenderAll()
  return img
}

export function enablePencil(canvas: FabricCanvas, color = '#F43F5E', width = 3) {
  const brush = new PencilBrush(canvas)
  brush.color = color
  brush.width = width
  canvas.freeDrawingBrush = brush
  canvas.isDrawingMode = true
}

export function disablePencil(canvas: FabricCanvas) {
  canvas.isDrawingMode = false
}

export function duplicateActiveObject(canvas: FabricCanvas) {
  const obj = canvas.getActiveObject()
  if (!obj) return
  obj.clone().then((cloned: any) => {
    cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 })
    cloned.__uid = uid()
    canvas.add(cloned)
    canvas.setActiveObject(cloned)
    canvas.requestRenderAll()
  })
}
