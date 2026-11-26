import type { Metadata } from 'next'
import { absoluteUrl, site, type SiteConfig } from '@/lib/site'
import { getSeoPage } from '@/lib/content'

export async function pageMetadata({
  path,
  title,
  description,
  image = '/images/guomao-night-hero.jpg',
  type = 'website',
  noindex = false,
}: {
  path: string
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}): Promise<Metadata> {
  const stored = await getSeoPage(path)
  const finalTitle = stored?.title || title
  const finalDescription = stored?.description || description
  const finalImage = stored?.ogImage || image

  return {
    title: finalTitle,
    description: finalDescription,
    keywords: stored?.keywords?.split(',').map((item) => item.trim()),
    alternates: { canonical: absoluteUrl(path) },
    robots: stored?.noindex || noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      locale: 'zh_CN',
      siteName: site.siteName,
      title: finalTitle,
      description: finalDescription,
      url: absoluteUrl(path),
      images: [{ url: absoluteUrl(finalImage), alt: finalTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [absoluteUrl(finalImage)],
    },
  }
}

export function organizationJsonLd(config: SiteConfig = site) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'LocalBusiness'],
        '@id': `${config.url}/#organization`,
        name: config.name,
        alternateName: config.shortName,
        url: config.url,
        image: absoluteUrl('/images/guomao-night-hero.jpg'),
        logo: absoluteUrl('/icon.svg'),
        telephone: `+86-${config.phone}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: config.address,
          addressLocality: '西宁市',
          addressRegion: '青海省',
          addressCountry: 'CN',
        },
        areaServed: {
          '@type': 'City',
          name: '西宁市',
        },
        description: config.defaultDescription,
      },
      {
        '@type': 'WebSite',
        '@id': `${config.url}/#website`,
        url: config.url,
        name: config.siteName,
        publisher: { '@id': `${config.url}/#organization` },
        inLanguage: 'zh-CN',
      },
    ],
  }
}
