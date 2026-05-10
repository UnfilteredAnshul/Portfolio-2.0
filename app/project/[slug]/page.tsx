import React from 'react'
import data from '../../../data/projects.json'
import Image from 'next/image'
import Link from 'next/link'

type Project = typeof data[number]

export async function generateStaticParams() {
  return (data as Project[]).map((p) => ({ slug: p.slug }))
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = (data as Project[]).find((p) => p.slug === params.slug)
  if (!project) return <div>Project not found</div>
  return (
    <section style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem' }}>{project.title}</h1>
      <p style={{ color: '#ccc' }}>{project.description}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
            {project.screenshots.map((src, idx) => (
              <img key={idx} src={src} alt={`screenshot-${idx}`} style={{ width: 480, height: 320, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        </div>
        {project.video && (
          <video controls src={project.video} style={{ width: '100%', maxWidth: 720 }} />
        )}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Link href="/admin/projects" style={{ color: '#fff', textDecoration: 'underline' }}>Back to admin</Link>
      </div>
    </section>
  )
}
