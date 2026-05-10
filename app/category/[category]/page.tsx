import React from 'react'
import data from '../../../data/projects.json'

export const dynamic = 'force-dynamic'

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = params.category
  const projects = Array.isArray(data) ? data.filter((p: any) => {
    const cat = p?.category
    return typeof cat === 'string' && cat.toLowerCase() === category.toLowerCase()
  }) : []
  return (
    <section style={{ padding: '2rem' }}>
      <h1>Category: {category}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {projects.map((p: any) => (
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
