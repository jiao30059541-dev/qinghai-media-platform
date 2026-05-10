// app/cases/page.tsx - 投放案例页面（数据库版）
'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { CheckCircle, TrendingUp, Users, Target, Star, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface CaseStudy {
  id: number
  title: string
  client: string
  industry: string
  challenge: string
  solution: string
  results: string[]
  metrics: { label: string; value: string; change: string }[]
  cover_image: string
  media_types: string[]
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(d => { if (d.success) setCases(d.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const defaultCover = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80'
  const fallbackCovers = [
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80',
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    'https://images.unsplash.com/photo-1553729459-afe8f2e2afc8?w=800&q=80',
  ]

  const industries = [...new Set(cases.map(c => c.industry).filter(Boolean))]
  const [filter, setFilter] = useState('')

  const filtered = filter ? cases.filter(c => c.industry === filter) : cases

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>投放案例 — 青海全媒体广告平台</title>
        <meta name="description" content="查看青海全媒体广告平台成功投放案例，涵盖餐饮、地产、教育等行业，了解我们的广告资源如何帮助品牌实现增长" />
      </Head>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold mb-4">投放案例</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-blue-200 max-w-2xl mx-auto">看看我们的广告资源如何帮助品牌实现增长</motion.p>
        </div>
      </section>

      {/* Filter */}
      {industries.length > 0 && (
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => setFilter('')} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!filter ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>全部</button>
              {industries.map(ind => (
                <button key={ind} onClick={() => setFilter(ind)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === ind ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{ind}</button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cases */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">暂无案例数据</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filtered.map((c, idx) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                  onClick={() => setSelectedCase(selectedCase === c.id ? null : c.id)}>
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">{c.industry}</span>
                    </div>
                    {c.media_types && c.media_types.length > 0 && (
                      <div className="absolute top-4 right-4 z-20 flex gap-1.5">
                        {c.media_types.slice(0, 2).map((mt, i) => (
                          <span key={i} className="bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">{mt}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{c.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{c.client}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">{c.solution || c.challenge}</p>
                    {c.metrics && c.metrics.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                        {c.metrics.map((m, i) => (
                          <div key={i} className="text-center">
                            <div className="text-lg font-bold text-primary">{m.value}</div>
                            <div className="text-xs text-gray-500">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCase === c.id && c.results && c.results.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-2">成果</h4>
                        <ul className="space-y-1">
                          {c.results.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> {r}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">让你的品牌也成为下一个成功案例</h2>
          <p className="text-gray-500 mb-8">立即联系我们，获取专属广告投放方案</p>
          <Button variant="primary" size="lg" className="rounded-2xl">立即咨询</Button>
        </div>
      </section>
    </div>
  )
}
