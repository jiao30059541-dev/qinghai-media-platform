import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MonitorPlay,
  Palette,
  Phone,
  ScanSearch,
  Send,
} from 'lucide-react'
import LeadForm from '@/components/LeadForm'
import Reveal from '@/components/Reveal'
import DotField from '@/components/DotField'
import ScreenCard from '@/components/ScreenCard'
import { getCases, getPartners, getScreens } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import { getSiteConfig, site } from '@/lib/site'

export async function generateMetadata() {
  return pageMetadata({
    path: '/',
    title: site.defaultTitle,
    description: site.defaultDescription,
  })
}

const processSteps = [
  {
    icon: ScanSearch,
    title: '确认目标',
    text: '沟通传播任务、目标区域、预算与投放时间。',
  },
  {
    icon: CalendarDays,
    title: '选屏定档',
    text: '判断国贸单屏、恒润单屏或双屏联动，核对当期档期。',
  },
  {
    icon: Palette,
    title: '画面制作',
    text: '按屏幕比例、观看距离与环境光线重新组织画面。',
  },
  {
    icon: MonitorPlay,
    title: '审核上屏',
    text: '确认素材、播放顺序、频次与执行时间。',
  },
  {
    icon: CheckCircle2,
    title: '执行反馈',
    text: '完成上屏，并按实际执行条件提供记录。',
  },
]

