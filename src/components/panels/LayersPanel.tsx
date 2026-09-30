import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor,
  useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, EyeOff, Lock, Unlock, Trash2, GripVertical, Square, Circle, Triangle, Type, Image, Minus, Pencil } from 'lucide-react'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { useEditorStore } from '@/store/editorStore'
import type { LayerItem } from '@/types'
import { cn } from '@/lib/cn'
import { motion } from 'framer-motion'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion'

function typeIcon(type: string) {
  const props = { size: 12, strokeWidth: 1.5 }
  switch (type) {
    case 'rect': return <Square {...props} />
    case 'circle': return <Circle {...props} />
    case 'triangle': return <Triangle {...props} />
    case 'i-text': case 'text': return <Type {...props} />
    case 'image': return <Image {...props} />
    case 'line': return <Minus {...props} />
    case 'path': return <Pencil {...props} />
    default: return <Square {...props} />
  }
}

function SortableLayer({ layer, isActive }: { layer: LayerItem; isActive: boolean }) {
  const canvas = useFabricCanvas()
  const { setActiveObjectId, syncLayersFromCanvas } = useEditorStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id })

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(layer.name)

  const select = () => {
    if (!canvas) return
    canvas.setActiveObject(layer.fabricObject)
    canvas.requestRenderAll()
    setActiveObjectId(layer.id)
  }

  const toggleVisible = (e: React.MouseEvent) => {
    e.stopPropagation()
    layer.fabricObject.set({ visible: !layer.fabricObject.visible })
    canvas?.requestRenderAll()
    syncLayersFromCanvas()
  }

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation()
    const locked = !(layer.fabricObject.selectable ?? true)
    layer.fabricObject.set({ selectable: locked, evented: locked })
    canvas?.requestRenderAll()
    syncLayersFromCanvas()
  }

  const deleteLayer = (e: React.MouseEvent) => {
    e.stopPropagation()
    canvas?.remove(layer.fabricObject)
    canvas?.requestRenderAll()
    syncLayersFromCanvas()
  }

  return (
    <motion.div
      ref={setNodeRef}
      variants={staggerItemVariants}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        height: 32,
        padding: '0 8px',
        borderRadius: 6,
        cursor: 'pointer',
        background: isActive ? 'var(--color-base-700)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--color-accent-400)' : '2px solid transparent',
        color: isActive ? 'var(--color-base-100)' : 'var(--color-base-400)',
        userSelect: 'none',
      }}
      onClick={select}
      whileHover={{ backgroundColor: isActive ? undefined : 'var(--color-base-750)' }}
    >
      <span {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--color-base-600)', flexShrink: 0 }}>
        <GripVertical size={12} />
      </span>
      <span style={{ flexShrink: 0, color: 'var(--color-base-500)' }}>{typeIcon(layer.type)}</span>

      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            ;(layer.fabricObject as any).craftName = name
            syncLayersFromCanvas()
            setEditing(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, height: 20, background: 'var(--color-base-700)', border: '1px solid var(--color-accent-400)', borderRadius: 3, color: 'var(--color-base-100)', fontSize: 12, padding: '0 4px', outline: 'none' }}
        />
      ) : (
        <span
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true) }}
          style={{ flex: 1, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {layer.name}
        </span>
      )}

      <button onClick={toggleVisible} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 2, flexShrink: 0 }} aria-label="Toggle visibility">
        {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
      </button>
      <button onClick={toggleLock} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 2, flexShrink: 0 }} aria-label="Toggle lock">
        {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
      </button>
      <button onClick={deleteLayer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 2, flexShrink: 0 }} aria-label="Delete layer">
        <Trash2 size={12} />
      </button>
    </motion.div>
  )
}

export function LayersPanel() {
  const canvas = useFabricCanvas()
  const { layers, setLayers, activeObjectId, snapshot } = useEditorStore()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !canvas) return
    const oldIndex = layers.findIndex((l) => l.id === active.id)
    const newIndex = layers.findIndex((l) => l.id === over.id)
    const newLayers = arrayMove(layers, oldIndex, newIndex)
    setLayers(newLayers)
    // Reorder Fabric canvas objects
    newLayers.slice().reverse().forEach((layer, idx) => {
      canvas.moveObjectTo(layer.fabricObject, idx)
    })
    canvas.requestRenderAll()
    snapshot()
  }

  return (
    <div style={{ padding: '8px 6px' }}>
      <div className="panel-heading" style={{ paddingLeft: 6 }}>
        Layers ({layers.length})
      </div>
      {layers.length === 0 && (
        <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--color-base-500)', fontSize: 12 }}>
          No objects yet. Add shapes, text, or images.
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={layers.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <motion.div variants={staggerContainerVariants} initial="hidden" animate="visible">
            {layers.map((layer) => (
              <SortableLayer key={layer.id} layer={layer} isActive={activeObjectId === layer.id} />
            ))}
          </motion.div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
