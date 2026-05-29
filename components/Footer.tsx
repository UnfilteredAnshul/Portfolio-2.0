"use client";
import { useState } from 'react'
import { usePathname } from 'next/navigation'

const links = [
  { label: 'Instagram', href: 'https://www.instagram.com/shutup.krish/', hovered: false },
  { label: 'YouTube', href: 'https://yt.openinapp.co/sexylink', hovered: false },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/unfiltred-anshul-rajpal/', hovered: false },
]

export default function Footer() {
  const [hovered, setHovered] = useState<string | null>(null)
  const pathname = usePathname()

  const isWork = pathname === '/work'
  const isTransparent = pathname === '/' || pathname === '/services' || pathname === '/about' || pathname === '/contact'

  const footerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    pointerEvents: 'none',
  }

  if (isWork) {
    footerStyle.background = 'rgba(0, 0, 0, 0.85)'
    footerStyle.backdropFilter = 'blur(12px)'
    footerStyle.borderTop = '1px solid rgba(255, 255, 255, 0.06)'
    footerStyle.padding = '1rem 2rem'
  } else if (isTransparent) {
    footerStyle.background = 'transparent'
    footerStyle.borderTop = 'none'
    footerStyle.padding = '2.5rem 2rem'
  }

  return (
    <footer style={footerStyle}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', pointerEvents: 'auto' }}>
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              onMouseEnter={() => setHovered(link.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                color: hovered === link.label ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <span
          style={{
            color: 'rgba(255, 255, 255, 0.25)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
          }}
        >
          &copy; {new Date().getFullYear()} Anshul Rajpal
        </span>
      </div>
    </footer>
  )
}
