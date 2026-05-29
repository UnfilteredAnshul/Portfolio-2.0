import { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://buildiwithanshul.vercel.app'

const staticPages = [
  { url: '', lastModified: new Date(), changeFreq: 'monthly' as const, priority: 1 },
  { url: '/work', lastModified: new Date(), changeFreq: 'weekly' as const, priority: 0.9 },
  { url: '/services', lastModified: new Date(), changeFreq: 'monthly' as const, priority: 0.8 },
  { url: '/about', lastModified: new Date(), changeFreq: 'monthly' as const, priority: 0.7 },
  { url: '/contact', lastModified: new Date(), changeFreq: 'monthly' as const, priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages.map((p) => ({
    url: `${BASE}${p.url}`,
    lastModified: p.lastModified,
    changeFrequency: p.changeFreq,
    priority: p.priority,
  })) as MetadataRoute.Sitemap
}
