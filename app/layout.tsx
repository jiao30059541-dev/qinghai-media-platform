import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'
import FloatingContact from '@/components/FloatingContact'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: '青海全媒体广告智能投放平台 — AI驱动的户外广告资源交易平台',
    template: '%s | 青海全媒体广告平台',
  },
  description: 'AI驱动的智能广告投放平台，覆盖青海全域户外广告资源。提供西宁LED大屏、海东户外大牌、全省电梯广告等资源在线查询、比价、组合投放。像找房子一样找广告位。',
  manifest: '/manifest.json',
  keywords: [
    '青海广告', '西宁广告', '户外广告', 'LED大屏广告', '青海全媒体',
    '广告投放平台', '青海传媒', '西宁户外广告', '青海品牌推广',
    '青海广告位', '西宁LED屏', '电梯广告', '广告资源交易'
  ],
  authors: [{ name: '西宁名扬天下文化传媒有限公司' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '青海全媒体广告平台',
    title: '青海全媒体广告智能投放平台',
    description: 'AI驱动的智能广告投放平台，覆盖青海全域户外广告资源。在线查询、比价、组合投放广告位。',
    url: 'https://www.qhqmt.cn',
    images: [
      {
        url: 'https://www.qhqmt.cn/icons/icon-512x512.svg',
        width: 512,
        height: 512,
        alt: '青海全媒体广告平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '青海全媒体广告智能投放平台',
    description: 'AI驱动的智能广告投放平台，覆盖青海全域户外广告资源',
    images: ['https://www.qhqmt.cn/icons/icon-512x512.svg'],
  },
  alternates: {
    canonical: 'https://www.qhqmt.cn',
  },
  verification: {
    // 后续可添加百度/Google站长验证
  },
  category: 'business',
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://www.qhqmt.cn/#organization',
        name: '西宁名扬天下文化传媒有限公司',
        url: 'https://www.qhqmt.cn',
        logo: 'https://www.qhqmt.cn/icons/icon-192x192.svg',
        description: '青海全媒体广告智能投放平台，AI驱动的广告资源交易平台',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+86-13997187771',
          contactType: 'customer service',
          availableLanguage: ['Chinese'],
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: '西宁',
          addressRegion: '青海',
          addressCountry: 'CN',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://www.qhqmt.cn/#website',
        url: 'https://www.qhqmt.cn',
        name: '青海全媒体广告智能投放平台',
        description: 'AI驱动的智能广告投放平台，覆盖青海全域户外广告资源',
        publisher: {
          '@id': 'https://www.qhqmt.cn/#organization',
        },
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.qhqmt.cn/#webpage',
        url: 'https://www.qhqmt.cn',
        name: '青海全媒体广告智能投放平台',
        description: '一站式查询、组合、策划全省广告资源，AI智能推荐青海户外广告位',
        isPartOf: {
          '@id': 'https://www.qhqmt.cn/#website',
        },
        about: {
          '@id': 'https://www.qhqmt.cn/#organization',
        },
      },
    ],
  }

  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-32x32.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <meta name="application-name" content="青海广告" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <Header />
        <main className="min-h-screen pt-20">
          {children}
        </main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  )
}
