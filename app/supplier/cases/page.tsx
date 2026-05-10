// app/supplier/cases/page.tsx - 供应商案例管理
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, CheckCircle, Clock, XCircle, AlertCircle, Trash2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function SupplierCasesPage() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    title: '', client: '', industry: '', challenge: '', solution: '',
    results: '', metrics_label: '', metrics_value: '', metrics_change: '',
    cover_image: '', media_types: ''
  })

  const fetchCases = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch('/api/supplier/cases', { headers: { 'Authorization': 'Bearer ' + token } })
      const d = await res.json()
      if (d.success) setCases(d.data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCases() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) { setMsg('请填写案例标题'); return }
    setSubmitting(true)
    setMsg('')
    try {
      const token = localStorage.getItem('token')
      const results = form.results.split('\n').filter(Boolean)
      const metrics = form.metrics_label ? [{
        label: form.metrics_label, value: form.metrics_value, change: form.metrics_change
      }] : []
      const media_types = form.media_types.split('、').filter(Boolean)

      const res = await fetch('/api/supplier/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || '') },
        body: JSON.stringify({
          title: form.title, client: form.client, industry: form.industry,
          challenge: form.challenge, solution: form.solution,
          results, metrics, cover_image: form.cover_image, media_types
        })
      })
      const d = await res.json()
      if (d.success) {
        setMsg('案例提交成功！等待管理员审核')
        setShowForm(false)
        setForm({ title: '', client: '', industry: '', challenge: '', solution: '', results: '', metrics_label: '', metrics_value: '', metrics_change: '', cover_image: '', media_types: '' })
        fetchCases()
      } else {
        setMsg(d.message || '提交失败')
      }
    } catch { setMsg('网络错误') }
    finally { setSubmitting(false) }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string, class: string, icon: any }> = {
      approved: { label: '已通过', class: 'bg-green-100 text-green-700', icon: CheckCircle },
      pending: { label: '审核中', class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      rejected: { label: '已拒绝', class: 'bg-red-100 text-red-700', icon: XCircle },
    }
    const s = map[status] || { label: status, class: 'bg-gray-100 text-gray-600', icon: Clock }
    return <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium', s.class)}><s.icon className="w-3 h-3" />{s.label}</span>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">投放案例</h1>
          <p className="text-gray-500 mt-1">提交你的成功投放案例，展示在平台首页</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMsg('') }}
          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all font-medium">
          <Plus className="w-4 h-4" /> 提交案例
        </button>
      </div>

      {/* 提交表单 */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">提交新案例</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">案例标题 *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="例如：西宁高端餐饮品牌全城曝光" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">客户名称</label>
                <input value={form.client} onChange={e => setForm({...form, client: e.target.value})} placeholder="例如：青海味道餐饮集团" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">所属行业</label>
                <input value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} placeholder="例如：餐饮美食" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">媒体类型（、分隔）</label>
                <input value={form.media_types} onChange={e => setForm({...form, media_types: e.target.value})} placeholder="例如：LED大屏、电梯广告" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">挑战/背景</label>
              <textarea value={form.challenge} onChange={e => setForm({...form, challenge: e.target.value})} rows={2} placeholder="客户面临什么问题？" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">解决方案</label>
              <textarea value={form.solution} onChange={e => setForm({...form, solution: e.target.value})} rows={2} placeholder="如何解决的？用了哪些广告位？" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">成果（每行一个）</label>
              <textarea value={form.results} onChange={e => setForm({...form, results: e.target.value})} rows={3} placeholder="例如：&#10;品牌知名度提升300%&#10;门店客流量增加45%&#10;3个月内收回广告投资" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">封面图片URL（可选）</label>
              <input value={form.cover_image} onChange={e => setForm({...form, cover_image: e.target.value})} placeholder="https://..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">核心指标（可选）</p>
              <div className="grid md:grid-cols-3 gap-3">
                <input value={form.metrics_label} onChange={e => setForm({...form, metrics_label: e.target.value})} placeholder="指标名（如：曝光量）" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input value={form.metrics_value} onChange={e => setForm({...form, metrics_value: e.target.value})} placeholder="数值（如：850万+）" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <input value={form.metrics_change} onChange={e => setForm({...form, metrics_change: e.target.value})} placeholder="变化（如：+320%）" className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            {msg && (
              <div className={cn('px-4 py-3 rounded-2xl text-sm', msg.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600')}>{msg}</div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all">取消</button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                提交审核
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 案例列表 */}
      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">暂无案例</h3>
          <p className="text-gray-400 text-sm mt-2">提交你的成功案例，展示在平台首页吸引更多客户</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c, idx) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{c.title}</h3>
                    {statusBadge(c.status)}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{c.client} · {c.industry} · {c.media_types ? JSON.parse(c.media_types).join('、') : ''}</p>
                  {c.status === 'approved' && (
                    <Link href="/cases" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> 在首页查看
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
