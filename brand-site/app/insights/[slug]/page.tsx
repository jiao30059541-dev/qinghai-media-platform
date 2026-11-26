import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getArticle, getArticles } from '@/lib/content'
import { absoluteUrl, site } from '@/lib/site'
import { pageMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const articles = await getArticles()
  return articles.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return {}
  return pageMetadata({
    path: `/insights/${article.slug}`,
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    image: article.coverImage || '/images/guomao-night-hero.jpg',
    type: 'article',
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@id': `${site.url}/#organization` },
    publisher: { '@id': `${site.url}/#organization` },
    mainEntityOfPage: absoluteUrl(`/insights/${article.slug}`),
    inLanguage: 'zh-CN',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <header className="border-b border-black/10 py-14 lg:py-20">
          <div className="container-site">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-xs font-bold text-black/45 hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              返回投放知识
            </Link>
            <span className="eyebrow mt-10 block">{article.category}</span>
            <h1 className="mt-5 max-w-[1050px] text-[clamp(40px,5.3vw,76px)] font-black leading-[1.1]">
              {article.title}
            </h1>
            <p className="mt-6 max-w-[820px] text-lg leading-8 text-black/50">{article.excerpt}</p>
            <p className="mono mt-7 text-[10px] font-bold text-black/35">
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString('zh-CN')} · {site.name}
            </p>
          </div>
        </header>
        <div className="container-site grid gap-12 py-14 lg:grid-cols-[minmax(0,780px)_260px] lg:justify-center lg:py-20">
          <div className="prose-site">
            {article.content
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
          <aside className="h-fit border-t border-black/15 pt-5 lg:sticky lg:top-28">
            <span className="eyebrow">NEXT STEP</span>
            <h2 className="mt-3 text-2xl font-black">需要针对项目判断？</h2>
            <p className="mt-3 text-sm leading-7 text-black/45">
              告诉我们要投什么、投多久、希望解决什么问题，我们会给出选屏建议。
            </p>
            <Link href="/quote" className="btn-primary mt-6 w-full">
              提交需求
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </article>
    </>
  )
}
