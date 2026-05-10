// app/admin/ab-tests/page.tsx - A/B测试列表页
'use client'

import { useState, useEffect } from 'react'
import {
  Target, Plus, Play, Square, Trash2, Eye, ChevronRight,
  FlaskConical, BarChart3, X, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ABTest {
  id: string
  name: string
  description: string
  type: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled'
  hypothesis: string
  min_sample_size: number
  confidence_level: number
  variants: any[]
  created_at: string
  updated_at: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: 'text-gray-700', bg: 'bg-gray-100' },
  running: { label: '运行中', color: 'text-green-700', bg: 'bg-green-100' },
  paused: { label: '已暂停', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  completed: { label: '已完成', color: 'text-blue-700', bg: 'bg-blue-100' },
  cancelled: { label: '已取消', color: 'text-red-700', bg: 'bg-red-100' },
}

const testTypes = [
  { value: 'split_url', label: 'URL分流测试' },
  { value: 'multivariate', label: '多变量测试' },
]

export default function ABTestsListPage() {
  const getToken = () => localStorage.getItem("adminToken") || localStorage.getItem("token") || ""

  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'split_url',
    hypothesis: '',
    min_sample_size: 1000,
    confidence_level: 0.95,
    variants: [{ name: '对照组', type: 'control', traffic_weight: 50 }, { name: '实验组', type: 'treatment', traffic_weight: 50 }],
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/ab-tests', { headers: { Authorization: `Bearer ${getToken()}` } })
      if (res.ok) {
        const data = await res.json()
        setTests(Array.isArray(data) ? data : data.tests || [])
      }
    } catch (e) {
      console.error('Failed to fetch A/B tests', e)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, action: string) => {
    try {
      const res = await fetch('/api/ab-tests/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        fetchTests()
      }
    } catch (e) {
      console.error('Failed to update test status', e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此A/B测试吗？此操作不可撤销。')) return
    try {
      const res = await fetch('/api/ab-tests/' + id, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
      if (res.ok) {
        fetchTests()
      }
    } catch (e) {
      console.error('Failed to delete test', e)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowModal(false)
        setFormData({
          name: '', description: '', type: 'split_url', hypothesis: '',
          min_sample_size: 1000, confidence_level: 0.95,
          variants: [{ name: '对照组', type: 'control', traffic_weight: 50 }, { name: '实验组', type: 'treatment', traffic_weight: 50 }],
        })
        fetchTests()
      }
    } catch (e) {
      console.error('Failed to create test', e)
    } finally {
      setSubmitting(false)
    }
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', type: 'treatment', traffic_weight: 0 }],
    }))
  }

  const removeVariant = (idx: number) => {
    if (formData.variants.length <= 2) return
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }))
  }

  const updateVariant = (idx: number, field: string, value: any) => {
    setFormData(prev => {
      const variants = [...prev.variants]
      variants[idx] = { ...variants[idx], [field]: value }
      return { ...prev, variants }
    })
  }

  const getActionButtons = (test: ABTest) => {
    switch (test.status) {
      case 'draft':
        return (
          <button onClick={() => handleStatusChange(test.id, 'start')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
            <Play className="w-3.5 h-3.5 mr-1" />启动
          </button>
        )
      case 'running':
        return (
          <button onClick={() => handleStatusChange(test.id, 'pause')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
            <Square className="w-3.5 h-3.5 mr-1" />暂停
          </button>
        )
      case 'paused':
        return (
          <button onClick={() => handleStatusChange(test.id, 'resume')}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
            <Play className="w-3.5 h-3.5 mr-1" />恢复
          </button>
        )
      default:
        return null
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">A/B测试管理</h2>
          <p className="mt-1 text-sm text-gray-500">管理和分析A/B测试实验</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />创建新测试
        </button>
      </div>

      {/* 测试统计概览 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: '全部测试', value: tests.length, color: 'bg-blue-500' },
          { label: '运行中', value: tests.filter(t => t.status === 'running').length, color: 'bg-green-500' },
          { label: '已暂停', value: tests.filter(t => t.status === 'paused').length, color: 'bg-yellow-500' },
          { label: '已完成', value: tests.filter(t => t.status === 'completed').length, color: 'bg-blue-500' },
          { label: '草稿', value: tests.filter(t => t.status === 'draft').length, color: 'bg-gray-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={cn("w-2.5 h-2.5 rounded-full", stat.color)} />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* 测试列表 */}
      {tests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Target className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">暂无A/B测试</h3>
          <p className="mt-2 text-sm text-gray-500">创建您的第一个A/B测试来开始优化</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />创建新测试
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tests.map(test => (
            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{test.name}</h3>
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      statusConfig[test.status].bg, statusConfig[test.status].color
                    )}>
                      {statusConfig[test.status].label}
                    </span>
                  </div>
                  {test.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{test.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                    <span className="inline-flex items-center">
                      <FlaskConical className="w-3.5 h-3.5 mr-1" />
                      {testTypes.find(t => t.value === test.type)?.label || test.type}
                    </span>
                    <span className="inline-flex items-center">
                      <BarChart3 className="w-3.5 h-3.5 mr-1" />
                      {test.variants?.length || 0} 个变体
                    </span>
                    <span>{formatDate(test.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {getActionButtons(test)}
                  <a
                    href={'/admin/ab-tests/' + test.id}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />查看
                  </a>
                  {(test.status === 'draft' || test.status === 'completed' || test.status === 'cancelled') && (
                    <button onClick={() => handleDelete(test.id)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 mr-1" />删除
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 创建测试模态框 */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            <div className="relative inline-block bg-white rounded-2xl shadow-xl text-left overflow-hidden transform transition-all sm:max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">创建新A/B测试</h3>
                <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">测试名称 *</label>
                    <input type="text" required value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="例如：首页Banner点击率优化" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea rows={2} value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="测试目的和预期效果" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">测试类型</label>
                    <select value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      {testTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">置信水平</label>
                    <select value={formData.confidence_level}
                      onChange={e => setFormData({...formData, confidence_level: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value={0.9}>90%</option>
                      <option value={0.95}>95%</option>
                      <option value={0.99}>99%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最小样本量</label>
                    <input type="number" min={100} value={formData.min_sample_size}
                      onChange={e => setFormData({...formData, min_sample_size: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">假设</label>
                    <textarea rows={2} value={formData.hypothesis}
                      onChange={e => setFormData({...formData, hypothesis: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="例如：新设计的Banner点击率将比旧版提高15%" />
                  </div>
                </div>

                {/* 变体配置 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">变体配置</label>
                    <button type="button" onClick={addVariant}
                      className="inline-flex items-center text-xs text-primary hover:text-primary/80 font-medium">
                      <Plus className="w-3.5 h-3.5 mr-1" />添加变体
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.variants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input type="text" placeholder="变体名称" value={v.name}
                          onChange={e => updateVariant(idx, 'name', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        <select value={v.type}
                          onChange={e => updateVariant(idx, 'type', e.target.value)}
                          className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary">
                          <option value="control">对照组</option>
                          <option value="treatment">实验组</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <input type="number" min={0} max={100} value={v.traffic_weight}
                            onChange={e => updateVariant(idx, 'traffic_weight', parseInt(e.target.value))}
                            className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                          <span className="text-xs text-gray-400">%</span>
                        </div>
                        {formData.variants.length > 2 && (
                          <button type="button" onClick={() => removeVariant(idx)}
                            className="p-1 text-gray-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    取消
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 inline-flex items-center">
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    创建测试
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
