import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  MonitorPlay,
  Phone,
  ScanLine,
  SunMedium,
} from 'lucide-react'
import BaiduMap from '@/components/BaiduMap'
import LeadForm from '@/components/LeadForm'
import Reveal from '@/components/Reveal'
import { getScreen, getScreens, lines } from '@/lib/content'
import { absoluteUrl, getSiteConfig, site } from '@/lib/site'
import { pageMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const screens = await getScreens()
  return screens.map((screen) => ({ slug: screen.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const screen = await getScreen(slug)
  if (!screen) return {}
  return pageMetadata({
    path: `/screens/${screen.slug}`,
    title:
      screen.slug === 'guomao'
        ? '国贸大厦LED屏｜西宁城市级户外LED大屏'
        : '恒润大厦LED屏｜湟光十字核心路口大屏',
    description: `${screen.name}位于${screen.location}，屏体面积${screen.area}，显示尺寸${screen.displaySize}。查看点位参数、适用场景和投放咨询。`,
    image: screen.heroImage,
  })
}

export default async function ScreenDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const screen = await getScreen(slug)
  if (!screen) notFound()
  const config = await getSiteConfig()

  const gallery = lines(screen.galleryImages)
  const highlights = lines(screen.highlights)
  const screenJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: screen.name,
    description: screen.description,
    provider: { '@id': `${site.url}/#organization` },
    areaServed: { '@type': 'City', name: '西宁市' },
    image: absoluteUrl(screen.heroImage),
    url: absoluteUrl(`/screens/${screen.slug}`),
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首页', item: site.url },
      { '@type': 'ListItem', position: 2, name: '屏幕资源', item: `${site.url}/screens` },
      {
        '@type': 'ListItem',
        position: 3,
        name: screen.name,
        item: `${site.url}/screens/${screen.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([screenJsonLd, breadcrumbJsonLd]) }}
      />
      <section className="relative min-h-[680px] overflow-hidden bg-[#07101a] text-white">
        <Image
          src={screen.heroImage}
          alt={`${screen.name}夜间实景`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="hero-shade absolute inset-0" />
        <div className="container-site relative z-10 flex min-h-[680px] flex-col justify-end pb-16 pt-24">
          <Link
            href="/screens"
            className="mb-9 inline-flex w-fit items-center gap-2 text-xs font-bold text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回屏幕资源
          </Link>
          <span className="eyebrow">{screen.role}</span>
          <h1 className="mt-5 text-[clamp(46px,6.7vw,104px)] font-black leading-[1.02]">
            {screen.name}
          </h1>
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/65">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-signal" />
              {screen.location}
            </span>
            <span className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-signal" />
              {screen.area} / {screen.displaySize}
            </span>
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={`/quote?screen=${screen.slug}`} className="btn-primary">
              查询档期与报价
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={`tel:${config.phone}`} className="btn-secondary">
              <Phone className="h-4 w-4" />
              {config.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <Reveal>
            <div>
              <span className="eyebrow">SCREEN OVERVIEW</span>
              <h2 className="section-title mt-6">
                {screen.slug === 'guomao' ? '城市尺度的第一眼' : '核心路口的近距离'}
              </h2>
              <p className="body-copy mt-6">{screen.description}</p>
              <ul className="mt-8 grid gap-3">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-semibold">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-signal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <dl className="grid border-l border-t border-black/10 sm:grid-cols-2">
              {[
                ['屏体面积', screen.area],
                ['显示尺寸', screen.displaySize],
                ['物理分辨率', screen.resolution],
                ['点间距', screen.pixelPitch],
                ['播出时段', screen.operatingHours || '以实际排期为准'],
                ['每日频次', screen.dailyPlays || '按档位确认'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex min-h-[128px] flex-col justify-between border-b border-r border-black/10 p-5"
                >
                  <dt className="text-xs text-black/40">{label}</dt>
                  <dd className="mt-6 text-xl font-black">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-site">
          <div className="grid gap-5 md:grid-cols-2">
            {gallery.map((image, index) => (
              <Reveal key={image} delay={index * 60}>
                <div className={`relative overflow-hidden bg-ink ${index === 0 ? 'aspect-[16/10] md:col-span-2' : 'aspect-[4/3]'}`}>
                  <Image
                    src={image}
                    alt={`${screen.name}现场图 ${index + 1}`}
                    fill
                    sizes={index === 0 ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-white py-14 lg:py-18">
        <div className="container-site grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-center">
          <div>
            <span className="eyebrow">LOCATION / BAIDU MAP</span>
            <h2 className="mt-4 text-3xl font-black">{screen.shortName} 地理位置</h2>
            <p className="mt-4 text-sm leading-7 text-black/45">
              {screen.location}。地图用于辅助判断区域位置，实际到点观看与档期请电话确认。
            </p>
          </div>
          <BaiduMap title={screen.name} address={screen.location} />
        </div>
      </section>

      <section className="bg-[#101419] py-16 text-white lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <span className="eyebrow">PRICING & AVAILABILITY</span>
            <h2 className="section-title mt-6">按档位确认，按项目核价。</h2>
            <p className="mt-6 max-w-[460px] text-sm leading-7 text-white/50">
              正式刊例价与当前档期按当期版本执行。提交需求后，我们会根据播放时长、频次和周期提供对应报价。
            </p>
          </div>
          <div className="border-t border-white/15">
            {screen.pricingPlans.map((plan) => (
              <div
                key={plan.code}
                className="grid gap-3 border-b border-white/15 py-5 sm:grid-cols-[68px_1fr_auto] sm:items-center"
              >
                <span className="mono text-[10px] font-black text-signal">{plan.code}</span>
                <div>
                  <strong className="text-lg">{plan.name}</strong>
                  <p className="mt-1 text-xs text-white/40">{plan.description}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/55 sm:justify-end">
                  <span>{plan.duration}</span>
                  <span>{plan.frequency}</span>
                  <span>{plan.period}</span>
                  <b className="bg-white/10 px-2.5 py-1 text-white">{plan.priceLabel}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <span className="eyebrow">BOOK THIS SCREEN</span>
            <h2 className="section-title mt-6">查询 {screen.shortName} 档期</h2>
            <p className="body-copy mt-6">
              提供计划月份和传播目标即可开始沟通。需要双屏组合时，也请在需求中注明。
            </p>
            <div className="mt-8 grid gap-4 border-t border-black/10 pt-6 text-sm">
              <p className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-signal" />
                档期按提交顺序确认
              </p>
              <p className="flex items-center gap-3">
                <MonitorPlay className="h-4 w-4 text-signal" />
                素材需按屏幕比例制作
              </p>
              <p className="flex items-center gap-3">
                <SunMedium className="h-4 w-4 text-signal" />
                户外观看以现场环境为准
              </p>
            </div>
          </div>
          <div className="bg-white p-6 shadow-lift sm:p-8">
            <LeadForm defaultScreen={screen.slug} source={`screen-${screen.slug}`} />
          </div>
        </div>
      </section>
    </>
  )
}
