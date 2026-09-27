import Dexie, { type Table } from 'dexie'
import type { Project } from '@/types'

class CraftoraDB extends Dexie {
  projects!: Table<Project>

  constructor() {
    super('CraftoraDB')
    this.version(1).stores({
      projects: 'id, name, updatedAt',
    })
  }
}

export const db = new CraftoraDB()
