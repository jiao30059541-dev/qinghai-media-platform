// app/admin/ab-tests/[id]/page.tsx - A/B测试详情页
'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  Target, Play, Square, BarChart3, FlaskConical,
  ChevronRight, ArrowLeft, Loader2, CheckCircle, XCircle, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Variant {
  id: string
  name: string
  type: 'control' | 'treatment'
  traffic_weight: number
  impressions: number
  clicks: number
  conversions: number
  conversion_rate: number
}

interface StatsResult {
  chi_square: number
  p_value: number
  confidence_level: number
  winner_variant: string | null
  is_significant: boolean
}

interface TimelineEvent {
  id: string
  action: string
  description: string
  created_at: string
}

interface ABTestDetail {
  id: string
  name: string
  description: string
  type: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled'
  hypothesis: string
  min_sample_size: number
  confidence_level: number
  created_at: string
  updated_at: string
  variants: Variant[]
  stats: StatsResult | null
  timeline: TimelineEvent[]
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: 'text-gray-700', bg: 'bg-gray-100' },
  running: { label: '运行中', color: 'text-green-700', bg: 'bg-green-100' },
  paused: { label: '已暂停', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  completed: { label: '已完成', color: 'text-blue-700', bg: 'bg-blue-100' },
  cancelled: { label: '已取消', color: 'text-red-700', bg: 'bg-red-100' },
}

const eventLabels: Record<string, string> = {
  created: '测试创建',
  started: '测试启动',
  paused: '测试暂停',
  resumed: '测试恢复',
  completed: '测试完成',
  cancelled: '测试取消',
  variant_added: '添加变体',
  variant_removed: '移除变体',
}

const actionIcons: Record<string, any> = {
  created: CheckCircle,
  started: Play,
  paused: Square,
  resumed: Play,
  completed: CheckCircle,
  cancelled: XCircle,
}

