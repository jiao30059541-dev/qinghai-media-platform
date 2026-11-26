import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { getArticles } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  return pageMetadata({
    path: '/insights',
    title: '西宁户外广告投放知识｜选屏、创意与上屏指南',
    description:
      '关于西宁户外LED大屏选屏、广告画面制作、播放档位和投放执行的实用指南，由名扬天下传媒持续更新。',
  })
}

export default async function InsightsPage() {
  const articles = await getArticles()

  return (
    <>
      <section className="py-16 lg:py-24">
        <div className="container-site">
          <span className="eyebrow">INSIGHTS / OUTDOOR MEDIA</span>
          <h1 className="display-title mt-7 max-w-[1050px]">
            把户外投放，
            <br />
            <span className="text-signal">做得更清楚。</span>
          </h1>
          <p className="body-copy mt-7 max-w-[720px]">
            从屏幕选择、画面制作到播放档期，把城市户外媒体投放中的关键判断讲清楚。
          </p>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="container-site">
          {articles.map((article, index) => (
            <Reveal key={article.slug} delay={index * 60}>
              <Link
                href={`/insights/${article.slug}`}
                className="group grid gap-5 border-t border-black/15 py-8 last:border-b md:grid-cols-[100px_1fr_auto] md:items-center"
              >
                <span className="mono text-[10px] font-black text-signal">
                  {String(index + 1).padStart(2, '0')} / {article.category}
                </span>
                <div>
                  <h2 className="text-[clamp(22px,2.5vw,34px)] font-black transition-colors group-hover:text-signal">
                    {article.title}
                  </h2>
                  <p className="mt-3 max-w-[850px] text-sm leading-7 text-black/45">
                    {article.excerpt}
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center border border-black/15 transition-colors group-hover:border-signal group-hover:bg-signal group-hover:text-white">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
