import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/db'
import type { Project } from '@/types'

export function useProjects() {
  return useLiveQuery(() => db.projects.orderBy('updatedAt').reverse().toArray(), [])
}

export async function saveProject(project: Project) {
  await db.projects.put(project)
}

export async function deleteProject(id: string) {
  await db.projects.delete(id)
}

export async function getProject(id: string) {
  return db.projects.get(id)
}
