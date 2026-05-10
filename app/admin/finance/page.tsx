// app/admin/finance/page.tsx - 财务管理页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, Search, ChevronLeft, ChevronRight, Filter,
  TrendingUp, TrendingDown, Calendar, Download,
  CheckCircle, XCircle, Clock, AlertCircle, ArrowUpRight, ArrowDownRight,
  CreditCard, Receipt, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface FinanceRecord {
  id: number
  user_id: number
  user_name: string
  user_company: string
  order_id: number | null
  amount: number
  type: string
  status: string
  description: string
  payment_method: string
  transaction_id: string
  notes: string
  created_at: string
}

export default function AdminFinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<any>({})
  const [selectedRecord, setSelectedRecord] = useState<FinanceRecord | null>(null)
  const [timeframe, setTimeframe] = useState('month')
  const [dashData, setDashData] = useState<any>(null)

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filterType !== 'all') params.set('type', filterType)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      const res = await fetch(`/api/admin/finance?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) {
        setRecords(data.data.records || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
        setTotal(data.data.pagination?.total || 0)
        setStats(data.data.stats || {})
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [filterType, filterStatus, page])

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ timeframe })
      })
      const data = await res.json()
      if (data.success) setDashData(data.data)
    } catch (err) { console.error(err) }
  }, [timeframe])

  useEffect(() => { fetchRecords() }, [fetchRecords])
  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">财务管理</h1>
        <p className="text-gray-500">管理平台收入、支出和财务记录</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: '总收入', value: stats.total_income ? `¥${Number(stats.total_income).toLocaleString()}` : '¥0', color: 'text-green-600', bg: 'bg-green-50' },
          { label: '总支出', value: stats.total_expense ? `¥${Number(stats.total_expense).toLocaleString()}` : '¥0', color: 'text-red-600', bg: 'bg-red-50' },
          { label: '净收入', value: stats.net_income ? `¥${Number(stats.net_income).toLocaleString()}` : '¥0', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '已支付', value: stats.total_paid ? `¥${Number(stats.total_paid).toLocaleString()}` : '¥0', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select value={timeframe} onChange={e => setTimeframe(e.target.value)}
          className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white">
          <option value="week">最近7天</option>
          <option value="month">最近30天</option>
          <option value="quarter">最近90天</option>
          <option value="year">最近365天</option>
        </select>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
          className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white">
          <option value="all">全部类型</option>
          <option value="income">收入</option>
          <option value="expense">支出</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white">
          <option value="all">全部状态</option>
          <option value="paid">已支付</option>
          <option value="unpaid">未支付</option>
          <option value="pending">待处理</option>
        </select>
        <div className="ml-auto text-sm text-gray-400">共 {total} 条记录</div>
      </div>

      {/* Dashboard Cards */}
      {dashData && dashData.kpi && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">净收入</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">¥{Number(dashData.kpi.net_income || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">利润率: {dashData.kpi.profit_margin || 0}%</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">交易次数</span>
              <Receipt className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{dashData.kpi.total_transactions || 0}</div>
            <div className="text-xs text-gray-400 mt-1">付费用户: {dashData.kpi.paying_customers || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">平均交易额</span>
              <DollarSign className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">¥{Number(dashData.kpi.avg_income_per_transaction || 0).toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">用户</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-500">金额</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">类型</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">描述</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">支付方式</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">状态</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">时间</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-20 text-gray-400">加载中...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-20 text-gray-400">暂无数据</td></tr>
              ) : records.map(rec => (
                <tr key={rec.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{rec.user_name || '-'}</div>
                    <div className="text-xs text-gray-400">{rec.user_company || ''}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold" dir="rtl">
                    <span className={rec.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {rec.type === 'income' ? '+' : '-'}¥{Number(rec.amount || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={cn(
                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                      rec.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    )}>{rec.type === 'income' ? '收入' : '支出'}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{rec.description || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{rec.payment_method || '-'}</td>
                  <td className="py-4 px-4 text-center">
                    {rec.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> 已支付
                      </span>
                    ) : rec.status === 'unpaid' ? (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" /> 未支付
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" /> 待处理
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">
                    {rec.created_at ? new Date(rec.created_at).toLocaleDateString('zh-CN') : '-'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setSelectedRecord(rec)}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-400">共 {total} 条，第 {page}/{totalPages} 页</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl">
                <ChevronLeft className="w-4 h-4" /> 上一页
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl">
                下一页 <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">财务详情</h2>
                    <p className="text-gray-400 text-sm">记录ID: {selectedRecord.id}</p>
                  </div>
                  <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    <span className={selectedRecord.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {selectedRecord.type === 'income' ? '+' : '-'}¥{Number(selectedRecord.amount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{selectedRecord.type === 'income' ? '收入' : '支出'}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">用户</div>
                    <div className="font-medium text-sm">{selectedRecord.user_name || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">订单号</div>
                    <div className="font-medium text-sm font-mono">{selectedRecord.order_id ? `#${selectedRecord.order_id}` : '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">支付方式</div>
                    <div className="font-medium text-sm">{selectedRecord.payment_method || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">交易号</div>
                    <div className="font-medium text-sm text-xs">{selectedRecord.transaction_id || '-'}</div>
                  </div>
                </div>

                {selectedRecord.description && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="text-xs text-gray-400 mb-1">描述</div>
                    <p className="text-sm text-gray-700">{selectedRecord.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{selectedRecord.created_at ? new Date(selectedRecord.created_at).toLocaleString('zh-CN') : '-'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
