import './globals.css'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Footer from '../components/Footer'
import { siteConfig, jsonLdPerson, jsonLdOrganization, jsonLdWebsite } from '../lib/seo'
import { ProjectsProvider } from '../lib/projects-context'

export const metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
    phoneNumbers: siteConfig.telephone,
    emails: siteConfig.email,
    countryName: 'India',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  other: {
    'theme-color': '#000000',
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.removeAttribute('webcrx')` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body>
        <style>{`
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
        `}</style>
        <ProjectsProvider>
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
          <Footer />
        </ProjectsProvider>
        <Analytics />
      </body>
    </html>
  )
}
