import { motion } from 'framer-motion'
import {
  MousePointer2, Square, Circle, Triangle, Minus, ArrowRight,
  PenLine, Type, Image, Smile
} from 'lucide-react'
import { Tooltip } from '@/components/ui/Tooltip'
import { useEditorStore } from '@/store/editorStore'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import {
  addRect, addCircle, addTriangle, addLine, addArrow,
  addIText, enablePencil, disablePencil,
} from '@/lib/shapes'
import type { ToolType } from '@/types'
import { cn } from '@/lib/cn'

interface Tool {
  id: ToolType
  icon: React.ReactNode
  label: string
  shortcut?: string
}

const tools: Tool[] = [
  { id: 'select',   icon: <MousePointer2 size={16} strokeWidth={1.5} />, label: 'Select', shortcut: 'V' },
  { id: 'rect',     icon: <Square size={16} strokeWidth={1.5} />,        label: 'Rectangle', shortcut: 'R' },
  { id: 'circle',   icon: <Circle size={16} strokeWidth={1.5} />,        label: 'Circle', shortcut: 'C' },
  { id: 'triangle', icon: <Triangle size={16} strokeWidth={1.5} />,      label: 'Triangle', shortcut: 'T' },
  { id: 'line',     icon: <Minus size={16} strokeWidth={1.5} />,         label: 'Line', shortcut: 'L' },
  { id: 'arrow',    icon: <ArrowRight size={16} strokeWidth={1.5} />,    label: 'Arrow' },
  { id: 'pencil',   icon: <PenLine size={16} strokeWidth={1.5} />,       label: 'Pencil', shortcut: 'P' },
  { id: 'text',     icon: <Type size={16} strokeWidth={1.5} />,          label: 'Text', shortcut: 'T' },
]

export function Toolbar() {
  const { activeTool, setActiveTool } = useEditorStore()
  const canvas = useFabricCanvas()

  const handleTool = (tool: ToolType) => {
    if (!canvas) return
    setActiveTool(tool)

    // Deactivate pencil when switching away
    if (tool !== 'pencil') disablePencil(canvas)

    switch (tool) {
      case 'rect':     addRect(canvas);     setActiveTool('select'); break
      case 'circle':   addCircle(canvas);   setActiveTool('select'); break
      case 'triangle': addTriangle(canvas); setActiveTool('select'); break
      case 'line':     addLine(canvas);     setActiveTool('select'); break
      case 'arrow':    addArrow(canvas);    setActiveTool('select'); break
      case 'text':     addIText(canvas);    setActiveTool('select'); break
      case 'pencil':   enablePencil(canvas); break
      case 'select':   canvas.isDrawingMode = false; break
    }
  }

  // Image upload trigger
  const triggerImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !canvas) return
      const { addImageFromDataUrl } = await import('@/lib/shapes')
      const reader = new FileReader()
      reader.onload = async (ev) => {
        await addImageFromDataUrl(canvas, ev.target!.result as string)
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      style={{
        width: 48,
        background: 'var(--color-base-875)',
        borderRight: '1px solid var(--color-base-600)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        gap: 2,
        flexShrink: 0,
      }}
    >
      {tools.map((tool) => (
        <Tooltip key={tool.id} content={tool.label} shortcut={tool.shortcut}>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleTool(tool.id)}
            aria-label={tool.label}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-md transition-all duration-80',
              activeTool === tool.id ? 'tool-active' : 'text-[var(--color-base-400)] hover:bg-[var(--color-base-750)] hover:text-[var(--color-base-200)]'
            )}
          >
            {tool.icon}
          </motion.button>
        </Tooltip>
      ))}

      {/* Separator */}
      <div style={{ width: 28, height: 1, background: 'var(--color-base-600)', margin: '4px 0' }} />

      {/* Image upload */}
      <Tooltip content="Add Image" shortcut="I">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={triggerImageUpload}
          aria-label="Add Image"
          className="w-9 h-9 flex items-center justify-center rounded-md transition-all duration-80 text-[var(--color-base-400)] hover:bg-[var(--color-base-750)] hover:text-[var(--color-base-200)]"
        >
          <Image size={16} strokeWidth={1.5} />
        </motion.button>
      </Tooltip>

      {/* Emoji (opens sticker panel) */}
      <Tooltip content="Emoji & Stickers">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => useEditorStore.getState().setActiveTool('image')}
          aria-label="Emoji and Stickers"
          className="w-9 h-9 flex items-center justify-center rounded-md transition-all duration-80 text-[var(--color-base-400)] hover:bg-[var(--color-base-750)] hover:text-[var(--color-base-200)]"
        >
          <Smile size={16} strokeWidth={1.5} />
        </motion.button>
      </Tooltip>
    </motion.aside>
  )
}