export default function ABTestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token") || ""

  const unwrappedParams = use(params)
  const router = useRouter()
  const [test, setTest] = useState<ABTestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTest()
  }, [unwrappedParams.id])

  const fetchTest = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ab-tests/' + unwrappedParams.id, { headers: { Authorization: `Bearer ${getToken()}` } })
      if (res.ok) {
        const data = await res.json()
        setTest(data.test || data)
      }
    } catch (e) {
      console.error('Failed to fetch test detail', e)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/ab-tests/' + unwrappedParams.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        fetchTest()
      }
    } catch (e) {
      console.error('Failed to perform action', e)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const getTestTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      split_url: 'URL分流测试',
      multivariate: '多变量测试',
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">加载中...</span>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="text-center py-20">
        <Target className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">测试未找到</h3>
        <p className="mt-2 text-sm text-gray-500">该A/B测试不存在或已被删除</p>
        <button onClick={() => router.push('/admin/ab-tests')}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary/80">
          <ArrowLeft className="w-4 h-4 mr-2" />返回列表
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 返回导航 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/admin/ab-tests')}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>A/B测试</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{test.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {test.status === 'draft' && (
            <button onClick={() => handleAction('start')} disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              启动测试
            </button>
          )}
          {test.status === 'running' && (
            <button onClick={() => handleAction('pause')} disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50 transition-colors">
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2" />}
              暂停测试
            </button>
          )}
          {test.status === 'paused' && (
            <button onClick={() => handleAction('resume')} disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
              {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              恢复测试
            </button>
          )}
          {(test.status === 'running' || test.status === 'paused') && (
            <button onClick={() => handleAction('complete')} disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              完成测试
            </button>
          )}
        </div>
      </div>

      {/* 基本信息卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">{test.name}</h2>
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                statusConfig[test.status].bg, statusConfig[test.status].color
              )}>
                {statusConfig[test.status].label}
              </span>
            </div>
            {test.description && (
              <p className="mt-2 text-sm text-gray-500">{test.description}</p>
            )}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div>
            <span className="text-xs text-gray-400">测试类型</span>
            <p className="mt-1 text-sm font-medium text-gray-800 flex items-center">
              <FlaskConical className="w-4 h-4 mr-1.5 text-primary" />
              {getTestTypeLabel(test.type)}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-400">假设</span>
            <p className="mt-1 text-sm font-medium text-gray-800">{test.hypothesis || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">最小样本量</span>
            <p className="mt-1 text-sm font-medium text-gray-800">{test.min_sample_size?.toLocaleString() || '-'}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">置信水平</span>
            <p className="mt-1 text-sm font-medium text-gray-800">{Math.round((test.confidence_level || 0) * 100)}%</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">创建时间</span>
            <p className="mt-1 text-sm font-medium text-gray-800">{formatDate(test.created_at)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">更新时间</span>
            <p className="mt-1 text-sm font-medium text-gray-800">{formatDate(test.updated_at)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">变体数量</span>
            <p className="mt-1 text-sm font-medium text-gray-800">{test.variants?.length || 0} 个</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">数据状态</span>
            <p className="mt-1 text-sm font-medium text-gray-800">
              {test.stats?.is_significant ? '有统计显著性' : '待收集足够数据'}
            </p>
          </div>
        </div>
      </div>

      {/* 变体对比表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary" />变体对比
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-500">变体名称</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">类型</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">流量权重</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">曝光数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">点击数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">转化数</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">转化率</th>
              </tr>
            </thead>
            <tbody>
              {test.variants?.map((v, idx) => (
                <tr key={v.id || idx} className={cn(
                  'border-b border-gray-50 hover:bg-gray-50/50',
                  test.stats?.winner_variant === v.id && 'bg-green-50/50'
                )}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{v.name}</span>
                      {test.stats?.winner_variant === v.id && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          获胜
                        </span>
                      )}
                      {v.type === 'control' && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">对照组</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{v.type === 'control' ? '对照' : '实验'}</td>
                  <td className="py-3 px-4 text-right">{v.traffic_weight}%</td>
                  <td className="py-3 px-4 text-right">{v.impressions?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4 text-right">{v.clicks?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4 text-right">{v.conversions?.toLocaleString() || 0}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {v.conversion_rate != null ? (v.conversion_rate * 100).toFixed(2) + '%' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 统计结果卡片 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-primary" />统计结果
        </h3>
        {test.stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-400">卡方值 (&chi;²)</span>
              <p className="mt-1 text-lg font-bold text-gray-900">{test.stats.chi_square?.toFixed(4) || '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-400">P值</span>
              <p className="mt-1 text-lg font-bold text-gray-900">{test.stats.p_value?.toFixed(6) || '-'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-xs text-gray-400">置信水平</span>
              <p className="mt-1 text-lg font-bold text-gray-900">{Math.round((test.stats.confidence_level || 0) * 100)}%</p>
            </div>
            <div className={cn(
              'rounded-lg p-4',
              test.stats.winner_variant ? 'bg-green-50' : 'bg-gray-50'
            )}>
              <span className="text-xs text-gray-400">获胜变体</span>
              <p className={cn(
                'mt-1 text-lg font-bold',
                test.stats.winner_variant ? 'text-green-600' : 'text-gray-500'
              )}>
                {test.stats.winner_variant || '暂无'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <BarChart3 className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">数据收集进行中，暂无可用的统计结果</p>
          </div>
        )}
      </div>

      {/* 事件时间线 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />事件时间线
        </h3>
        {test.timeline && test.timeline.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-4">
              {test.timeline.map((event) => {
                const Icon = actionIcons[event.action] || Clock
                return (
                  <div key={event.id} className="relative flex items-start gap-4 pl-2">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-100">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-sm font-medium text-gray-800">{eventLabels[event.action] || event.action}</p>
                      {event.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{formatDate(event.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Clock className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">暂无事件记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
