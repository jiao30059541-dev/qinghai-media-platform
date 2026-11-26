'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileCTA from '@/components/MobileCTA'
import type { SiteConfig } from '@/lib/site'

export default function SiteChrome({
  children,
  config,
}: {
  children: React.ReactNode
  config: SiteConfig
}) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return <>{children}</>

  return (
    <>
      <Header config={config} />
      <main>{children}</main>
      <Footer config={config} />
      <MobileCTA config={config} />
    </>
  )
}
