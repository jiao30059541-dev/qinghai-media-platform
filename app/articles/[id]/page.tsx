// app/articles/[id]/page.tsx - 文章详情页
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar, Tag, ChevronLeft, Loader2, FileText,
  BookOpen, Newspaper, TrendingUp, Clock, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Head from 'next/head'

interface Article {
  id: number
  title: string
  content_type: 'industry' | 'local' | 'case'
  keyword: string
  content: string
  summary: string
  seo_keywords: string
  cover_image: string
  published_at: string
  created_at: string
  updated_at: string
}

const contentTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  industry: { label: '行业知识', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  local: { label: '本地媒体', icon: Newspaper, color: 'bg-green-100 text-green-700' },
  case: { label: '投放案例', icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
}

export default function ArticleDetailPage() {
  const params = useParams()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [related, setRelated] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!articleId) return
    setLoading(true)
    setError('')

    fetch(`/api/articles/${articleId}`)
      .then(r => {
        if (!r.ok) throw new Error('文章不存在')
        return r.json()
      })
      .then(d => {
        if (d.success) {
          setArticle(d.data.article)
          setRelated(d.data.related || [])
        } else {
          setError(d.message || '获取失败')
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [articleId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {error || '文章不存在'}
          </h2>
          <Link href="/articles" className="inline-flex items-center gap-1 text-primary hover:underline mt-4">
            <ChevronLeft className="w-4 h-4" />
            返回文章列表
          </Link>
        </div>
      </div>
    )
  }

  const ctInfo = contentTypeLabels[article.content_type] || { label: '未分类', icon: FileText, color: 'bg-gray-100 text-gray-700' }
  const Icon = ctInfo.icon
  const publishDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : ''
  const updateDate = article.updated_at
    ? new Date(article.updated_at).toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : ''

  // 动态SEO信息
  const pageTitle = `${article.title} - 投放研究 - 青海全媒体广告平台`
  const pageDesc = article.summary || `${article.title} - 青海广告投放行业研究`
  const pageKeywords = article.seo_keywords || `${article.keyword},青海广告,广告投放`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="article" />
        {article.cover_image && (
          <meta property="og:image" content={article.cover_image} />
        )}
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* 移动端SEO元信息 */}
        <div className="hidden">
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
        </div>

        {/* 面包屑导航 */}
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary transition-colors">首页</Link>
              <span>/</span>
              <Link href="/articles" className="hover:text-primary transition-colors">投放研究</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium truncate max-w-[200px]">{article.title}</span>
            </div>
          </div>
        </section>

        {/* 文章内容 */}
        <article className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 文章头部信息 */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${ctInfo.color}`}>
                    <Icon className="w-4 h-4" />
                    {ctInfo.label}
                  </span>
                  {article.keyword && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm">
                      <Tag className="w-3.5 h-3.5" />
                      {article.keyword}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {publishDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      发布时间：{publishDate}
                    </span>
                  )}
                  {updateDate && updateDate !== publishDate && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      更新于：{updateDate}
                    </span>
                  )}
                </div>
              </div>

              {/* 封面图 */}
              {article.cover_image && (
                <div className="mb-10 rounded-3xl overflow-hidden shadow-lg">
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}

              {/* 摘要 */}
              {article.summary && (
                <div className="bg-blue-50 border-l-4 border-primary rounded-r-2xl p-5 mb-10">
                  <p className="text-gray-700 leading-relaxed">{article.summary}</p>
                </div>
              )}

              {/* 正文内容 */}
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg prose-blockquote:border-primary prose-blockquote:bg-gray-50 prose-blockquote:rounded-r-2xl prose-li:text-gray-700 mb-16"
                dangerouslySetInnerHTML={{ __html: article.content || '' }}
              />

              {/* SEO关键词标签 */}
              {article.seo_keywords && (
                <div className="mb-10 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    关键词
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.seo_keywords.split(',').map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white text-gray-600 rounded-lg text-sm border border-gray-200"
                      >
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </article>

        {/* 相关文章 */}
        {related.length > 0 && (
          <section className="py-16 bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                相关文章
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((item, idx) => {
                  const info = contentTypeLabels[item.content_type] || { label: '未分类', icon: FileText, color: 'bg-gray-100 text-gray-700' }
                  const RelIcon = info.icon
                  const relDate = item.published_at
                    ? new Date(item.published_at).toLocaleDateString('zh-CN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })
                    : ''

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Link href={`/articles/${item.id}`}>
                        <div className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-all group h-full flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                              <RelIcon className="w-3 h-3" />
                              {info.label}
                            </span>
                            {relDate && (
                              <span className="text-xs text-gray-400">{relDate}</span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                            {item.title}
                          </h3>
                          <span className="text-primary text-xs font-medium mt-3 group-hover:underline inline-flex items-center gap-0.5">
                            阅读全文 <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* 返回列表 */}
        <section className="py-10 bg-white border-t">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              返回投放研究列表
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
