import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ScreenView } from '@/lib/content'

export default function ScreenCard({
  screen,
  priority = false,
}: {
  screen: ScreenView
  priority?: boolean
}) {
  return (
    <article className="screen-card group">
      <Link href={`/screens/${screen.slug}`} className="grid h-full lg:grid-cols-[1.15fr_.85fr]">
        <div className="relative min-h-[260px] overflow-hidden bg-black lg:min-h-[390px]">
          <Image
            src={screen.heroImage}
            alt={`${screen.name}点位实景`}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <span className="absolute left-5 top-5 bg-signal px-3 py-2 text-xs font-black text-white">
            {screen.role}
          </span>
          <span className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center bg-white text-ink transition-colors group-hover:bg-signal group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
        <div className="flex flex-col p-6 lg:p-8">
          <span className="mono text-[10px] font-bold tracking-[0.12em] text-signal">
            {screen.slug === 'guomao' ? 'GUOMAO / CITY COVER' : 'HENGRUN / STREET NODE'}
          </span>
          <h3 className="mt-3 text-2xl font-black">{screen.name}</h3>
          <p className="mt-4 text-sm leading-7 text-black/55">{screen.description}</p>
          <dl className="mt-auto pt-6">
            <div className="spec-row">
              <dt>位置</dt>
              <dd>{screen.location}</dd>
            </div>
            <div className="spec-row">
              <dt>面积</dt>
              <dd>{screen.area}</dd>
            </div>
            <div className="spec-row">
              <dt>尺寸</dt>
              <dd>{screen.displaySize}</dd>
            </div>
            <div className="spec-row">
              <dt>分辨率</dt>
              <dd>{screen.resolution}</dd>
            </div>
          </dl>
        </div>
      </Link>
    </article>
  )
}
