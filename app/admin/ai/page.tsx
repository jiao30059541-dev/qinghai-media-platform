// app/admin/ai/page.tsx - AI运营中心Dashboard
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, FileText, Target, TrendingUp, Users, Search,
  Clock, CheckCircle, AlertCircle, Edit3, Zap, Activity,
  BarChart3, Globe, Star, Eye, ArrowUpRight, MessageSquare,
  RefreshCw, Settings, Loader2, ChevronRight, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DashboardData {
  today_content: number
  total_keywords: number
  total_topics: number
  high_value_leads: number
  published_total: number
  pending_review: number
  published_count: number
  pending_review_count: number
  draft_count: number
  high_priority_keywords: number
  active_keyword_count: number
  keyword_coverage: number
  recent_tasks: any[]
  high_value_leads_list: any[]
  topics: any[]
  content_by_type: Record<string, number>
  seo_trend: { label: string; views: number; clicks: number }[]
}

export default function AdminAIDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/dashboard', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setTimeout(() => setRefreshing(false), 500)
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      published: { label: '已发布', cls: 'bg-green-100 text-green-700' },
      pending_review: { label: '待审核', cls: 'bg-yellow-100 text-yellow-700' },
      draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
      failed: { label: '失败', cls: 'bg-red-100 text-red-700' },
    }
    const m = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.cls}`}>{m.label}</span>
  }

  const kpiCards = data ? [
    { label: '今日生成文章', value: data.today_content, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', sub: '篇' },
    { label: '关键词覆盖', value: data.keyword_coverage, icon: Search, color: 'text-purple-600', bg: 'bg-purple-50', sub: '个活跃' },
    { label: '已发布文章', value: data.published_count, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', sub: '篇总计' },
    { label: '待审核', value: data.pending_review_count, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', sub: '篇待处理' },
    { label: '高意向线索', value: data.high_value_leads, icon: Star, color: 'text-rose-600', bg: 'bg-rose-50', sub: '条未联系' },
    { label: '热点话题', value: data.total_topics, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', sub: '个追踪' },
  ] : []

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI运营中心
          </h1>
          <p className="text-gray-500">AI内容生成、关键词覆盖、线索评分一站式管理</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn('w-4 h-4 mr-1', refreshing && 'animate-spin')} />
            刷新
          </Button>
          <Button variant="primary" size="sm" className="rounded-xl bg-gradient-to-r from-primary to-blue-600" onClick={() => window.location.href = '/admin/ai/settings'}>
            <Settings className="w-4 h-4 mr-1" />
            运营设置
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-gray-400">加载中...</span>
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-gray-400">无法加载数据</div>
      ) : (
        <>
          {/* KPI统计卡片 */}
          <div className="grid grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {kpiCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`${card.bg} rounded-2xl p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                  <span className="text-xs text-gray-400">{card.sub}</span>
                </div>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-xs text-gray-500 mt-1">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* SEO流量趋势 */}
            <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> SEO流量趋势
              </h3>
              {data.seo_trend.length > 0 ? (
                <div className="space-y-1">
                  {data.seo_trend.slice(-14).map((point, i) => {
                    const maxViews = Math.max(...data.seo_trend.map(p => p.views))
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-14 flex-shrink-0">{point.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                          <div
                            className="absolute inset-0 flex items-center px-2"
                          >
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                              style={{ width: `${Math.min(100, (point.views / maxViews) * 100)}%` }}
                            />
                            <span className="absolute right-2 text-xs font-medium text-gray-600">
                              {point.views}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-10 text-right">{point.clicks}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">暂无流量数据</p>
              )}
            </div>

            {/* 内容类型分布 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-500" /> 内容类型分布
              </h3>
              {Object.keys(data.content_by_type).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.content_by_type).map(([type, count], i) => {
                    const total = Object.values(data.content_by_type).reduce((a, b) => a + b, 0)
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                    const labels: Record<string, string> = {
                      industry: '行业知识',
                      local: '本地媒体',
                      case: '投放案例',
                    }
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500']
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{labels[type] || type}</span>
                          <span className="font-semibold text-gray-900">{count}篇 ({pct}%)</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className={`${colors[i % 3]} h-full rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">暂无内容数据</p>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-600 mb-3">文章状态概览</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" /> 已发布
                    </span>
                    <span className="font-medium text-green-600">{data.published_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-yellow-500" /> 待审核
                    </span>
                    <span className="font-medium text-yellow-600">{data.pending_review_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-gray-400" /> 草稿
                    </span>
                    <span className="font-medium text-gray-600">{data.draft_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* 高意向客户线索 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-rose-500" /> 高意向客户线索
                <span className="ml-auto text-xs text-gray-400">{data.high_value_leads}条未联系</span>
              </h3>
              {data.high_value_leads_list.length > 0 ? (
                <div className="space-y-2">
                  {data.high_value_leads_list.slice(0, 8).map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center">
                          <Users className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name || '匿名用户'}</div>
                          <div className="text-xs text-gray-400">{lead.company_name || lead.phone || '-'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-rose-600">{lead.score || 0}分</div>
                        <span className="px-1.5 py-0.5 bg-rose-200 rounded text-xs text-rose-700">{lead.score_level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">暂无高意向线索</p>
              )}
            </div>

            {/* 热门话题 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" /> 热点话题追踪
              </h3>
              {data.topics.length > 0 ? (
                <div className="space-y-2">
                  {data.topics.map((topic: any, i: number) => (
                    <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-bold text-gray-300 w-5 flex-shrink-0">#{i + 1}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{topic.topic}</div>
                          <div className="text-xs text-gray-400">
                            {topic.heat_score || 0}热度 · {topic.category || '未分类'}
                          </div>
                        </div>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0',
                        topic.status === 'generated' ? 'bg-green-100 text-green-700' :
                        topic.status === 'published' ? 'bg-blue-100 text-blue-700' :
                        topic.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {topic.status === 'generated' ? '已生成' :
                         topic.status === 'published' ? '已发布' :
                         topic.status === 'pending' ? '待处理' : '忽略'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">暂无热点话题</p>
              )}
            </div>
          </div>

          {/* 最近内容任务 */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> 最近内容任务
              <span className="ml-auto text-xs text-gray-400">共{data.recent_tasks.length}条</span>
            </h3>
            {data.recent_tasks.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {data.recent_tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        task.content_type === 'industry' ? 'bg-blue-100' :
                        task.content_type === 'local' ? 'bg-green-100' : 'bg-orange-100'
                      )}>
                        {task.content_type === 'industry' ? <Globe className="w-4 h-4 text-blue-600" /> :
                         task.content_type === 'local' ? <MapPin className="w-4 h-4 text-green-600" /> :
                         <BarChart3 className="w-4 h-4 text-orange-600" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{task.title}</div>
                        <div className="text-xs text-gray-400">
                          {task.keyword && <span className="mr-2">关键词: {task.keyword}</span>}
                          {task.created_at && new Date(task.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      {statusBadge(task.status)}
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-400">暂无内容任务，请先配置关键词生成内容</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// 内联 PieChart icon（lucide没有内置PieChart）
function PieChart(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  )
}

// Inline MapPin icon (for content type display)
function MapPin(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
