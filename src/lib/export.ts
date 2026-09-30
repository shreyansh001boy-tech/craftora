import { Canvas as FabricCanvas } from 'fabric'
import { saveAs } from 'file-saver'

export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'pdf' | 'pptx'

export interface ExportOptions {
  scale?: number
  transparent?: boolean
}

/** Renders the canvas at `scale`, optionally without the background fill. */
function rasterize(
  canvas: FabricCanvas,
  { scale = 1, transparent = false, format = 'png', quality = 1 }:
    { scale?: number; transparent?: boolean; format?: 'png' | 'jpeg'; quality?: number },
): string {
  const background = canvas.backgroundColor
  if (transparent) canvas.backgroundColor = ''
  try {
    return canvas.toDataURL({ format, quality, multiplier: scale })
  } finally {
    if (transparent) {
      canvas.backgroundColor = background
      canvas.requestRenderAll()
    }
  }
}

export async function exportCanvas(
  canvas: FabricCanvas,
  format: ExportFormat,
  quality: number,
  filename: string,
  { scale = 1, transparent = false }: ExportOptions = {},
) {
  if (format === 'svg') {
    saveAs(
      new Blob([canvas.toSVG()], { type: 'image/svg+xml' }),
      `${filename}.svg`,
    )
    return
  }

  if (format === 'pdf' || format === 'pptx') {
    // Neither format handles a transparent page well, so always keep the background.
    const dataUrl = rasterize(canvas, { scale, format: 'png' })
    const width = canvas.getWidth()
    const height = canvas.getHeight()
    if (format === 'pdf') await savePdf(dataUrl, width, height, filename)
    else await savePptx(dataUrl, width, height, filename)
    return
  }

  saveAs(
    await (await fetch(rasterize(canvas, { scale, transparent, format, quality }))).blob(),
    `${filename}.${format}`,
  )
}

// jsPDF's own "px" unit scales 1px -> 1.333pt, which would put a 1080px square on a
// 20in page. Converting at 96dpi instead gives 810pt (11.25in) and a true 96dpi print.
async function savePdf(dataUrl: string, width: number, height: number, filename: string) {
  const { jsPDF } = await import('jspdf')
  const ptW = Math.round(width * 0.75)
  const ptH = Math.round(height * 0.75)
  const doc = new jsPDF({
    orientation: ptW > ptH ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [ptW, ptH],
    compress: true,
  })
  doc.addImage(dataUrl, 'PNG', 0, 0, ptW, ptH, undefined, 'FAST')
  doc.save(`${filename}.pdf`)
}

// PowerPoint stores slide size in EMU; pptxgenjs takes inches, so 96px = 1in.
async function savePptx(dataUrl: string, width: number, height: number, filename: string) {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  const w = width / 96
  const h = height / 96
  pptx.defineLayout({ name: 'CRAFTORA', width: w, height: h })
  pptx.layout = 'CRAFTORA'
  pptx.title = filename
  const slide = pptx.addSlide()
  slide.addImage({ data: dataUrl, x: 0, y: 0, w, h })
  await pptx.writeFile({ fileName: `${filename}.pptx` })
}

export function captureThumbnail(canvas: FabricCanvas): string {
  return canvas.toDataURL({ format: 'jpeg', quality: 0.4, multiplier: 0.15 })
}
