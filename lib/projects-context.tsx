"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

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

interface ProjectsContextType {
  projects: Project[]
  refresh: () => void
}

const ProjectsContext = createContext<ProjectsContextType>({ projects: [], refresh: () => {} })

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])

  const refresh = useCallback(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((apiData) => {
        if (Array.isArray(apiData) && apiData.length > 0) {
          setProjects(migrateCategories(apiData) as Project[])
          try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(apiData)) } catch {}
          return
        }
        throw new Error('empty')
      })
      .catch(() => {
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem(PROJECTS_STORAGE_KEY)
            if (saved) {
              setProjects(migrateCategories(JSON.parse(saved)) as Project[])
              return
            }
          } catch {}
        }
        setProjects([])
      })
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
