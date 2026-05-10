// app/articles/page.tsx - 投放研究文章列表页
'use client'

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Newspaper, Clock, Tag, ChevronLeft, ChevronRight,
  Loader2, FileText, BookOpen, TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: number
  title: string
  content_type: 'industry' | 'local' | 'case'
  keyword: string
  summary: string
  seo_keywords: string
  cover_image: string
  published_at: string
  created_at: string
}

interface ArticlesResponse {
  articles: Article[]
  total: number
  page: number
  pageSize: number
}

const contentTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  industry: { label: '行业知识', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  local: { label: '本地媒体', icon: Newspaper, color: 'bg-green-100 text-green-700' },
  case: { label: '投放案例', icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
}

const contentTypes = [
  { value: '', label: '全部分类' },
  { value: 'industry', label: '行业知识' },
  { value: 'local', label: '本地媒体' },
  { value: 'case', label: '投放案例' },
]

export default function ArticlesPage() {
  const [data, setData] = useState<ArticlesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [contentType, setContentType] = useState('')
  const pageSize = 12

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('pageSize', String(pageSize))
    if (contentType) params.set('contentType', contentType)

    fetch(`/api/articles?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, contentType])

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>投放研究 — 青海全媒体广告平台</title>
        <meta name="description" content="青海广告投放行业知识、本地媒体研究和投放案例分析，助力您的广告投放决策。涵盖户外广告、LED大屏、电梯广告等青海本地媒体资讯。" />
        <meta name="keywords" content="青海广告, 广告投放, 户外广告, 媒体研究, 投放案例" />
      </Head>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            投放研究
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-200 max-w-2xl mx-auto"
          >
            行业洞察 · 本地媒体 · 投放案例 — 让每一次投放都有据可依
          </motion.p>
        </div>
      </section>

      {/* 分类筛选 */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {contentTypes.map(ct => (
              <button
                key={ct.value}
                onClick={() => {
                  setContentType(ct.value)
                  setPage(1)
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  contentType === ct.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 文章列表 */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !data || data.articles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">暂无相关文章</p>
              <p className="text-sm mt-2 text-gray-400">敬请期待更多精彩内容</p>
            </div>
          ) : (
            <>
              {/* 文章计数 */}
              <div className="mb-8 text-gray-500 text-sm">
                共找到 <span className="font-semibold text-gray-700">{data.total}</span> 篇文章
              </div>

              {/* 文章网格 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.articles.map((article, idx) => {
                  const ctInfo = contentTypeLabels[article.content_type] || { label: '未分类', icon: FileText, color: 'bg-gray-100 text-gray-700' }
                  const Icon = ctInfo.icon
                  const publishDate = article.published_at
                    ? new Date(article.published_at).toLocaleDateString('zh-CN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })
                    : ''

                  return (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Link href={`/articles/${article.id}`}>
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group h-full flex flex-col">
                          {/* 封面图 */}
                          <div className="h-44 relative overflow-hidden bg-gray-100">
                            {article.cover_image ? (
                              <img
                                src={article.cover_image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                            <div className="absolute top-4 left-4 z-20">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${ctInfo.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                                {ctInfo.label}
                              </span>
                            </div>
                            {article.keyword && (
                              <div className="absolute top-4 right-4 z-20">
                                <span className="bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                  {article.keyword}
                                </span>
                              </div>
                            )}
                            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                              {publishDate && (
                                <span className="bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {publishDate}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* 内容区 */}
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {article.title}
                            </h3>
                            {article.summary && (
                              <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                                {article.summary}
                              </p>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <span className="text-primary text-sm font-medium group-hover:underline">
                                阅读全文 →
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            想要获取更多投放建议？
          </h2>
          <p className="text-gray-500 mb-8">
            试试我们的 AI 智能方案生成器，一键生成专属投放方案
          </p>
          <Link href="/ai-chat">
            <button className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-colors">
              AI 智能出方案
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
