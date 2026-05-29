import ServicesClient from './ServicesClient'
import { siteConfig, jsonLdBreadcrumb, jsonLdWebPage, jsonLdService, jsonLdFAQ } from '../../lib/seo'

export const metadata = {
  title: 'Services',
  description:
    'Full-stack web development, AI & automation, content creation, video editing, and trading strategy services by Anshul Rajpal.',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Services | Anshul Rajpal',
    description:
      'Full-stack web development, AI & automation, content creation, video editing, and trading strategy services.',
    url: `${siteConfig.url}/services`,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
}

const breadcrumb = jsonLdBreadcrumb([
  { name: 'Home', url: '/' },
  { name: 'Services', url: '/services' },
])

const webPage = jsonLdWebPage('Services', 'Full-stack web development, AI & automation, content creation, video editing, and trading strategy services.', '/services', 'Services')

const services = siteConfig.services.map(jsonLdService)

const faq = jsonLdFAQ([
  {
    question: 'What web development services do you offer?',
    answer: 'Full-stack web development using modern frameworks like Next.js, React, and Node.js, building responsive, performant applications with clean code architecture.',
  },
  {
    question: 'What AI and automation solutions can you provide?',
    answer: 'AI-powered automation solutions including chatbots, workflow optimization, and intelligent tooling using cutting-edge AI tools to streamline operations.',
  },
  {
    question: 'What content creation services are available?',
    answer: 'Content creation for streaming, social media, and YouTube including stream overlays, thumbnails, and complete content strategies.',
  },
  {
    question: 'What video editing services do you offer?',
    answer: 'Professional video editing using Premiere Pro, After Effects, and Da Vinci Resolve. Color grading, motion graphics, and post-production services.',
  },
  {
    question: 'How can I get started with a project?',
    answer: 'Contact me through the contact form or email directly at contact.unfiltered.anshul@gmail.com to discuss your project requirements.',
  },
])

export default function ServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      {services.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <ServicesClient />
    </>
  )
}
