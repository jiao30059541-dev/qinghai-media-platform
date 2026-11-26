import Link from 'next/link'
import { ArrowUpRight, Phone } from 'lucide-react'
import { navItems, type SiteConfig } from '@/lib/site'

export default function Footer({ config }: { config: SiteConfig }) {
  return (
    <footer className="bg-[#090c0f] text-white">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.2fr_.45fr_.65fr_.55fr] lg:py-20">
        <div>
          <span className="eyebrow">CONTACT / XINING</span>
          <h2 className="mt-6 text-[clamp(34px,4vw,58px)] font-black leading-[1.08]">
            把下一帧，
            <br />
            留给你的品牌。
          </h2>
          <a
            href={`tel:${config.phone}`}
            className="mono mt-8 inline-flex items-center gap-3 text-[22px] font-black text-white hover:text-signal"
          >
            {config.phoneDisplay}
            <ArrowUpRight className="h-5 w-5 text-signal" />
          </a>
        </div>

        <div>
          <strong className="text-sm">快速导航</strong>
          <div className="mt-5 grid gap-3 text-sm text-white/55">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <strong className="text-sm">屏幕点位</strong>
          <div className="mt-5 grid gap-5 text-sm leading-7 text-white/55">
            <p>
              <b className="block text-white">国贸大厦 LED 屏</b>
              西宁海晏路口国贸大厦
            </p>
            <p>
              <b className="block text-white">恒润大厦 LED 屏</b>
              湟光十字东北角恒润大厦
            </p>
          </div>
        </div>

        <div>
          <strong className="text-sm">运营主体</strong>
          <p className="mt-5 text-sm leading-7 text-white/55">{config.name}</p>
          <a
            href={`tel:${config.phone}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white"
          >
            <Phone className="h-4 w-4 text-signal" />
            电话咨询
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {config.name}</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-white">
              隐私政策
            </Link>
            <Link href="/terms" className="hover:text-white">
              用户协议
            </Link>
            <span>{config.icp}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
