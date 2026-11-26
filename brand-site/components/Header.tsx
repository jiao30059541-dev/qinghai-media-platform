'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clsx } from 'clsx'
import { navItems, type SiteConfig } from '@/lib/site'

export default function Header({ config }: { config: SiteConfig }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-xl">
      <div className="container-site flex h-[74px] items-center justify-between gap-5">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="名扬天下传媒首页">
          <span className="grid h-9 w-9 grid-cols-2 gap-[3px] border border-signal p-[3px]">
            <i className="row-span-2 bg-signal" />
            <i className="bg-ink" />
            <i className="border border-signal" />
          </span>
          <span className="flex flex-col">
            <strong className="text-[18px] font-black leading-none tracking-[0.04em]">名扬天下</strong>
            <small className="mono mt-1 text-[7px] font-bold tracking-[0.13em] text-black/45">
              XINING OUTDOOR LED
            </small>
          </span>
        </Link>

        <nav className="hidden items-center gap-4 xl:flex" aria-label="主导航">
          {navItems.map((item) => {
            const active =
              item.href === '/screens'
                ? pathname.startsWith('/screens')
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'relative py-7 text-[13px] font-semibold text-black/60 transition-colors hover:text-ink',
                  active && 'text-ink'
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-0 bottom-[17px] h-0.5 bg-signal" />}
              </Link>
            )
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 md:flex">
          <a
            href={`tel:${config.phone}`}
            className="mono flex items-center gap-2 text-[13px] font-black tracking-[0.02em]"
          >
            <Phone className="h-4 w-4 text-signal" />
            {config.phoneDisplay}
          </a>
          <Link href="/quote" className="btn-primary min-h-[40px] px-5 text-[13px]">
            档期询价
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center border border-black/15 xl:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? '关闭导航' : '打开导航'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-black/10 bg-white xl:hidden">
          <nav className="container-site grid py-4" aria-label="手机导航">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-black/[0.07] py-3.5 text-[15px] font-bold last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <a href={`tel:${config.phone}`} className="btn-primary mt-3">
              <Phone className="h-4 w-4" />
              {config.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
