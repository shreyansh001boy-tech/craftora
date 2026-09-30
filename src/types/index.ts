import { Canvas as FabricCanvas, FabricObject } from 'fabric'

export type ToolType =
  | 'select'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'pencil'
  | 'text'
  | 'image'

export interface CanvasSize {
  width: number
  height: number
  label: string
}

export const CANVAS_PRESETS: CanvasSize[] = [
  { width: 1080, height: 1080, label: 'Instagram Post' },
  { width: 1080, height: 1920, label: 'Instagram Story' },
  { width: 1280, height: 720, label: 'Presentation 16:9' },
  { width: 1280, height: 720, label: 'YouTube Thumbnail' },
  { width: 794,  height: 1123, label: 'A4 Portrait' },
  { width: 816,  height: 1056, label: 'US Letter' },
  { width: 1500, height: 500,  label: 'Twitter Banner' },
  { width: 1200, height: 630,  label: 'Open Graph / OG Image' },
  { width: 800,  height: 800,  label: 'Square (800×800)' },
]

export interface LayerItem {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  fabricObject: FabricObject
}

export interface Project {
  id: string
  name: string
  json: string
  thumbnail: string
  canvasSize: CanvasSize
  updatedAt: number
}

export interface HistoryState {
  json: string
  background: string
}

export interface EditorState {
  // Canvas
  fabricCanvas: FabricCanvas | null
  setFabricCanvas: (canvas: FabricCanvas | null) => void

  // Active tool
  activeTool: ToolType
  setActiveTool: (tool: ToolType) => void

  // Canvas size
  canvasSize: CanvasSize
  setCanvasSize: (size: CanvasSize) => void

  // Active object
  activeObjectId: string | null
  setActiveObjectId: (id: string | null) => void

  // Layers
  layers: LayerItem[]
  setLayers: (layers: LayerItem[]) => void
  syncLayersFromCanvas: () => void

  // History
  history: HistoryState[]
  historyIndex: number
  pushHistory: (state: HistoryState) => void
  snapshot: () => void
  snapshotSoon: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean

  // Viewport
  fitScale: number
  setFitScale: (scale: number) => void
  viewZoom: number
  setViewZoom: (zoom: number) => void
  viewNonce: number
  resetView: () => void

  showGrid: boolean
  setShowGrid: (show: boolean) => void
  toggleGrid: () => void

  // Bumped whenever something other than the Properties panel replaces the
  // canvas background, so the panel can re-read it instead of going stale.
  bgNonce: number
  bumpBgNonce: () => void

  // Current project
  currentProjectId: string | null
  setCurrentProjectId: (id: string | null) => void
  currentProjectName: string
  setCurrentProjectName: (name: string) => void
}