export default async function HomePage() {
  const [screens, cases, partners, config] = await Promise.all([
    getScreens(),
    getCases(),
    getPartners(),
    getSiteConfig(),
  ])
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '西宁户外LED大屏广告投放',
    provider: { '@id': `${site.url}/#organization` },
    areaServed: { '@type': 'City', name: '西宁市' },
    serviceType: '户外LED媒体投放',
    description: site.defaultDescription,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <section className="relative min-h-[calc(100svh-74px)] overflow-hidden bg-[#07101a] text-white">
        <Image
          src="/images/guomao-night-hero.jpg"
          alt="国贸大厦LED屏夜间实景"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center]"
        />
        <div className="hero-shade absolute inset-0" />
        <DotField className="absolute inset-0 h-full w-full opacity-75" />
        <div className="container-site relative z-10 flex min-h-[calc(100svh-74px)] flex-col justify-end py-16 lg:justify-center lg:py-24">
          <div className="max-w-[820px]">
            <span className="eyebrow">CITY CORE / OUTDOOR LED / XINING</span>
            <h1 className="display-title mt-7">
              让您的品牌
              <br />
              在西宁核心商圈
              <br />
              <span className="text-signal">被看见。</span>
            </h1>
            <p className="mt-7 max-w-[620px] text-[15px] leading-8 text-white/70 sm:text-[17px]">
              国贸大厦 LED 屏与恒润大厦 LED 屏，一块承担城市级主画面，一块补充核心路口触达。分别报价，也可按传播任务组成双屏联动方案。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/screens" className="btn-primary">
                查看两块大屏
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${config.phone}`} className="btn-secondary">
                <Phone className="h-4 w-4" />
                电话咨询档期
              </a>
            </div>
            <div className="mono mt-14 flex flex-wrap items-center gap-x-4 gap-y-3 text-[10px] font-bold tracking-[0.08em] text-white/50">
              <span>国贸大厦 LED 屏</span>
              <i className="h-px w-6 bg-white/25" />
              <span>恒润大厦 LED 屏</span>
              <i className="h-px w-6 bg-white/25" />
              <span>双屏联动方案</span>
            </div>
          </div>
        </div>
        <a
          href="#screens"
          className="absolute bottom-0 right-0 z-20 hidden h-[92px] w-[64px] flex-col items-center justify-center gap-3 bg-signal text-white lg:flex"
          aria-label="向下查看屏幕资源"
        >
          <span className="mono text-[8px] font-black tracking-[0.12em] [writing-mode:vertical-rl]">
            SCROLL
          </span>
          <ArrowDown className="h-4 w-4" />
        </a>
      </section>

      <div className="overflow-hidden border-y border-black/10 bg-white">
        <div className="container-site mono flex min-h-12 items-center overflow-x-auto gap-8 whitespace-nowrap text-[10px] font-bold tracking-[0.08em] text-black/55">
          <span className="text-signal">MEDIA SERVICE</span>
          <span>点位咨询</span>
          <span className="h-1 w-1 bg-signal" />
          <span>档期确认</span>
          <span className="h-1 w-1 bg-signal" />
          <span>画面制作</span>
          <span className="h-1 w-1 bg-signal" />
          <span>审核上屏</span>
          <span className="h-1 w-1 bg-signal" />
          <span>执行反馈</span>
        </div>
      </div>

      <section id="screens" className="py-20 lg:py-28">
        <div className="container-site">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
              <div>
                <span className="eyebrow">01 / MEDIA RESOURCES</span>
                <h2 className="section-title mt-6">
                  两块屏，
                  <br />
                  <span className="text-signal">不是一个答案。</span>
                </h2>
              </div>
              <p className="body-copy max-w-[560px] lg:justify-self-end">
                国贸屏承担城市级品牌主画面，恒润屏补足核心路口与区域触达。两块屏独立报价，也可以组合执行同一套创意。
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[285px_minmax(0,1fr)]">
            <Reveal className="h-full">
              <aside className="flex h-full min-h-[500px] flex-col bg-signal p-7 text-white lg:min-h-[720px]">
                <span className="mono text-[10px] font-black tracking-[0.1em]">CHOOSE BY OBJECTIVE</span>
                <h3 className="mt-8 text-[30px] font-black leading-[1.2]">
                  先确定传播任务，
                  <br />
                  再选择屏幕。
                </h3>
                <div className="mt-10">
                  {[
                    ['01', '品牌主画面', '优先国贸大厦 LED 屏'],
                    ['02', '区域与路口触达', '优先恒润大厦 LED 屏'],
                    ['03', '城市级连续表达', '使用双屏联动方案'],
                  ].map(([index, title, text]) => (
                    <div
                      key={index}
                      className="grid grid-cols-[30px_1fr] gap-3 border-t border-white/30 py-5"
                    >
                      <b className="mono text-[10px]">{index}</b>
                      <p>
                        <strong className="block text-sm">{title}</strong>
                        <span className="mt-1 block text-xs text-white/65">{text}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/quote"
                  className="mt-auto flex items-center justify-between border-b border-white py-4 text-sm font-black"
                >
                  获取选屏建议
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </aside>
            </Reveal>
            <div className="grid gap-6">
              {screens.map((screen, index) => (
                <Reveal key={screen.slug} delay={index * 80}>
                  <ScreenCard screen={screen} priority={index === 0} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="container-site grid sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['2 块', '城市核心户外 LED 屏'],
            [screens[0]?.area || '260 ㎡', '国贸屏显示面积'],
            [screens[1]?.area || '72 ㎡', '恒润屏显示面积'],
            ['单屏 / 组合', '按传播任务灵活配置'],
          ].map(([value, label], index) => (
            <div
              key={label}
              className="grid min-h-[150px] grid-cols-[auto_1fr] content-center gap-3 border-black/10 px-6 py-7 sm:border-r lg:px-9 [&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:last-child]:border-r-0"
            >
              <span className="mono row-span-2 text-[10px] font-black text-signal">
                0{index + 1}
              </span>
              <strong className="text-[28px] font-black leading-none">{value}</strong>
              <p className="text-xs text-black/45">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#101419] py-20 text-white lg:py-28">
        <div className="container-site">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <span className="eyebrow">02 / CREATIVE IN THE CITY</span>
                <h2 className="section-title mt-6">
                  不是把海报放大，
                  <br />
                  <span className="text-signal">是让内容在街头成立。</span>
                </h2>
              </div>
              <p className="max-w-[520px] text-sm leading-7 text-white/50 lg:justify-self-end">
                先用自主制作的城市内容样片验证画面比例、色彩与远距离识别。正式客户案例经授权后再对外发布。
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3 lg:mt-16">
            {cases.slice(0, 3).map((item, index) => (
              <Reveal key={item.slug} delay={index * 80}>
                <Link
                  href={`/cases/${item.slug}`}
                  className="group block border border-white/10 bg-[#0b0e12]"
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={item.coverImage}
                      alt={`${item.title}画面示意`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <span className="absolute left-5 top-5 bg-signal px-3 py-2 text-[10px] font-black text-white">
                      {item.category}
                    </span>
                    <span className="absolute bottom-5 right-5 grid h-10 w-10 place-items-center bg-white text-ink transition-colors group-hover:bg-signal group-hover:text-white">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex min-h-[104px] items-center justify-between gap-5 px-5 py-4">
                    <div>
                      <span className="mono text-[9px] font-bold tracking-[0.1em] text-signal">
                        CREATIVE SAMPLE 0{index + 1}
                      </span>
                      <h3 className="mt-2 text-base font-black">{item.title}</h3>
                    </div>
                    <small className="shrink-0 text-right text-[11px] text-white/35">
                      {item.screen?.name || '双屏联动'}
                    </small>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <Link
              href="/cases"
              className="mt-8 flex items-center justify-between border-y border-white/10 py-5 text-sm font-black"
            >
              查看全部案例与内容样片
              <span className="flex items-center gap-2 text-signal">
                进入内容库
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-site">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr_.65fr] lg:items-end">
              <span className="eyebrow">03 / FROM IDEA TO SCREEN</span>
              <h2 className="section-title">
                从想法到亮屏，
                <br />
                <span className="text-signal">五步完成一次投放。</span>
              </h2>
              <p className="text-sm leading-7 text-black/50">
                先确认屏幕、档期和播放需求，再进入画面制作与上屏执行。每一步都有明确交付物。
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid border-t border-black/15 md:grid-cols-5">
            {processSteps.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 60}>
                <article className="min-h-[280px] border-b border-black/10 py-6 md:border-b-0 md:border-r md:px-5 md:last:border-r-0 lg:min-h-[320px]">
                  <span className="mono text-[10px] font-black text-signal">0{index + 1}</span>
                  <div className="mt-10 grid h-12 w-12 place-items-center border border-black/15 text-signal">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-8 text-lg font-black">{title}</h3>
                  <p className="mt-3 max-w-[210px] text-xs leading-6 text-black/45">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#9fd8ff] py-20 lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <Reveal>
            <div>
              <span className="mono text-[10px] font-black tracking-[0.1em] text-black/50">
                04 / PARTNERS & PROJECTS
              </span>
              <h2 className="mt-6 text-[clamp(38px,4.5vw,64px)] font-black leading-[1.08]">
                与不同伙伴，
                <br />
                共同完成城市表达。
              </h2>
              <p className="mt-6 max-w-[420px] text-sm leading-7 text-black/55">
                当前先展示合作类别。客户 Logo、项目名称与案例图片将在获得正式授权后接入。
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 border-l border-t border-black/25 md:grid-cols-3">
            {partners.slice(0, 6).map((partner, index) => (
              <div
                key={partner.id}
                className="flex min-h-[130px] flex-col justify-between border-b border-r border-black/25 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="mono text-[9px] font-black">0{index + 1}</span>
                  <span className="mono text-[8px] font-bold text-black/45">{partner.category}</span>
                </div>
                <strong className="text-lg">{partner.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <Reveal>
            <div className="relative min-h-[440px] overflow-hidden bg-ink lg:min-h-[600px]">
              <Image
                src="/images/guomao-night-crossing.jpg"
                alt="国贸大厦LED屏城市街景"
                fill
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="mono absolute left-6 top-6 text-[10px] font-bold tracking-[0.12em] text-white/70">
                XINING / CITY MEDIA / 2026
              </span>
              <b className="absolute bottom-7 left-7 text-4xl font-black text-white">名扬天下</b>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="lg:pl-8">
              <span className="eyebrow">05 / ABOUT US</span>
              <h2 className="section-title mt-6">
                西宁名扬天下
                <br />
                文化传媒有限公司
              </h2>
              <p className="body-copy mt-6">
                围绕国贸大厦 LED 屏与恒润大厦 LED 屏，提供点位咨询、档期确认、画面制作、上屏执行与双屏联动服务。
              </p>
              <dl className="mt-8 border-t border-black/10">
                {[
                  ['媒体资源', '国贸大厦 LED 屏 / 恒润大厦 LED 屏'],
                  ['服务范围', '媒体咨询 / 内容制作 / 项目执行'],
                  ['销售方式', '单屏独立报价 / 双屏联动组合'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[88px_1fr] gap-5 border-b border-black/10 py-4 text-sm"
                  >
                    <dt className="text-black/45">{label}</dt>
                    <dd className="font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-3 border-b border-signal pb-2 text-sm font-black text-signal"
              >
                了解公司
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="quote" className="py-20 lg:py-28">
        <div className="container-site grid gap-12 lg:grid-cols-[.78fr_1.22fr]">
          <Reveal>
            <div>
              <span className="eyebrow">06 / PLAN & QUOTE</span>
              <h2 className="section-title mt-6">
                确认屏幕，
                <br />
                <span className="text-signal">获取投放报价。</span>
              </h2>
              <p className="body-copy mt-6">
                正式价格与当前档期请电话咨询。我们需要先确认屏幕、时间与播放需求，再提供对应报价。
              </p>
              <a href={`tel:${config.phone}`} className="btn-primary mt-8">
                <Phone className="h-4 w-4" />
                {config.phoneDisplay}
              </a>
              <div className="mt-10 grid gap-3">
                {[
                  ['国贸大厦 LED 屏', '单屏独立报价'],
                  ['恒润大厦 LED 屏', '单屏独立报价'],
                  ['双屏联动方案', '按传播任务配置'],
                ].map(([name, mode]) => (
                  <Link
                    key={name}
                    href="/quote"
                    className="flex items-center justify-between border-y border-black/10 py-4 text-sm"
                  >
                    <strong>{name}</strong>
                    <span className="flex items-center gap-3 text-black/45">
                      {mode}
                      <ArrowUpRight className="h-4 w-4 text-signal" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="bg-white p-6 shadow-lift sm:p-9">
              <div className="mb-7 flex items-center gap-4">
                <span className="grid h-11 w-11 place-items-center bg-signal text-white">
                  <Send className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-xl font-black">提交投放需求</h3>
                  <p className="mt-1 text-xs text-black/45">通常在一个工作日内联系</p>
                </div>
              </div>
              <LeadForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
