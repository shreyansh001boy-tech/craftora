import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, FolderOpen, Clock } from 'lucide-react'
import { useProjects, saveProject, deleteProject } from '@/hooks/useProjects'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { useEditorStore } from '@/store/editorStore'
import { nanoid } from 'nanoid'
import type { Project } from '@/types'
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion'

export function ProjectsPanel() {
  const canvas = useFabricCanvas()
  const projects = useProjects()
  const { canvasSize, currentProjectName, setCurrentProjectName, setCurrentProjectId, currentProjectId } = useEditorStore()
  const [saving, setSaving] = useState(false)
  const [confirmLoad, setConfirmLoad] = useState<Project | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  const handleSave = async () => {
    if (!canvas) return
    setSaving(true)
    const name = nameInput.trim() || currentProjectName || `Design ${new Date().toLocaleDateString()}`
    const json = JSON.stringify(canvas.toJSON())
    const thumbnail = canvas.toDataURL({ format: 'jpeg', quality: 0.4, multiplier: 0.15 })
    const project: Project = {
      id: currentProjectId || nanoid(),
      name,
      json,
      thumbnail,
      canvasSize,
      updatedAt: Date.now(),
    }
    await saveProject(project)
    setCurrentProjectName(name)
    setCurrentProjectId(project.id)
    setSaving(false)
    setShowSaveForm(false)
  }

  const handleLoad = async (project: Project) => {
    if (!canvas) return
    ;(canvas as any)._isRestoring = true
    await canvas.loadFromJSON(JSON.parse(project.json))
    canvas.requestRenderAll()
    ;(canvas as any)._isRestoring = false
    setCurrentProjectId(project.id)
    setCurrentProjectName(project.name)
    useEditorStore.getState().syncLayersFromCanvas()
    setConfirmLoad(null)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteProject(id)
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Save button */}
      <div style={{ padding: '8px 12px' }}>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="btn-primary btn-base"
          style={{ width: '100%', height: 32, fontSize: 12 }}
        >
          {saving ? 'Saving…' : '+ Save Current Project'}
        </button>
      </div>

      {showSaveForm && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '0 12px 12px', display: 'flex', gap: 6 }}
        >
          <input
            autoFocus
            placeholder="Project name…"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="input-base"
            style={{ flex: 1 }}
          />
          <button onClick={handleSave} className="btn-primary btn-base" style={{ height: 28, padding: '0 12px', fontSize: 12 }}>Save</button>
        </motion.div>
      )}

      <div className="panel-heading">Saved Projects ({projects?.length || 0})</div>

      {(!projects || projects.length === 0) && (
        <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--color-base-500)', fontSize: 12 }}>
          No saved projects yet. Save your work!
        </div>
      )}

      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {projects?.map((project) => (
          <motion.div
            key={project.id}
            variants={staggerItemVariants}
            onClick={() => setConfirmLoad(project)}
            style={{
              display: 'flex',
              gap: 10,
              padding: 8,
              borderRadius: 8,
              cursor: 'pointer',
              background: currentProjectId === project.id ? 'var(--color-base-750)' : 'var(--color-base-800)',
              border: currentProjectId === project.id ? '1px solid var(--color-accent-400)' : '1px solid var(--color-base-600)',
              transition: 'all 150ms',
            }}
          >
            {/* Thumbnail */}
            <img
              src={project.thumbnail}
              style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: '#333' }}
              alt={project.name}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-base-100)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-base-500)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                <Clock size={10} />
                {formatDate(project.updatedAt)}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-base-500)', marginTop: 2 }}>
                {project.canvasSize?.label || '—'}
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(project.id, e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-base-500)', padding: 2, alignSelf: 'flex-start' }}
              aria-label="Delete project"
            >
              <Trash2 size={12} />
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Load confirm */}
      {confirmLoad && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ padding: 24, background: 'var(--color-base-800)', border: '1px solid var(--color-base-600)', borderRadius: 10, maxWidth: 320, width: '90%', boxShadow: 'var(--shadow-float)' }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-base-100)', marginBottom: 8 }}>Open Project?</div>
            <div style={{ fontSize: 12, color: 'var(--color-base-400)', marginBottom: 20 }}>
              Opening "{confirmLoad.name}" will replace your current canvas. Unsaved changes will be lost.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmLoad(null)} className="btn-base" style={{ padding: '0 16px', height: 32, fontSize: 12 }}>Cancel</button>
              <button onClick={() => handleLoad(confirmLoad)} className="btn-primary btn-base" style={{ padding: '0 16px', height: 32, fontSize: 12 }}>Open</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
