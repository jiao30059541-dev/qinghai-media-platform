// app/admin/suppliers/page.tsx - 管理员供应商审核管理
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, XCircle, Clock, Search, Filter, 
  Brain, ThumbsUp, ThumbsDown, HelpCircle, 
  ExternalLink, ChevronLeft, ChevronRight,
  Building2, Phone, Mail, MapPin, FileText, Star
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface Application {
  id: number
  company_name: string
  contact_name: string
  phone: string
  email: string
  city: string
  media_type: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  ai_score: number
  ai_analysis: string
  ai_decision: 'recommend_approve' | 'recommend_reject' | 'uncertain'
  reviewed_by: number | null
  reviewer_name: string | null
  reviewed_at: string | null
  review_notes: string | null
  created_at: string
}

export default function AdminSuppliersPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filter !== 'all') params.set('status', filter)
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/suppliers?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
      })
      const data = await res.json()
      if (data.success) {
        setApplications(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (err) {
      console.error('Failed to fetch', err)
    } finally {
      setLoading(false)
    }
  }, [filter, page])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleReview = async (id: number, action: 'approved' | 'rejected') => {
    setReviewing(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/admin/suppliers/${id}/review`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notes: reviewNotes })
      })
      const data = await res.json()
      if (data.success) {
        setSelectedApp(null)
        setReviewNotes('')
        fetchApplications()
      } else {
        alert(data.message)
      }
    } catch (err) {
      alert('操作失败')
    } finally {
      setReviewing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'recommend_approve': return <ThumbsUp className="w-5 h-5 text-green-600" />
      case 'recommend_reject': return <ThumbsDown className="w-5 h-5 text-red-600" />
      default: return <HelpCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getDecisionLabel = (decision: string) => {
    switch (decision) {
      case 'recommend_approve': return '建议通过'
      case 'recommend_reject': return '建议拒绝'
      default: return '需人工审核'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">供应商审核管理</h1>
        <p className="text-gray-500">管理供应商入驻申请，AI智能评分辅助决策</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: '待审核', value: applications.filter(a => a.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: '已通过', value: applications.filter(a => a.status === 'approved').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '已拒绝', value: applications.filter(a => a.status === 'rejected').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'AI建议通过', value: applications.filter(a => a.ai_decision === 'recommend_approve').length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}>
            {f === 'all' ? '全部' : f === 'pending' ? '待审核' : f === 'approved' ? '已通过' : '已拒绝'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">企业名称</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">联系人</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">手机号</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-500">城市</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-500">AI评分</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-500">AI建议</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-500">状态</th>
                <th className="text-center py-4 px-6 text-sm font-semibold text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-20 text-gray-400">加载中...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-20 text-gray-400">暂无数据</td></tr>
              ) : applications.map(app => (
                <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{app.company_name}</div>
                    <div className="text-xs text-gray-400">{app.media_type || '-'}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{app.contact_name}</td>
                  <td className="py-4 px-6 text-gray-600">{app.phone}</td>
                  <td className="py-4 px-6 text-gray-600">{app.city || '-'}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={cn("inline-flex px-3 py-1 rounded-full text-sm font-bold border", getScoreColor(app.ai_score))}>
                      {app.ai_score}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1.5">
                      {getDecisionIcon(app.ai_decision)}
                      <span className="text-xs text-gray-500">{getDecisionLabel(app.ai_decision)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {app.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" /> 待审核
                      </span>
                    ) : app.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> 已通过
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" /> 已拒绝
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setSelectedApp(app)}>
                      查看详情
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-400">第 {page}/{totalPages} 页</span>
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
        {selectedApp && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedApp.company_name}</h2>
                    <p className="text-gray-500">申请编号：{selectedApp.id}</p>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                {/* AI Score */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 font-semibold text-gray-700">
                      <Brain className="w-5 h-5 text-purple-600" /> AI智能评估
                    </span>
                    <div className="flex items-center gap-3">
                      {getDecisionIcon(selectedApp.ai_decision)}
                      <span className={cn(
                        "text-2xl font-bold",
                        selectedApp.ai_score >= 70 ? "text-green-600" : selectedApp.ai_score >= 40 ? "text-yellow-600" : "text-red-600"
                      )}>{selectedApp.ai_score}/100</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className={cn(
                      "h-full rounded-full",
                      selectedApp.ai_score >= 70 ? "bg-green-500" : selectedApp.ai_score >= 40 ? "bg-yellow-500" : "bg-red-500"
                    )} style={{ width: `${selectedApp.ai_score}%` }} />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">AI建议：</span>
                    <span className={cn(
                      selectedApp.ai_decision === 'recommend_approve' ? 'text-green-600' :
                      selectedApp.ai_decision === 'recommend_reject' ? 'text-red-600' : 'text-yellow-600'
                    )}>{getDecisionLabel(selectedApp.ai_decision)}</span>
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedApp.ai_analysis && (
                  <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> AI分析报告
                    </h4>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">{selectedApp.ai_analysis}</pre>
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Building2 className="w-4 h-4" /> 企业名称
                    </div>
                    <div className="font-medium text-gray-900">{selectedApp.company_name}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Phone className="w-4 h-4" /> 联系电话
                    </div>
                    <div className="font-medium text-gray-900">{selectedApp.phone}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Mail className="w-4 h-4" /> 邮箱
                    </div>
                    <div className="font-medium text-gray-900">{selectedApp.email || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <MapPin className="w-4 h-4" /> 所在城市
                    </div>
                    <div className="font-medium text-gray-900">{selectedApp.city || '-'}</div>
                  </div>
                </div>

                {/* Media Type & Description */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">媒体资源类型</div>
                    <div className="font-medium text-gray-900">{selectedApp.media_type || '未填写'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-500 mb-1">资源描述</div>
                    <div className="text-gray-700 text-sm leading-relaxed">{selectedApp.description || '未填写'}</div>
                  </div>
                </div>

                {/* Review Form */}
                {selectedApp.status === 'pending' && (
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-semibold text-gray-700 mb-3">审核操作</h4>
                    <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)}
                      placeholder="审核意见（可选）" rows={3}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4 text-sm" />
                    <div className="flex gap-3">
                      <Button onClick={() => handleReview(selectedApp.id, 'approved')} disabled={reviewing}
                        variant="primary" className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3">
                        {reviewing ? '处理中...' : '✅ 审核通过'}
                      </Button>
                      <Button onClick={() => handleReview(selectedApp.id, 'rejected')} disabled={reviewing}
                        variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-2xl py-3">
                        ❌ 拒绝申请
                      </Button>
                    </div>
                  </div>
                )}

                {selectedApp.status !== 'pending' && (
                  <div className="border-t border-gray-100 pt-4 text-sm text-gray-400 text-center">
                    已于 {selectedApp.reviewed_at ? new Date(selectedApp.reviewed_at).toLocaleString('zh-CN') : '-'} 完成审核
                    {selectedApp.review_notes && <p className="mt-1">审核意见：{selectedApp.review_notes}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}