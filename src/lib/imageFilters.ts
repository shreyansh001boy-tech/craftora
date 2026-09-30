import { filters, type FabricImage, type FabricObject } from 'fabric'

export interface ImageAdjustments {
  brightness: number
  contrast: number
  saturation: number
  blur: number
}

export const NEUTRAL_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
}

export function isImageObject(obj: FabricObject | null | undefined): obj is FabricImage {
  return !!obj && obj.type === 'image'
}

export function readAdjustments(img: FabricImage): ImageAdjustments {
  const out = { ...NEUTRAL_ADJUSTMENTS }
  for (const f of img.filters ?? []) {
    if (!f) continue
    if (f instanceof filters.Brightness) out.brightness = f.brightness
    else if (f instanceof filters.Contrast) out.contrast = f.contrast
    else if (f instanceof filters.Saturation) out.saturation = f.saturation
    else if (f instanceof filters.Blur) out.blur = f.blur
  }
  return out
}

export function applyAdjustments(img: FabricImage, a: ImageAdjustments) {
  img.filters = [
    new filters.Brightness({ brightness: a.brightness }),
    new filters.Contrast({ contrast: a.contrast }),
    new filters.Saturation({ saturation: a.saturation }),
    ...(a.blur > 0 ? [new filters.Blur({ blur: a.blur })] : []),
  ]
  img.applyFilters()
}
