import ContactClient from './ContactClient'
import { siteConfig, jsonLdBreadcrumb, jsonLdContactPage } from '../../lib/seo'

export const metadata = {
  title: 'Contact Me',
  description:
    'Get in touch with Anshul Rajpal for web development, AI automation, content creation, video editing, and trading services.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Me | Anshul Rajpal',
    description:
      'Get in touch with Anshul Rajpal for web development, AI automation, content creation, video editing, and trading services.',
    url: `${siteConfig.url}/contact`,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
}

const breadcrumb = jsonLdBreadcrumb([
  { name: 'Home', url: '/' },
  { name: 'Contact', url: '/contact' },
])

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdContactPage) }} />
      <ContactClient />
    </>
  )
}
