'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  FileText,
  Gauge,
  Handshake,
  Image as ImageIcon,
  LogOut,
  Menu,
  MessageSquareText,
  Monitor,
  SearchCheck,
  Settings,
  Tags,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

const navigation = [
  { label: '运营总览', href: '/admin', icon: Gauge },
  { label: '客户询盘', href: '/admin/leads', icon: MessageSquareText },
  { label: '档期日历', href: '/admin/availability', icon: CalendarDays },
  { label: '屏幕资源', href: '/admin/screens', icon: Monitor },
  { label: '价格档位', href: '/admin/pricing', icon: Tags },
  { label: '案例内容', href: '/admin/cases', icon: ImageIcon },
  { label: '文章知识', href: '/admin/articles', icon: FileText },
  { label: '合作伙伴', href: '/admin/partners', icon: Handshake },
  { label: 'SEO 设置', href: '/admin/seo', icon: SearchCheck },
  { label: '基础设置', href: '/admin/settings', icon: Settings },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname === '/admin/login') return <>{children}</>

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0b0e12] text-white">
      <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-6">
        <span className="grid h-9 w-9 grid-cols-2 gap-1 border border-signal p-1">
          <i className="row-span-2 bg-signal" />
          <i className="bg-white" />
          <i className="border border-signal" />
        </span>
        <div>
          <strong className="block text-sm">名扬天下传媒</strong>
          <small className="mono block text-[7px] tracking-[0.15em] text-white/35">CONTENT OS</small>
        </div>
      </div>
      <nav className="grid flex-1 content-start gap-1 overflow-y-auto p-4">
        {navigation.map(({ label, href, icon: Icon }) => {
          const active = href === '/admin' ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex min-h-11 items-center gap-3 px-3 text-sm transition-colors',
                active ? 'bg-signal text-white' : 'text-white/50 hover:bg-white/[0.07] hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link href="/" target="_blank" className="mb-3 block px-3 text-xs text-white/40 hover:text-white">
          查看线上网站
        </Link>
        <form action="/api/admin/logout" method="post">
          <button className="flex min-h-10 w-full items-center gap-3 px-3 text-sm text-white/50 hover:bg-white/[0.07] hover:text-white">
            <LogOut className="h-4 w-4" />
            退出后台
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f3f4f5] text-[#16191d]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[228px] lg:block">{sidebar}</aside>
      <div className="lg:pl-[228px]">
        <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-black/10 bg-white/95 px-5 backdrop-blur-xl lg:px-8">
          <div>
            <span className="mono text-[9px] font-bold tracking-[0.13em] text-signal">
              XNMytx / OPERATIONS
            </span>
            <p className="mt-1 text-sm font-black">内容与客户管理</p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center border border-black/10 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="打开后台导航"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="关闭后台导航"
          />
          <aside className="absolute inset-y-0 left-0 w-[270px]">{sidebar}</aside>
          <button
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center bg-white text-black"
            onClick={() => setOpen(false)}
            aria-label="关闭后台导航"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
