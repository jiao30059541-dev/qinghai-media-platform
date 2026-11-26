import type { MetadataRoute } from 'next'
import { getArticles, getCases, getScreens } from '@/lib/content'
import { site } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [screens, cases, articles] = await Promise.all([getScreens(), getCases(), getArticles()])
  const staticPaths = [
    '/',
    '/screens',
    '/cases',
    '/insights',
    '/availability',
    '/about',
    '/quote',
    '/contact',
    '/privacy',
    '/terms',
  ]

  return [
    ...staticPaths.map((path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : path === '/screens' ? 0.9 : 0.7,
    })),
    ...screens.map((screen) => ({
      url: `${site.url}/screens/${screen.slug}`,
      lastModified: screen.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: screen.slug === 'guomao' ? 0.95 : 0.85,
    })),
    ...cases.map((item) => ({
      url: `${site.url}/cases/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${site.url}/insights/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
  ]
}
