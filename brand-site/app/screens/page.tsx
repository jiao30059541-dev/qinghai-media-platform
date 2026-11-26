import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Reveal from '@/components/Reveal'
import ScreenCard from '@/components/ScreenCard'
import { getScreens } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  return pageMetadata({
    path: '/screens',
    title: '西宁户外LED大屏资源｜国贸大厦屏与恒润大厦屏',
    description:
      '查看国贸大厦LED屏与恒润大厦LED屏的位置、屏体规格、适用场景和销售方式。两块屏分别报价，也可按项目组合。',
  })
}

export default async function ScreensPage() {
  const screens = await getScreens()

  return (
    <>
      <section className="bg-[#101419] py-16 text-white lg:py-24">
        <div className="container-site">
          <span className="eyebrow">MEDIA RESOURCES / XINING</span>
          <h1 className="display-title mt-7 max-w-[1100px]">
            两块核心大屏，
            <br />
            <span className="text-signal">覆盖两种城市距离。</span>
          </h1>
          <div className="mt-9 grid gap-8 border-t border-white/15 pt-8 lg:grid-cols-[1fr_.7fr]">
            <p className="max-w-[680px] text-[16px] leading-8 text-white/60">
              国贸大厦 LED 屏负责城市级主画面，恒润大厦 LED 屏补充核心路口触达。先明确传播任务，再决定单屏投放或双屏联动。
            </p>
            <div className="mono flex flex-wrap items-center gap-5 text-[10px] font-bold text-white/40 lg:justify-end">
              <span>独立销售</span>
              <i className="h-1 w-1 bg-signal" />
              <span>分别报价</span>
              <i className="h-1 w-1 bg-signal" />
              <span>可项目联动</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-8">
          {screens.map((screen, index) => (
            <Reveal key={screen.slug} delay={index * 80}>
              <ScreenCard screen={screen} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-14">
        <div className="container-site flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div>
            <span className="eyebrow">SELECTION ADVICE</span>
            <h2 className="mt-3 text-3xl font-black">不确定选哪一块？</h2>
            <p className="mt-3 text-sm leading-7 text-black/50">
              告诉我们品牌目标、计划时间和预算范围，我们会给出单屏或组合建议。
            </p>
          </div>
          <Link href="/quote" className="btn-primary shrink-0">
            获取选屏建议
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
