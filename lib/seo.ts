export const siteConfig = {
  name: 'Anshul Rajpal',
  title: 'Anshul Rajpal - Full Stack Developer, AI & Automation, Content Creator',
  description:
    'Full Stack Developer, AI & Automation specialist, Content Creator, Video Editor, and Trader. I build modern web applications, automate workflows, and create engaging content.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://buildiwithanshul.vercel.app',
  locale: 'en_US',
  twitterHandle: '@anshulrajpal',
  ogImage: '/og-image.svg',
  email: 'contact.unfiltered.anshul@gmail.com',
  telephone: '+919322309947',
  address: {
    street: 'Flat no. 002, A-24, May Flower, Shristi Hills CHS, Jhambul – MIDC road',
    locality: 'Ambernath – W',
    region: 'Maharashtra',
    postalCode: '421505',
    country: 'India',
  },
  skills: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Python',
    'AI Tools',
    'Video Editing',
    'After Effects',
    'Premiere Pro',
    'Da Vinci Resolve',
    'Content Creation',
    'Trading',
  ],
  services: [
    {
      name: 'Full Stack Dev',
      description: 'Full-stack web development with Next.js, React, Node.js and modern frameworks.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    },
    {
      name: 'AI & Automation',
      description: 'AI-powered automation solutions including chatbots, workflow optimization, and intelligent tooling.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    },
    {
      name: 'Content Creation',
      description: 'Stream overlays, thumbnails, social media content, and complete content strategies.',
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3037c9bb?w=800',
    },
    {
      name: 'Thumbnail Creation',
      description: 'Eye-catching YouTube and social media thumbnails designed to maximize click-through rates.',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
    },
    {
      name: 'Video Editing',
      description: 'Professional video editing with Premiere Pro, After Effects, Da Vinci Resolve. Color grading and motion graphics.',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800',
    },
    {
      name: 'Trading Strategy',
      description: 'Technical analysis, backtesting, and trading strategy development for financial markets.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    },
  ],
}

export const jsonLdPerson = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Anshul Rajpal',
  givenName: 'Anshul',
  familyName: 'Rajpal',
  url: siteConfig.url,
  image: siteConfig.ogImage,
  email: siteConfig.email,
  telephone: siteConfig.telephone,
  jobTitle: 'Full Stack Developer & Content Creator',
  knowsAbout: siteConfig.skills,
  description: siteConfig.description,
  nationality: { '@type': 'Country', name: 'India' },
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  sameAs: [
    'https://github.com/anshulrajpal',
    'https://linkedin.com/in/anshulrajpal',
    'https://twitter.com/anshulrajpal',
    'https://youtube.com/@anshulrajpal',
  ],
}

export const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/favicon.svg`,
  description: siteConfig.description,
  email: siteConfig.email,
  telephone: siteConfig.telephone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.locality,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  sameAs: jsonLdPerson.sameAs,
}

export const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  author: { '@type': 'Person', name: siteConfig.name },
  publisher: { '@type': 'Organization', name: siteConfig.name },
}

export const jsonLdBreadcrumb = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: `${siteConfig.url}${item.url}`,
  })),
})

export const jsonLdWebPage = (
  title: string,
  description: string,
  url: string,
  about?: string,
) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: `${siteConfig.url}${url}`,
  author: { '@type': 'Person', name: siteConfig.name },
  publisher: { '@type': 'Organization', name: siteConfig.name },
  ...(about ? { about: { '@type': 'Thing', name: about } } : {}),
})

export const jsonLdAboutPage = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Anshul Rajpal',
  description: siteConfig.description,
  url: `${siteConfig.url}/about`,
  mainEntity: jsonLdPerson,
}

export const jsonLdContactPage = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Anshul Rajpal',
  description: 'Get in touch for web development, AI automation, content creation, and more.',
  url: `${siteConfig.url}/contact`,
  mainEntity: {
    '@type': 'Person',
    name: siteConfig.name,
    email: siteConfig.email,
    telephone: siteConfig.telephone,
    url: siteConfig.url,
  },
}

export const jsonLdCollectionPage = (
  title: string,
  description: string,
  url: string,
  itemCount: number,
) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: title,
  description,
  url: `${siteConfig.url}${url}`,
  numberOfItems: itemCount,
  author: { '@type': 'Person', name: siteConfig.name },
})

export const jsonLdService = (service: { name: string; description: string; image: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  image: service.image,
  provider: { '@type': 'Person', name: siteConfig.name },
  areaServed: 'Worldwide',
  audience: { '@type': 'Audience', audienceType: 'Businesses and Creators' },
})

export const jsonLdFAQ = (questions: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: { '@type': 'Answer', text: q.answer },
  })),
})


