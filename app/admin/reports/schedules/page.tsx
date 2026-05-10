// @ts-nocheck
// app/admin/reports/schedules/page.tsx - 报表调度页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Plus, X, Calendar, Clock, RefreshCw, Trash2,
  Loader2, ToggleLeft, ToggleRight,
  BarChart3, Users, Monitor, DollarSign, TrendingUp, Search, Bell
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

const FREQUENCIES = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'quarterly', label: '每季度' },
]

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF' },
]

const FREQ_LABELS = {
  daily: '每日',
  weekly: '每周',
  monthly: '每月',
  quarterly: '每季度',
}

const TYPE_LABELS = {
  dashboard: '仪表盘概览',
  user_behavior: '用户行为分析',
  media_performance: '媒体表现',
  revenue_trends: '收入趋势',
  recommendation_effectiveness: '推荐效果',
}

export default function SchedulePage() {
  const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token") || ""

  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ title: '', type: 'dashboard', frequency: 'daily', format: 'csv', time: '08:00' })
  const [creating, setCreating] = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch('/api/reports/schedules?' + params.toString(), { headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error('获取失败')
      const data = await res.json()
      setSchedules(data.schedules || data.data || [])
    } catch (err) {
      console.error('获取调度列表失败:', err)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  const handleCreateSchedule = async () => {
    if (!formData.title.trim()) { alert('请输入调度标题'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/reports/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('创建失败')
      setShowCreateModal(false)
      setFormData({ title: '', type: 'dashboard', frequency: 'daily', format: 'csv', time: '08:00' })
      fetchSchedules()
    } catch (err) {
      console.error('创建调度失败:', err)
      alert('创建调度失败，请重试')
    } finally { setCreating(false) }
  }

  const handleToggleSchedule = async (schedule) => {
    try {
      const res = await fetch('/api/reports/schedules/' + schedule.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ active: !schedule.active }),
      })
      if (!res.ok) throw new Error('更新失败')
      fetchSchedules()
    } catch (err) { console.error('更新调度失败:', err) }
  }

  const handleDeleteSchedule = async (id) => {
    if (!confirm('确定要删除该调度吗？')) return
    try {
      const res = await fetch('/api/reports/schedules/' + id, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      if (!res.ok) throw new Error('删除失败')
      fetchSchedules()
    } catch (err) {
      console.error('删除调度失败:', err)
      alert('删除调度失败，请重试')
    }
  }

  const getTypeIcon = (type) => {
    const found = REPORT_TYPES.find(t => t.value === type)
    const Icon = found?.icon || FileText
    return <Icon className="w-4 h-4" />
  }

  const getFrequencyBadgeClass = (freq) => {
    const map = {
      daily: 'bg-purple-100 text-purple-700',
      weekly: 'bg-blue-100 text-blue-700',
      monthly: 'bg-green-100 text-green-700',
      quarterly: 'bg-orange-100 text-orange-700',
    }
    return map[freq] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const pad = (n) => String(n).padStart(2, '0')
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报表调度</h1>
          <p className="mt-1 text-sm text-gray-500">设置定期报表任务，自动生成并发送报表</p>
        </div>
        <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />} onClick={() => setShowCreateModal(true)}>
          创建调度
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="搜索调度标题..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchSchedules()}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
        </div>
        <button onClick={fetchSchedules}
          className="p-2.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors" title="刷新">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-gray-400">加载中...</span>
            </div>
          </Card>
        ) : schedules.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center gap-3">
              <Calendar className="w-12 h-12 text-gray-300" />
              <span className="text-sm text-gray-400">暂无调度任务</span>
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
                创建第一个调度
              </Button>
            </div>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="overflow-hidden" hoverable>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(schedule.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{schedule.title}</h3>
                        <span className={'text-xs font-medium px-2.5 py-0.5 rounded-full ' + getFrequencyBadgeClass(schedule.frequency)}>
                          {FREQ_LABELS[schedule.frequency] || schedule.frequency}
                        </span>
                        <span className="text-xs font-mono uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {schedule.format || 'csv'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{TYPE_LABELS[schedule.type] || schedule.type}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          执行时间: {schedule.time}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-gray-400" />
                          下次运行: {formatDate(schedule.nextRun)}
                        </div>
                        {schedule.lastRun && (
                          <div className="flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                            上次运行: {formatDate(schedule.lastRun)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => handleToggleSchedule(schedule)}
                      className={'p-2 rounded-lg transition-colors ' + (schedule.active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100')}
                      title={schedule.active ? '停用调度' : '启用调度'}>
                      {schedule.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button onClick={() => handleDeleteSchedule(schedule.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="删除调度">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className={'h-1 ' + (schedule.active ? 'bg-primary' : 'bg-gray-200')} />
            </Card>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">创建报表调度</h2>
                <p className="mt-1 text-sm text-gray-500">设置定期自动生成报表任务</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">调度标题</label>
                <Input placeholder="请输入调度标题" value={formData.title}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">执行频率</label>
                <div className="flex gap-2">
                  {FREQUENCIES.map(freq => (
                    <button key={freq.value} onClick={() => setFormData(prev => ({ ...prev, frequency: freq.value }))}
                      className={'flex-1 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ' +
                        (formData.frequency === freq.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50')}>
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">执行时间</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input type="time" value={formData.time}
                    onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
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
                leftIcon={creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                onClick={handleCreateSchedule} disabled={creating}>
                {creating ? '创建中...' : '创建调度'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
