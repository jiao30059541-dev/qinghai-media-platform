import type { Metadata, Viewport } from 'next'
import './globals.css'
import Analytics from '@/components/Analytics'
import SiteChrome from '@/components/SiteChrome'
import { organizationJsonLd } from '@/lib/seo'
import { getSetting } from '@/lib/settings'
import { getSiteConfig, site } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.defaultTitle,
  description: site.defaultDescription,
  applicationName: site.siteName,
  authors: [{ name: site.name }],
  creator: site.name,
  publisher: site.name,
  category: '户外广告与城市媒体',
  formatDetection: { telephone: true, address: false, email: false },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: site.siteName,
    title: site.defaultTitle,
    description: site.defaultDescription,
    images: [{ url: '/images/guomao-night-hero.jpg', width: 1450, height: 960, alt: site.siteName }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f6f4ef',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [storedAnalyticsId, config] = await Promise.all([
    getSetting('baidu_analytics_id'),
    getSiteConfig(),
  ])
  const baiduId = storedAnalyticsId || process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID

  return (
    <html lang="zh-CN">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(config)) }}
        />
        <SiteChrome config={config}>{children}</SiteChrome>
        <Analytics baiduId={baiduId} />
      </body>
    </html>
  )
}
