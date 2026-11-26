import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { pageMetadata } from '@/lib/seo'
import { site } from '@/lib/site'

export async function generateMetadata() {
  return pageMetadata({
    path: '/about',
    title: '关于名扬天下｜西宁名扬天下文化传媒有限公司',
    description:
      '西宁名扬天下文化传媒有限公司围绕国贸大厦LED屏与恒润大厦LED屏，提供点位咨询、内容制作、投放策划与上屏执行服务。',
  })
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#101419] py-16 text-white lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
          <div>
            <span className="eyebrow">ABOUT / XINING MEDIA</span>
            <h1 className="display-title mt-7">
              以我为媒，
              <br />
              <span className="text-signal">助您名扬天下。</span>
            </h1>
          </div>
          <p className="max-w-[560px] text-[16px] leading-8 text-white/55">
            西宁名扬天下文化传媒有限公司围绕城市户外 LED 媒体，提供从点位选择、内容制作到投放执行的一站式服务。
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <Reveal>
            <div className="relative min-h-[460px] overflow-hidden bg-ink lg:min-h-[620px]">
              <Image
                src="/images/guomao-day.jpg"
                alt="国贸大厦LED屏白天实景"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <span className="mono absolute left-6 top-6 bg-white px-3 py-2 text-[9px] font-black tracking-[0.1em]">
                XINING / 2011-2026
              </span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div>
              <span className="eyebrow">COMPANY PROFILE</span>
              <h2 className="section-title mt-6">
                一块城市屏，
                <br />
                连接品牌与街头。
              </h2>
              <p className="body-copy mt-6">
                公司以户外 LED 媒体运营为基础，围绕国贸大厦 LED 屏与恒润大厦 LED 屏，为品牌、文旅项目、城市活动和本地经营主体提供清晰、可执行的传播方案。
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ['2011', '公司成立'],
                  ['2 块', '核心户外 LED 屏'],
                  ['单屏', '独立选择与报价'],
                  ['组合', '双屏联动方案'],
                ].map(([value, label]) => (
                  <div key={label} className="border-l-2 border-signal pl-4">
                    <strong className="text-2xl font-black">{value}</strong>
                    <p className="mt-1 text-xs text-black/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-16 lg:py-24">
        <div className="container-site">
          <span className="eyebrow">WHAT WE DO</span>
          <div className="mt-6 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <h2 className="section-title">从选屏，到亮屏。</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ['媒体资源', '国贸大厦 LED 屏、恒润大厦 LED 屏分别销售；按品牌目标判断单屏或组合。'],
                ['投放策划', '根据传播任务、时间、区域与预算范围，组织可执行的投放建议。'],
                ['画面制作', '围绕户外观看距离、屏幕比例和环境亮度重新适配广告画面。'],
                ['项目执行', '确认档期、审核素材、按时上屏，并按实际条件提供执行记录。'],
              ].map(([title, text], index) => (
                <article key={title} className="border-t border-black/15 pt-5">
                  <span className="mono text-[10px] font-black text-signal">0{index + 1}</span>
                  <h3 className="mt-4 text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-black/50">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_.75fr]">
          <div>
            <span className="eyebrow">WORKING PRINCIPLES</span>
            <h2 className="section-title mt-6">先把事实讲清楚，再谈传播效果。</h2>
          </div>
          <ul className="grid gap-4">
            {[
              '两块屏分别报价，不强制捆绑',
              '数据只在口径确认后对外使用',
              '案例与客户 Logo 经授权后发布',
              '不承诺无法控制的成交结果',
              '素材版权与上屏内容先审核',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 border-b border-black/10 py-4 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-signal" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-signal py-14 text-white">
        <div className="container-site flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div>
            <span className="mono text-[10px] font-black tracking-[0.1em] text-white/65">CONTACT</span>
            <h2 className="mt-3 text-3xl font-black">和 {site.shortName} 聊聊你的下一次投放。</h2>
          </div>
          <Link href="/quote" className="btn-secondary shrink-0 border-white/60">
            提交需求
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
