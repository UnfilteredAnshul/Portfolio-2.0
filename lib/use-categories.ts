"use client";
import { useState, useEffect } from 'react'
import { categories as SEED } from './categories'

const KEY = 'portfolio_categories'
const EVENT = 'categories-updated'

function readCategories(): string[] {
  if (typeof window === 'undefined') return [...SEED]
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) return JSON.parse(saved) as string[]
  } catch { /* ignore */ }
  return [...SEED]
}

export function useCategories(): string[] {
  const [cats, setCats] = useState<string[]>([...SEED])

  useEffect(() => {
    setCats(readCategories())
  }, [])

  useEffect(() => {
    const handler = () => setCats(readCategories())
    window.addEventListener('storage', handler)
    window.addEventListener(EVENT, handler)
    return () => {
      window.removeEventListener('storage', handler)
      window.removeEventListener(EVENT, handler)
    }
  }, [])

  return cats
}

export function saveCategories(cats: string[]) {
  localStorage.setItem(KEY, JSON.stringify(cats))
  window.dispatchEvent(new Event(EVENT))
}

export function getCategories(): string[] {
  return readCategories()
}
