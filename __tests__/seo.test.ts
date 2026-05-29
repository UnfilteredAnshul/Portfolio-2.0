import { describe, it, expect } from 'vitest'
import {
  siteConfig,
  jsonLdPerson,
  jsonLdOrganization,
  jsonLdWebsite,
  jsonLdBreadcrumb,
  jsonLdWebPage,
  jsonLdAboutPage,
  jsonLdContactPage,
  jsonLdCollectionPage,
  jsonLdService,
  jsonLdFAQ,
} from '../lib/seo'

describe('siteConfig', () => {
  it('has required fields', () => {
    expect(siteConfig.name).toBe('Anshul Rajpal')
    expect(siteConfig.url).toBe(process.env.NEXT_PUBLIC_SITE_URL || 'https://buildiwithanshul.vercel.app')
    expect(siteConfig.locale).toBe('en_US')
    expect(siteConfig.twitterHandle).toBe('@anshulrajpal')
    expect(siteConfig.email).toBeTruthy()
    expect(siteConfig.telephone).toBeTruthy()
    expect(siteConfig.skills.length).toBeGreaterThan(0)
    expect(siteConfig.services.length).toBe(6)
  })
})

describe('jsonLd schemas', () => {
  it('Person has correct type and fields', () => {
    expect(jsonLdPerson['@type']).toBe('Person')
    expect(jsonLdPerson.name).toBe('Anshul Rajpal')
    expect(jsonLdPerson.sameAs).toBeInstanceOf(Array)
    expect(jsonLdPerson.sameAs!.length).toBeGreaterThan(0)
    expect(jsonLdPerson.nationality).toEqual({ '@type': 'Country', name: 'India' })
  })

  it('Organization has correct type', () => {
    expect(jsonLdOrganization['@type']).toBe('Organization')
    expect(jsonLdOrganization.logo).toContain('favicon.svg')
  })

  it('Website has correct type and author', () => {
    expect(jsonLdWebsite['@type']).toBe('WebSite')
    expect(jsonLdWebsite.author).toEqual({ '@type': 'Person', name: 'Anshul Rajpal' })
    expect(jsonLdWebsite.publisher).toEqual({ '@type': 'Organization', name: 'Anshul Rajpal' })
  })

  it('Breadcrumb generates correct items', () => {
    const items = [{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]
    const bc = jsonLdBreadcrumb(items)
    expect(bc['@type']).toBe('BreadcrumbList')
    expect(bc.itemListElement).toHaveLength(2)
    expect(bc.itemListElement[0].position).toBe(1)
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://buildiwithanshul.vercel.app'
    expect(bc.itemListElement[0].item).toBe(`${base}/`)
    expect(bc.itemListElement[1].item).toBe(`${base}/about`)
  })

  it('WebPage has correct structure', () => {
    const wp = jsonLdWebPage('Test Page', 'Test description', '/test', 'Testing')
    expect(wp['@type']).toBe('WebPage')
    expect(wp.name).toBe('Test Page')
    expect(wp.url).toBe(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://buildiwithanshul.vercel.app'}/test`)
    expect(wp.about).toEqual({ '@type': 'Thing', name: 'Testing' })
  })

  it('AboutPage wraps Person as mainEntity', () => {
    expect(jsonLdAboutPage['@type']).toBe('AboutPage')
    expect(jsonLdAboutPage.mainEntity['@type']).toBe('Person')
  })

  it('ContactPage has contact info', () => {
    expect(jsonLdContactPage['@type']).toBe('ContactPage')
    expect(jsonLdContactPage.mainEntity.email).toBe(siteConfig.email)
    expect(jsonLdContactPage.mainEntity.telephone).toBe(siteConfig.telephone)
  })

  it('CollectionPage has correct count', () => {
    const cp = jsonLdCollectionPage('Work', 'Description', '/work', 12)
    expect(cp['@type']).toBe('CollectionPage')
    expect(cp.numberOfItems).toBe(12)
  })

  it('Service has provider and audience', () => {
    const s = jsonLdService(siteConfig.services[0])
    expect(s['@type']).toBe('Service')
    expect(s.provider).toEqual({ '@type': 'Person', name: 'Anshul Rajpal' })
    expect(s.areaServed).toBe('Worldwide')
    expect(s.audience).toBeDefined()
  })

  it('FAQ generates Q&A pairs', () => {
    const qs = [{ question: 'Q1', answer: 'A1' }]
    const faq = jsonLdFAQ(qs)
    expect(faq['@type']).toBe('FAQPage')
    expect(faq.mainEntity[0].name).toBe('Q1')
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe('A1')
  })

})
