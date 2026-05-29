import HomeClient from './HomeClient'
import { siteConfig, jsonLdWebPage, jsonLdService, jsonLdFAQ } from '../lib/seo'

export const metadata = {
  title: "Anshul's Portfolio",
  description: siteConfig.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: "Anshul's Portfolio",
    description: siteConfig.description,
    url: siteConfig.url,
  },
}

const webPage = jsonLdWebPage("Anshul's Portfolio", siteConfig.description, '/', 'Portfolio')

const services = siteConfig.services.map(jsonLdService)

const faq = jsonLdFAQ([
  {
    question: 'What services does Anshul Rajpal offer?',
    answer:
      'Web Development, AI & Automation, Content Creation, Video Editing, and Trading Strategy services for businesses and creators worldwide.',
  },
  {
    question: 'What technologies does Anshul specialize in?',
    answer:
      'JavaScript, TypeScript, React, Next.js, Node.js, Python, AI Tools, and professional video editing tools including After Effects, Premiere Pro, and Da Vinci Resolve.',
  },
  {
    question: 'How can I hire Anshul Rajpal for my project?',
    answer:
      'Visit the Contact page to send a message or email directly at contact.unfiltered.anshul@gmail.com.',
  },
  {
    question: 'Does Anshul work with international clients?',
    answer:
      'Yes, Anshul has extensive experience working with international clients across multiple industries.',
  },
  {
    question: 'What is Anshul\'s experience level?',
    answer:
      'Anshul has over 7 years of freelance experience since 2019, working across web development, content creation, video editing, and trading.',
  },
])

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      {services.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <HomeClient />
    </>
  )
}
