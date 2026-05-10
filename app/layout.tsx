import './globals.css'
import Link from 'next/link'
import type { ReactNode } from 'react'
import data from '../data/projects.json'

export const metadata = {
  title: 'Anshul - Portfolio',
  description: '',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top-nav" aria-label="Main Navigation">
          <nav className="topnav-inner">
            <Link href="/" className="nav-link">HOME</Link>
            <Link href="/work" className="nav-link">WORK</Link>
            <Link href="/services" className="nav-link">SERVICES</Link>
            <Link href="/about" className="nav-link">ABOUT ME</Link>
            <Link href="/contact" className="nav-link">CONTACT ME</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
