import AboutClient from './AboutClient'
import { siteConfig, jsonLdBreadcrumb, jsonLdAboutPage } from '../../lib/seo'

export const metadata = {
  title: 'About Me',
  description:
    'Full Stack Developer, AI & Automation specialist, Content Creator, Video Editor, and Trader with 7+ years of freelance experience working with international clients.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Me | Anshul Rajpal',
    description:
      'Full Stack Developer, AI & Automation specialist, Content Creator, Video Editor, and Trader with 7+ years of freelance experience.',
    url: `${siteConfig.url}/about`,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
}

const breadcrumb = jsonLdBreadcrumb([
  { name: 'Home', url: '/' },
  { name: 'About', url: '/about' },
])

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdAboutPage) }} />
      <AboutClient />
    </>
  )
}
