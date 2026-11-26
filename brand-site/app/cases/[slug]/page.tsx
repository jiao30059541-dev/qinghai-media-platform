import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getCase, getCases } from '@/lib/content'
import { absoluteUrl, site } from '@/lib/site'
import { pageMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const cases = await getCases()
  return cases.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getCase(slug)
  if (!item) return {}
  return pageMetadata({
    path: `/cases/${item.slug}`,
    title: item.title,
    description: item.summary,
    image: item.coverImage,
    type: 'article',
  })
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getCase(slug)
  if (!item) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: item.title,
    description: item.summary,
    image: absoluteUrl(item.coverImage),
    datePublished: item.publishedAt,
    creator: { '@id': `${site.url}/#organization` },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <header className="bg-[#101419] py-14 text-white lg:py-20">
          <div className="container-site">
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 text-xs font-bold text-white/55 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              返回案例与内容
            </Link>
            <span className="eyebrow mt-10 block">{item.category}</span>
            <h1 className="mt-5 max-w-[1000px] text-[clamp(42px,6vw,82px)] font-black leading-[1.05]">
              {item.title}
            </h1>
            <div className="mt-7 flex flex-wrap gap-4 text-sm text-white/45">
              <span>{item.screen?.name || '双屏联动方案'}</span>
              <span>·</span>
              <span>{new Date(item.publishedAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </header>

        <div className="relative aspect-[16/9] bg-ink">
          <Image
            src={item.coverImage}
            alt={`${item.title}画面示意`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <section className="py-16 lg:py-24">
          <div className="container-site grid gap-12 lg:grid-cols-[.62fr_1.38fr]">
            <aside>
              <span className="eyebrow">PROJECT NOTE</span>
              <p className="mt-5 text-sm leading-7 text-black/45">
                {item.category === '创意样片'
                  ? '本页内容为自有创意样片，用于展示屏幕内容适配方法，不作为客户投放案例。'
                  : '项目内容已发布，具体执行信息以项目确认单为准。'}
              </p>
            </aside>
            <div>
              <p className="text-2xl font-bold leading-[1.7]">{item.summary}</p>
              <div className="mt-12 grid gap-9 border-t border-black/10 pt-8 md:grid-cols-3">
                {[
                  ['传播问题', item.challenge],
                  ['画面方法', item.solution],
                  ['执行结果', item.result],
                ].map(([label, value]) => (
                  <div key={label}>
                    <h2 className="text-sm font-black text-signal">{label}</h2>
                    <p className="mt-4 text-sm leading-7 text-black/55">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/10 bg-white py-12">
          <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black">需要按你的品牌重新制作画面？</h2>
              <p className="mt-2 text-sm text-black/45">先确认屏幕与档期，再进入创意适配。</p>
            </div>
            <Link href="/quote" className="btn-primary">
              获取投放建议
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
