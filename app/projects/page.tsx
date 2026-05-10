"use client";
import React, { useMemo, useState } from 'react'
import data from '../../data/projects.json'

type Project = typeof data[number]

export default function ProjectsPage() {
  const all = data as Project[]
  const categories = useMemo(() => Array.from(new Set(all.map(p => p.category).filter(Boolean))), [all])
  const [selected, setSelected] = useState<string[]>([])
  const visible = all.filter((p) => selected.length === 0 || selected.includes(p.category ?? ''))
  const toggle = (c: string) => {
    setSelected((s) => (s.includes(c) ? s.filter(x => x !== c) : [...s, c]))
  }
  return (
    <section style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem' }}>All Projects</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: '#ccc' }}>Filter by categories:</span>
          {categories.map((c) => (
            <label key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, background: '#111' }}>
              <input type="checkbox" checked={selected.includes(c)} onChange={() => toggle(c)} />
              <span style={{ fontSize: 14 }}>{c}</span>
            </label>
          ))}
        </div>
        {selected.length > 0 && (
          <div style={{ fontSize: 12, color: '#ccc' }}>
            Showing: {selected.join(', ')}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {visible.map((p) => (
          <a key={p.slug} href={`/project/${p.slug}`} style={{ display: 'block', borderRadius: 8, overflow: 'hidden', background: '#111' }}>
            <div style={{ height: 180, background: '#222' }}>
              <img src={p.preview} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: 12 }}>
              <strong>{p.title}</strong>
              <p style={{ color: '#ccc', fontSize: 14 }}>{p.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
