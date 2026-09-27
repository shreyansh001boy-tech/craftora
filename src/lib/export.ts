import { Canvas as FabricCanvas } from 'fabric'
import { saveAs } from 'file-saver'

export type ExportFormat = 'png' | 'jpeg'

export async function exportCanvas(
  canvas: FabricCanvas,
  format: ExportFormat,
  quality: number,
  filename: string
) {
  const dataUrl = canvas.toDataURL({
    format,
    quality,
    multiplier: 1,
  })

  const response = await fetch(dataUrl)
  const blob = await response.blob()
  saveAs(blob, `${filename}.${format}`)
}
