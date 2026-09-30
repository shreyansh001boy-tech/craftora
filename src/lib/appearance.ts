import { Color, Gradient, Shadow, type FabricObject, type GradientType } from 'fabric'

type AnyGradient = Gradient<GradientType>

export type FillMode = 'solid' | 'linear' | 'radial'

export interface GradientSpec {
  angle: number
  from: string
  to: string
}

export const DEFAULT_GRADIENT: GradientSpec = { angle: 90, from: '#F43F5E', to: '#6366F1' }

export interface ShadowSpec {
  color: string
  opacity: number
  blur: number
  offsetX: number
  offsetY: number
}

export const DEFAULT_SHADOW: ShadowSpec = {
  color: '#000000',
  opacity: 35,
  blur: 16,
  offsetX: 0,
  offsetY: 6,
}

export function isGradient(fill: unknown): fill is AnyGradient {
  return fill instanceof Gradient
}

/** Fabric paints a filler in the shape's own coordinate box, whose origin is the
 *  top-left corner and whose size is the unscaled width/height (verified against
 *  rendered pixels, since the docs describe it as centre-based). */
function halfExtent(width: number, height: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return (Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad))) / 2
}

export function buildGradient(mode: 'linear' | 'radial', spec: GradientSpec, width: number, height: number) {
  const rad = (spec.angle * Math.PI) / 180
  const cx = width / 2
  const cy = height / 2
  const colorStops = [
    { offset: 0, color: spec.from },
    { offset: 1, color: spec.to },
  ]
  if (mode === 'radial') {
    const r = Math.sqrt(cx * cx + cy * cy)
    return new Gradient({
      type: 'radial',
      gradientUnits: 'pixels',
      coords: { x1: cx, y1: cy, r1: 0, x2: cx, y2: cy, r2: r },
      colorStops,
    })
  }
  const e = halfExtent(width, height, spec.angle) || 1
  return new Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: {
      x1: cx - e * Math.cos(rad), y1: cy - e * Math.sin(rad),
      x2: cx + e * Math.cos(rad), y2: cy + e * Math.sin(rad),
    },
    colorStops,
  })
}

export function readGradient(fill: AnyGradient): GradientSpec {
  const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = fill.coords || {}
  const stops = fill.colorStops || []
  return {
    angle: fill.type === 'linear'
      ? Math.round(((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 360) % 360)
      : 0,
    from: stops[0]?.color || DEFAULT_GRADIENT.from,
    to: stops[1]?.color || stops[stops.length - 1]?.color || DEFAULT_GRADIENT.to,
  }
}

export function readShadow(obj: FabricObject): ShadowSpec {
  const s = obj.shadow
  if (!s) return { ...DEFAULT_SHADOW }
  const color = new Color(s.color || '#000000')
  return {
    color: `#${color.toHex()}`,
    opacity: Math.round(color.getAlpha() * 100),
    blur: s.blur || 0,
    offsetX: s.offsetX || 0,
    offsetY: s.offsetY || 0,
  }
}

export function buildShadow(spec: ShadowSpec) {
  return new Shadow({
    color: new Color(spec.color).setAlpha(spec.opacity / 100).toRgba(),
    blur: spec.blur,
    offsetX: spec.offsetX,
    offsetY: spec.offsetY,
  })
}

export const BLEND_MODES = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color dodge' },
  { value: 'color-burn', label: 'Color burn' },
  { value: 'hard-light', label: 'Hard light' },
  { value: 'soft-light', label: 'Soft light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
]
