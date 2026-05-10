// app/admin/analytics/page.tsx - 数据分析页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, TrendingDown, Users, ShoppingBag,
  Monitor, DollarSign, Clock, ArrowUpRight, ArrowDownRight,
  Activity, Globe, Building2, Target, Zap, Star,
  Download, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface KPIData {
  total_orders: number
  total_revenue: number
  avg_order_value: number
  active_customers: number
  active_media: number
  cities_covered: number
  total_users: number
  active_advertisers: number
  active_suppliers: number
  paid_income: number
  total_expenses: number
  net_income: number
  profit_margin: number
  completed_orders: number
  processing_orders: number
  pending_orders: number
  cancelled_orders: number
}

export default function AdminAnalyticsPage() {
  const [kpi, setKpi] = useState<KPIData | null>(null)
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [industryDist, setIndustryDist] = useState<any[]>([])
  const [cityDist, setCityDist] = useState<any[]>([])
  const [mediaPerf, setMediaPerf] = useState<any[]>([])
  const [topMedia, setTopMedia] = useState<any[]>([])
  const [supplierPerf, setSupplierPerf] = useState<any[]>([])
  const [conversionRates, setConversionRates] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month')

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) {
        setKpi(data.data.kpi)
        setRevenueTrend(data.data.revenueTrend || [])
        setIndustryDist(data.data.industryDistribution || [])
        setCityDist(data.data.cityDistribution || [])
        setMediaPerf(data.data.mediaPerformance || [])
        setTopMedia(data.data.topMedia || [])
        setSupplierPerf(data.data.supplierPerformance || [])
        setConversionRates(data.data.conversionRates || {})
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [timeframe])

  useEffect(() => { fetchData() }, [fetchData])

  const kpiCards = kpi ? [
    { label: '总收入', value: `¥${(kpi.total_revenue || 0).toLocaleString()}`, change: `${kpi.total_orders || 0}单`, color: 'text-green-600', bg: 'bg-green-50', icon: DollarSign },
    { label: '净收入', value: `¥${(kpi.net_income || 0).toLocaleString()}`, change: `利润率 ${kpi.profit_margin || 0}%`, color: 'text-blue-600', bg: 'bg-blue-50', icon: TrendingUp },
    { label: '活跃客户', value: kpi.active_customers || 0, change: `广告主 ${kpi.active_advertisers || 0}`, color: 'text-purple-600', bg: 'bg-purple-50', icon: Users },
    { label: '媒体资源', value: kpi.active_media || 0, change: `${kpi.cities_covered || 0}个城市`, color: 'text-orange-600', bg: 'bg-orange-50', icon: Monitor },
    { label: '总用户', value: kpi.total_users || 0, change: `供应商 ${kpi.active_suppliers || 0}`, color: 'text-teal-600', bg: 'bg-teal-50', icon: Users },
    { label: '平均订单', value: `¥${(kpi.avg_order_value || 0).toLocaleString()}`, change: '每单均价', color: 'text-rose-600', bg: 'bg-rose-50', icon: ShoppingBag },
  ] : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据分析</h1>
          <p className="text-gray-500">全面的业务数据分析和可视化</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(t => (
            <button key={t} onClick={() => setTimeframe(t)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                timeframe === t ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}>{t === 'week' ? '周' : t === 'month' ? '月' : t === 'quarter' ? '季度' : '年'}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {kpiCards.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`${card.bg} rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                  <span className="text-xs text-gray-400">{card.change}</span>
                </div>
                <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
                <div className="text-xs text-gray-500 mt-1">{card.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Revenue Trend */}
            <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" /> 收入趋势
              </h3>
              {revenueTrend.length > 0 ? (
                <div className="space-y-2">
                  {revenueTrend.slice(-10).reverse().map((day: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24">{day.date}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center px-2">
                          <div className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full h-full"
                            style={{ width: `${Math.min(100, (day.daily_revenue || 0) / Math.max(...revenueTrend.map(d => d.daily_revenue || 0)) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-24 text-right">
                        ¥{(day.daily_revenue || 0).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 w-12 text-right">{day.daily_orders || 0}单</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">暂无收入趋势数据</p>
              )}
            </div>

            {/* Conversion Rates */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" /> 转化率
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">注册→下单</span>
                    <span className="font-semibold">{conversionRates.registration_to_order || 0}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Number(conversionRates.registration_to_order || 0))}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">复购率</span>
                    <span className="font-semibold">{conversionRates.repeat_purchase_rate || 0}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Number(conversionRates.repeat_purchase_rate || 0))}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-600 mb-3">订单状态</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">已完成</span>
                    <span className="font-medium text-green-600">{kpi?.completed_orders || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">处理中</span>
                    <span className="font-medium text-blue-600">{kpi?.processing_orders || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">待支付</span>
                    <span className="font-medium text-yellow-600">{kpi?.pending_orders || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">已取消</span>
                    <span className="font-medium text-red-600">{kpi?.cancelled_orders || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Industry Distribution */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> 行业分布
              </h3>
              {industryDist.length > 0 ? (
                <div className="space-y-3">
                  {industryDist.map((ind: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{ind.industry}</span>
                        <span className="font-semibold text-gray-900">¥{(ind.total_revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div className={cn('h-full rounded-full', ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'][i % 5])}
                          style={{ width: `${Math.min(100, (ind.total_revenue || 0) / Math.max(...industryDist.map(d => d.total_revenue || 0)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">暂无行业数据</p>}
            </div>

            {/* Media Performance */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-orange-500" /> 媒体类型表现
              </h3>
              {mediaPerf.length > 0 ? (
                <div className="space-y-3">
                  {mediaPerf.map((mp: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-sm text-gray-900">{mp.media_type || '未分类'}</div>
                        <div className="text-xs text-gray-400">{mp.order_count || 0}单 · {mp.item_count || 0}件</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">¥{(mp.total_revenue || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">均价 ¥{Number(mp.avg_price || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">暂无媒体数据</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Top Media */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> 热门媒体资源
              </h3>
              {topMedia.length > 0 ? (
                <div className="space-y-2">
                  {topMedia.map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 w-5">#{i + 1}</span>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{m.name}</div>
                          <div className="text-xs text-gray-400">{m.city} · {m.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">¥{(m.total_revenue || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{m.order_count || 0}单</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">暂无热门媒体</p>}
            </div>

            {/* Supplier Performance */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-500" /> 供应商表现
              </h3>
              {supplierPerf.length > 0 ? (
                <div className="space-y-2">
                  {supplierPerf.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 w-5">#{i + 1}</span>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{s.company_name}</div>
                          <div className="text-xs text-gray-400">{s.media_count || 0}个媒体</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">¥{(s.total_revenue || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{s.order_item_count || 0}件</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">暂无供应商数据</p>}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
