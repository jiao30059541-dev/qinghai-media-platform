import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { getCases } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  return pageMetadata({
    path: '/cases',
    title: '户外LED广告案例与内容样片｜名扬天下传媒',
    description:
      '展示适合国贸大厦LED屏与恒润大厦LED屏的广告画面样片、内容制作方法与投放场景。正式客户案例经授权后发布。',
  })
}

export default async function CasesPage() {
  const cases = await getCases()

  return (
    <>
      <section className="py-16 lg:py-24">
        <div className="container-site">
          <span className="eyebrow">CASES / CREATIVE IN THE CITY</span>
          <h1 className="display-title mt-7 max-w-[1100px]">
            内容先成立，
            <br />
            <span className="text-signal">品牌才会被看见。</span>
          </h1>
          <p className="body-copy mt-7 max-w-[720px]">
            当前内容库以自主制作的城市画面样片为主，用于验证比例、字级、色彩与观看距离。正式客户项目将在取得授权后发布。
          </p>
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="container-site grid gap-7 md:grid-cols-2">
          {cases.map((item, index) => (
            <Reveal key={item.slug} delay={index * 70}>
              <Link
                href={`/cases/${item.slug}`}
                className="group block border border-black/10 bg-white"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.coverImage}
                    alt={`${item.title}画面示意`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 bg-signal px-3 py-2 text-xs font-black text-white">
                    {item.category}
                  </span>
                  <span className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center bg-white transition-colors group-hover:bg-signal group-hover:text-white">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-black/40">
                    <span>{item.screen?.name || '双屏联动'}</span>
                    <span className="h-1 w-1 bg-signal" />
                    <span>{new Date(item.publishedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-black/50">{item.summary}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
