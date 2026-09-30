import { Canvas as FabricCanvas } from 'fabric'

const SNAP_PX = 6

interface Candidate {
  pos: number
  start: number
  end: number
}

function axisCandidates(rect: { left: number; top: number; width: number; height: number }) {
  const v: Candidate[] = []
  const h: Candidate[] = []
  v.push(
    { pos: rect.left, start: rect.top, end: rect.top + rect.height },
    { pos: rect.left + rect.width / 2, start: rect.top, end: rect.top + rect.height },
    { pos: rect.left + rect.width, start: rect.top, end: rect.top + rect.height },
  )
  h.push(
    { pos: rect.top, start: rect.left, end: rect.left + rect.width },
    { pos: rect.top + rect.height / 2, start: rect.left, end: rect.left + rect.width },
    { pos: rect.top + rect.height, start: rect.left, end: rect.left + rect.width },
  )
  return { v, h }
}

function bestDelta(refs: number[], candidates: Candidate[], threshold: number) {
  let best: { delta: number; candidate: Candidate } | null = null
  for (const ref of refs) {
    for (const candidate of candidates) {
      const delta = candidate.pos - ref
      if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) {
        best = { delta, candidate }
      }
    }
  }
  return best
}

/**
 * Fabric 7 dropped object snapping, so guides are computed here and painted into
 * a DOM overlay that shares the artboard's coordinate space (1 canvas unit = 1px).
 */
export function attachAlignmentGuides(
  canvas: FabricCanvas,
  overlay: HTMLElement,
  getScale: () => number,
) {
  const makeLine = (vertical: boolean) => {
    const el = document.createElement('div')
    el.style.cssText = vertical
      ? 'position:absolute;left:0;top:0;width:1px;height:0;background:#F43F5E;pointer-events:none;display:none;z-index:2'
      : 'position:absolute;left:0;top:0;height:1px;width:0;background:#F43F5E;pointer-events:none;display:none;z-index:2'
    overlay.appendChild(el)
    return el
  }
  const vLine = makeLine(true)
  const hLine = makeLine(false)

  const hide = () => {
    vLine.style.display = 'none'
    hLine.style.display = 'none'
  }

  const onMoving = () => {
    const active = canvas.getActiveObject()
    if (!active) return hide()

    const threshold = SNAP_PX / (getScale() || 1)
    const bounds = active.getBoundingRect()
    const width = canvas.getWidth()
    const height = canvas.getHeight()

    const vCandidates: Candidate[] = [
      { pos: 0, start: 0, end: height },
      { pos: width / 2, start: 0, end: height },
      { pos: width, start: 0, end: height },
    ]
    const hCandidates: Candidate[] = [
      { pos: 0, start: 0, end: width },
      { pos: height / 2, start: 0, end: width },
      { pos: height, start: 0, end: width },
    ]

    for (const obj of canvas.getObjects()) {
      if (obj === active || obj.visible === false) continue
      const other = axisCandidates(obj.getBoundingRect())
      vCandidates.push(...other.v)
      hCandidates.push(...other.h)
    }

    const moved = { left: active.left || 0, top: active.top || 0 }
    const boundsRight = bounds.left + bounds.width
    const boundsBottom = bounds.top + bounds.height

    const snapX = bestDelta(
      [bounds.left, bounds.left + bounds.width / 2, boundsRight],
      vCandidates,
      threshold,
    )
    const snapY = bestDelta(
      [bounds.top, bounds.top + bounds.height / 2, boundsBottom],
      hCandidates,
      threshold,
    )

    if (snapX) active.set({ left: moved.left + snapX.delta })
    if (snapY) active.set({ top: moved.top + snapY.delta })

    if (snapX) {
      vLine.style.display = 'block'
      vLine.style.left = `${snapX.candidate.pos}px`
      vLine.style.top = `${Math.min(snapX.candidate.start, bounds.top)}px`
      vLine.style.height = `${Math.max(0, Math.max(snapX.candidate.end, boundsBottom) - Math.min(snapX.candidate.start, bounds.top))}px`
    } else vLine.style.display = 'none'

    if (snapY) {
      hLine.style.display = 'block'
      hLine.style.top = `${snapY.candidate.pos}px`
      hLine.style.left = `${Math.min(snapY.candidate.start, bounds.left)}px`
      hLine.style.width = `${Math.max(0, Math.max(snapY.candidate.end, boundsRight) - Math.min(snapY.candidate.start, bounds.left))}px`
    } else hLine.style.display = 'none'

    if (snapX || snapY) canvas.requestRenderAll()
  }

  canvas.on('object:moving', onMoving)
  canvas.on('mouse:up', hide)
  canvas.on('selection:cleared', hide)

  return () => {
    canvas.off('object:moving', onMoving)
    canvas.off('mouse:up', hide)
    canvas.off('selection:cleared', hide)
    vLine.remove()
    hLine.remove()
  }
}
