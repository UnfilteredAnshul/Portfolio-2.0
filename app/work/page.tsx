import { Suspense } from 'react'
import WorkClient from './WorkClient'
import { siteConfig, jsonLdBreadcrumb, jsonLdCollectionPage } from '../../lib/seo'
import data from '../../data/projects.json'

export const metadata = {
  title: 'Work',
  description:
    'Browse my portfolio of projects in web development, AI & automation, content creation, video editing, and trading.',
  alternates: { canonical: '/work' },
  openGraph: {
    title: 'Work | Anshul Rajpal',
    description:
      'Browse my portfolio of projects in web development, AI & automation, content creation, video editing, and trading.',
    url: `${siteConfig.url}/work`,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
}

const breadcrumb = jsonLdBreadcrumb([
  { name: 'Home', url: '/' },
  { name: 'Work', url: '/work' },
])

const collectionPage = jsonLdCollectionPage(
  'Work',
  'Browse my portfolio of projects in web development, AI & automation, content creation, video editing, and trading.',
  '/work',
  data.length,
)

export default function WorkPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPage) }} />
      <Suspense fallback={null}>
        <WorkClient />
      </Suspense>
    </>
  )
}
