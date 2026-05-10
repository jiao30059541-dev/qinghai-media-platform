// components/ResearchSection.tsx - 首页投放研究栏目（服务端组件）
import Link from 'next/link'
import { ArrowRight, BookOpen, MapPin, TrendingUp } from 'lucide-react'

const typeConfig: Record<string, { label: string, color: string, icon: any }> = {
  industry: { label: '行业知识', color: 'bg-blue-100 text-blue-700', icon: BookOpen },
  local: { label: '本地媒体', color: 'bg-green-100 text-green-700', icon: MapPin },
  case: { label: '投放案例', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
}

export default async function ResearchSection() {
  let articles: any[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.xnmytx.com'}/api/articles?pageSize=3&page=1`, {
      cache: 'no-store'
    })
    const data = await res.json()
    articles = data?.data?.articles || []
  } catch {
    // SSR fallback — 静默失败
  }

  if (articles.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">投放研究</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">青海广告行业知识、本地媒体解析、实战投放案例</p>
          </div>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">AI运营系统正在生成内容...</p>
            <p className="text-gray-400 text-sm mt-2">每日自动更新行业知识、本地媒体解析和投放案例</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">投放研究</h2>
            <p className="text-xl text-gray-600 max-w-3xl">青海广告行业知识、本地媒体解析、实战投放案例</p>
          </div>
          <Link href="/articles" className="hidden sm:flex items-center text-primary font-medium hover:underline">
            查看全部 <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article: any) => {
            const cfg = typeConfig[article.content_type] || typeConfig.industry
            const Icon = cfg.icon
            return (
              <Link key={article.id} href={`/articles/${article.id}`}
                className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* 封面图 */}
                <div className="h-52 relative overflow-hidden bg-gray-100">
                  {article.cover_image ? (
                    <img
                      src={article.cover_image}
                      alt={article.title || '青海广告投放研究文章'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {new Date(article.published_at || article.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    {article.keyword && (
                      <span className="text-xs text-gray-400">#{article.keyword}</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/articles"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            浏览全部文章 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
