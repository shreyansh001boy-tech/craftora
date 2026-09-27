import { Canvas as FabricCanvas } from 'fabric'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { EditorState, LayerItem, CanvasSize, HistoryState, ToolType } from '@/types'
import { CANVAS_PRESETS } from '@/types'

const MAX_HISTORY = 50

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector((set, get) => ({
    // Canvas instance
    fabricCanvas: null,
    setFabricCanvas: (canvas: FabricCanvas) => set({ fabricCanvas: canvas }),

    // Tool
    activeTool: 'select',
    setActiveTool: (tool: ToolType) => set({ activeTool: tool }),

    // Canvas size
    canvasSize: CANVAS_PRESETS[0],
    setCanvasSize: (size: CanvasSize) => set({ canvasSize: size }),

    // Active object
    activeObjectId: null,
    setActiveObjectId: (id: string | null) => set({ activeObjectId: id }),

    // Layers
    layers: [],
    setLayers: (layers: LayerItem[]) => set({ layers }),
    syncLayersFromCanvas: () => {
      const canvas = get().fabricCanvas
      if (!canvas) return
      const objects = canvas.getObjects()
      const layers: LayerItem[] = objects
        .slice()
        .reverse()
        .map((obj, idx) => ({
          id: (obj as any).__uid || `obj-${idx}`,
          name: (obj as any).craftName || getDefaultName(obj.type || 'object', idx),
          type: obj.type || 'object',
          visible: obj.visible ?? true,
          locked: !(obj.selectable ?? true),
          fabricObject: obj,
        }))
      set({ layers })
    },

    // History
    history: [],
    historyIndex: -1,
    canUndo: false,
    canRedo: false,

    pushHistory: (state: HistoryState) => {
      const { history, historyIndex } = get()
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(state)
      if (newHistory.length > MAX_HISTORY) newHistory.shift()
      const newIndex = newHistory.length - 1
      set({
        history: newHistory,
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
      })
    },

    undo: () => {
      const { history, historyIndex, fabricCanvas } = get()
      if (historyIndex <= 0 || !fabricCanvas) return
      const newIndex = historyIndex - 1
      const state = history[newIndex]
      ;(fabricCanvas as any)._isRestoring = true
      fabricCanvas.loadFromJSON(JSON.parse(state.json)).then(() => {
        ;(fabricCanvas as any).backgroundColor = state.background
        fabricCanvas.requestRenderAll()
        ;(fabricCanvas as any)._isRestoring = false
        get().syncLayersFromCanvas()
      })
      set({ historyIndex: newIndex, canUndo: newIndex > 0, canRedo: true })
    },

    redo: () => {
      const { history, historyIndex, fabricCanvas } = get()
      if (historyIndex >= history.length - 1 || !fabricCanvas) return
      const newIndex = historyIndex + 1
      const state = history[newIndex]
      ;(fabricCanvas as any)._isRestoring = true
      fabricCanvas.loadFromJSON(JSON.parse(state.json)).then(() => {
        ;(fabricCanvas as any).backgroundColor = state.background
        fabricCanvas.requestRenderAll()
        ;(fabricCanvas as any)._isRestoring = false
        get().syncLayersFromCanvas()
      })
      set({ historyIndex: newIndex, canUndo: true, canRedo: newIndex < history.length - 1 })
    },

    // Project
    currentProjectId: null,
    setCurrentProjectId: (id) => set({ currentProjectId: id }),
    currentProjectName: 'Untitled Design',
    setCurrentProjectName: (name) => set({ currentProjectName: name }),
  }))
)

let counters: Record<string, number> = {}
function getDefaultName(type: string, idx: number): string {
  const labels: Record<string, string> = {
    rect: 'Rectangle',
    circle: 'Circle',
    triangle: 'Triangle',
    line: 'Line',
    path: 'Path',
    'i-text': 'Text',
    text: 'Text',
    image: 'Image',
    group: 'Group',
  }
  const label = labels[type] || 'Object'
  if (!counters[label]) counters[label] = 0
  counters[label]++
  return `${label} ${counters[label]}`
}

export function resetNameCounters() {
  counters = {}
}
