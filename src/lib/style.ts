import type { FabricObject, IText } from 'fabric'
import { buildGradient, buildShadow, isGradient, readGradient, readShadow, type GradientSpec, type ShadowSpec } from './appearance'

const VISUAL_PROPS = ['stroke', 'strokeWidth', 'strokeDashArray', 'opacity', 'rx', 'ry'] as const
const TEXT_PROPS = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'underline', 'lineHeight', 'charSpacing'] as const

const isTextObject = (o: FabricObject) => o.type === 'i-text' || o.type === 'text'

interface StoredStyle {
  solidFill: string | null
  gradient: { mode: 'linear' | 'radial'; spec: GradientSpec } | null
  visual: Record<string, unknown>
  shadow: ShadowSpec | null
  text: Record<string, unknown> | null
}

let stored: StoredStyle | null = null

function pick(obj: FabricObject, keys: readonly string[]) {
  const out: Record<string, unknown> = {}
  for (const k of keys) {
    const v = (obj as any)[k]
    if (v !== undefined) out[k] = v
  }
  return out
}

export function copyStyle(obj: FabricObject | null | undefined): boolean {
  if (!obj) return false
  const fill = obj.fill
  stored = {
    solidFill: typeof fill === 'string' ? fill : null,
    gradient: isGradient(fill) ? { mode: fill.type === 'radial' ? 'radial' : 'linear', spec: readGradient(fill) } : null,
    visual: pick(obj, VISUAL_PROPS),
    shadow: obj.shadow ? readShadow(obj) : null,
    text: isTextObject(obj) ? pick(obj as IText, TEXT_PROPS) : null,
  }
  return true
}

export function pasteStyle(obj: FabricObject | null | undefined): boolean {
  if (!obj || !stored) return false
  const patch: Record<string, any> = {
    ...stored.visual,
    shadow: stored.shadow ? buildShadow(stored.shadow) : null,
  }

  if (stored.gradient) {
    patch.fill = buildGradient(stored.gradient.mode, stored.gradient.spec, obj.width || 100, obj.height || 100)
  } else if (stored.solidFill !== null) {
    patch.fill = stored.solidFill
  }
  if (stored.text && isTextObject(obj)) Object.assign(patch, stored.text)

  obj.set(patch as any)
  obj.dirty = true
  return true
}
