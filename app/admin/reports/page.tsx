// @ts-nocheck
// app/admin/reports/page.tsx - 报表管理页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Download, Calendar, Clock, RefreshCw, Trash2, Plus,
  X, ChevronLeft, ChevronRight,
  BarChart3, Users, Monitor, DollarSign, TrendingUp, Search,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

const REPORT_TYPES = [
  { value: 'dashboard', label: '仪表盘概览', icon: BarChart3 },
  { value: 'user_behavior', label: '用户行为分析', icon: Users },
  { value: 'media_performance', label: '媒体表现', icon: Monitor },
  { value: 'revenue_trends', label: '收入趋势', icon: DollarSign },
  { value: 'recommendation_effectiveness', label: '推荐效果', icon: TrendingUp },
]

const TIME_RANGES = [
  { value: '7d', label: '最近7天' },
  { value: '30d', label: '最近30天' },
  { value: '90d', label: '最近90天' },
  { value: '1y', label: '最近一年' },
]

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
]

const PAGE_SIZE = 10

const STATUS_CONFIG = {
  pending: { label: '待处理', color: 'text-yellow-800', bg: 'bg-yellow-100', dot: 'bg-yellow-400' },
  generating: { label: '生成中', color: 'text-blue-800', bg: 'bg-blue-100', dot: 'bg-blue-400' },
  completed: { label: '已完成', color: 'text-green-800', bg: 'bg-green-100', dot: 'bg-green-400' },
  failed: { label: '失败', color: 'text-red-800', bg: 'bg-red-100', dot: 'bg-red-400' },
}

const TYPE_LABELS = {
  dashboard: '仪表盘概览',
  user_behavior: '用户行为分析',
  media_performance: '媒体表现',
  revenue_trends: '收入趋势',
  recommendation_effectiveness: '推荐效果',
}

const TIME_RANGE_LABELS = {
  '7d': '最近7天',
  '30d': '最近30天',
  '90d': '最近90天',
  '1y': '最近一年',
}

export default function ReportsPage() {
  const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token") || ""

  const [reports, setReports] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ title: '', type: 'dashboard', timeRange: '30d', format: 'csv' })
  const [creating, setCreating] = useState(false)

  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch('/api/reports?' + params.toString(), { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error('获取失败')
      const data = await res.json()
      setReports(data.reports || data.data || [])
      setPagination(data.pagination || {
        total: data.total || 0,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil((data.total || 0) / PAGE_SIZE) || 1,
      })
    } catch (err) {
      console.error('获取报表列表失败:', err)
      setReports([])
      setPagination(prev => ({ ...prev, page, totalPages: 1 }))
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => { fetchReports(1) }, [fetchReports])

  const handleCreateReport = async () => {
    if (!formData.title.trim()) { alert('请输入报表标题'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('创建失败')
      setShowCreateModal(false)
      setFormData({ title: '', type: 'dashboard', timeRange: '30d', format: 'csv' })
      fetchReports(pagination.page)
    } catch (err) {
      console.error('创建报表失败:', err)
      alert('创建报表失败，请重试')
    } finally { setCreating(false) }
  }

  const handleDeleteReport = async (id: number) => {
    if (!confirm('确定要删除该报表吗？')) return
    try {
      const res = await fetch('/api/reports/' + id, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error('删除失败')
      fetchReports(pagination.page)
    } catch (err) {
      console.error('删除报表失败:', err)
      alert('删除报表失败，请重试')
    }
  }

  const handleDownloadReport = async (report: any) => {
    if (report.status !== 'completed') return
    if (report.fileUrl) { window.open(report.fileUrl, '_blank'); return }
    try {
      const res = await fetch('/api/reports/' + report.id + '/download', { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error('下载失败')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = report.title + '.' + (report.format || 'csv')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) { console.error('下载报表失败:', err) }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const pad = (n: number) => String(n).padStart(2, '0')
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  }

  const getTypeIcon = (type) => {
    const found = REPORT_TYPES.find(t => t.value === type)
    const Icon = found?.icon || FileText
    return <Icon className="w-4 h-4" />
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return
    fetchReports(page)
  }

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null
    const pages = []
    const total = pagination.totalPages
    const current = pagination.page
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex items-center text-sm text-gray-500">
          共 {pagination.total} 条记录，第 {pagination.page}/{pagination.totalPages} 页
        </div>
        <nav className="flex items-center space-x-1">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pages.map((p, idx) =>
            typeof p === 'string' ? (
              <span key={'e' + idx} className="px-2 text-gray-400">...</span>
            ) : (
              <button key={p} onClick={() => handlePageChange(p)}
                className={'w-8 h-8 rounded-lg text-sm font-medium transition-colors ' + (p === pagination.page ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100')}>
                {p}
              </button>
            )
          )}
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表管理</h1>
          <p className="mt-1 text-sm text-gray-500">管理和生成数据报表，支持 CSV / JSON / PDF 格式导出</p>
        </div>
        <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />} onClick={() => setShowCreateModal(true)}>
          生成新报表
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="搜索报表标题..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchReports(1)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
        </div>
        <button onClick={() => fetchReports(pagination.page)}
          className="p-2.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors" title="刷新">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">标题</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">报表类型</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">时间范围</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">格式</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">生成时间</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-sm text-gray-400">加载中...</span>
                  </div>
                </td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="w-12 h-12 text-gray-300" />
                    <span className="text-sm text-gray-400">暂无报表数据</span>
                    <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
                      创建第一个报表
                    </Button>
                  </div>
                </td></tr>
              ) : (
                reports.map((report) => {
                  const st = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getTypeIcon(report.type)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{report.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{TYPE_LABELS[report.type] || report.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {TIME_RANGE_LABELS[report.timeRange] || report.timeRange}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {report.format || 'csv'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ' + st.bg + ' ' + st.color}>
                          <span className={'w-1.5 h-1.5 rounded-full ' + st.dot} />
                          {st.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(report.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {report.status === 'completed' && (
                            <button onClick={() => handleDownloadReport(report)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="下载报表">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDeleteReport(report.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="删除报表">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">生成新报表</h2>
                <p className="mt-1 text-sm text-gray-500">选择报表类型和时间范围</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">报表标题</label>
                <Input placeholder="请输入报表标题" value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">报表类型</label>
                <div className="grid grid-cols-2 gap-2">
                  {REPORT_TYPES.map(type => {
                    const Icon = type.icon
                    const isSelected = formData.type === type.value
                    return (
                      <button key={type.value} onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={'flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ' +
                          (isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50')}>
                        <Icon className={'w-4 h-4 ' + (isSelected ? 'text-primary' : 'text-gray-400')} />
                        {type.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">时间范围</label>
                <div className="flex gap-2">
                  {TIME_RANGES.map(range => (
                    <button key={range.value} onClick={() => setFormData(prev => ({ ...prev, timeRange: range.value }))}
                      className={'flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ' +
                        (formData.timeRange === range.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50')}>
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">导出格式</label>
                <div className="flex gap-2">
                  {EXPORT_FORMATS.map(fmt => (
                    <button key={fmt.value} onClick={() => setFormData(prev => ({ ...prev, format: fmt.value }))}
                      className={'flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ' +
                        (formData.format === fmt.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50')}>
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-8 py-4 bg-gray-50/50 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>取消</Button>
              <Button variant="primary"
                leftIcon={creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                onClick={handleCreateReport} disabled={creating}>
                {creating ? '创建中...' : '生成报表'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
