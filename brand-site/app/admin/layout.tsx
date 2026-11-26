import type { Metadata } from 'next'
import AdminShell from './_components/AdminShell'

export const metadata: Metadata = {
  title: {
    default: '内容后台',
    template: '%s | 名扬天下后台',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
