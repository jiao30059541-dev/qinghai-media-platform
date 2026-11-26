import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '名扬天下传媒｜西宁户外LED大屏',
    short_name: '名扬天下',
    description: '国贸大厦LED屏与恒润大厦LED屏广告投放',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f4ef',
    theme_color: '#e5362c',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
