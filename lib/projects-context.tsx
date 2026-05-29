"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import raw from '../data/projects.json'

export type Project = {
  id: string
  title: string
  description: string
  preview: string
  pinned: boolean
  category: string
  screenshots: string[]
  video?: string
  date: string
  projectFolderId?: string
}

const data = raw as Project[]

const PROJECTS_STORAGE_KEY = 'portfolio_projects'

const CATEGORY_MAP: Record<string, string> = {
  'Development': 'Full Stack Dev',
  'Trading': 'Algo Trading',
}

function migrateCategories(projects: any[]): any[] {
  return projects.map((p) => ({
    ...p,
    category: CATEGORY_MAP[p.category] ?? p.category,
  }))
}

function mergeSourceProjects(saved: Project[]): Project[] {
  const seen = new Set<string>()
  const deduped = saved.filter((p) => { const k = p.id; if (seen.has(k)) return false; seen.add(k); return true })
  const savedIds = new Set(deduped.map((p) => p.id))
  const missing = (data as Project[]).filter((p) => !savedIds.has(p.id))
  return missing.length ? [...missing, ...deduped] : deduped
}

interface ProjectsContextType {
  projects: Project[]
  refresh: () => void
}

const ProjectsContext = createContext<ProjectsContextType>({ projects: [], refresh: () => {} })

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PROJECTS_STORAGE_KEY)
        if (saved) return mergeSourceProjects(migrateCategories(JSON.parse(saved)) as Project[])
      } catch { /* ignore */ }
    }
    return data as Project[]
  })

  const refresh = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PROJECTS_STORAGE_KEY)
        if (saved) {
          setProjects(mergeSourceProjects(migrateCategories(JSON.parse(saved)) as Project[]))
          return
        }
      } catch { /* ignore */ }
    }
    setProjects(data as Project[])
  }, [])

  useEffect(() => {
    refresh()
    const handle = () => refresh()
    window.addEventListener('storage', handle)
    window.addEventListener('projects-updated', handle)
    return () => {
      window.removeEventListener('storage', handle)
      window.removeEventListener('projects-updated', handle)
    }
  }, [refresh])

  return (
    <ProjectsContext.Provider value={{ projects, refresh }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  return useContext(ProjectsContext)
}
