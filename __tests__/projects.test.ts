import { describe, it, expect } from 'vitest'
import data from '../data/projects.json'

describe('projects data', () => {
  it('data is an array', () => {
    expect(Array.isArray(data)).toBe(true)
  })

  it('every project has required fields', () => {
    for (const p of data) {
      expect(p.id).toBeTruthy()
      expect(p.title).toBeTruthy()
      expect(p.description).toBeTruthy()
      expect(p.preview).toBeTruthy()
      expect(p.category).toBeTruthy()
      expect(p.screenshots).toBeInstanceOf(Array)
      expect(p.date).toBeTruthy()
    }
  })

  it('all IDs are unique', () => {
    const ids = data.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('pinned projects are 4 or fewer', () => {
    const pinned = data.filter((p) => p.pinned)
    expect(pinned.length).toBeLessThanOrEqual(4)
  })
})
