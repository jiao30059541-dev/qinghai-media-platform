// app/admin/media/page.tsx - 媒体资源管理页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Search, ChevronLeft, ChevronRight, Filter,
  Clock, CheckCircle, XCircle, DollarSign, MapPin,
  Eye, Edit, Trash2, Plus, Building2, Tag, Layers,
  Star, Image, Video, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: number
  name: string
  type: string
  location: string
  city: string
  description: string
  deal_price: number
  floor_price: number
  supplier_id: number | null
  supplier_name: string
  status: string
  dimensions: string
  daily_exposure: number
  target_audience: string
  features: string
  restrictions: string
  created_at: string
  asset_count: number
  point_count: number
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCity, setFilterCity] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<any>({})
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filterType !== 'all') params.set('type', filterType)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterCity !== 'all') params.set('city', filterCity)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/media?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) {
        setMedia(data.data.media || [])
        setSuppliers(data.data.suppliers || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
        setTotal(data.data.pagination?.total || 0)
        setStats(data.data.stats || {})
      }
    } catch (err) {
      console.error('Failed to fetch', err)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterStatus, filterCity, search, page])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  const getTypeIcon = (type: string) => {
    const map: Record<string, any> = { screen: Monitor, poster: Image, video: Video, digital: Globe, outdoor: Monitor, print: Image }
    const Icon = map[type] || Monitor
    return <Icon className="w-5 h-5" />
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      screen: '电子屏', poster: '海报', video: '视频', digital: '数字媒体',
      outdoor: '户外广告', print: '印刷媒体', broadcast: '广播', other: '其他'
    }
    return map[type] || type
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> 上架</span>
    if (status === 'inactive') return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> 下架</span>
    return <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3" /> 审核中</span>
  }

  const handleBatchStatus = async (status: string) => {
    const checked = media.filter(m => (m as any)._checked)
    if (checked.length === 0) { alert('请选择媒体资源'); return }
    const res = await fetch('/api/admin/media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ mediaIds: checked.map(m => m.id), status })
    })
    const data = await res.json()
    if (data.success) { fetchMedia(); alert(data.message) }
    else alert(data.message)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">媒体资源管理</h1>
        <p className="text-gray-500">管理平台所有广告媒体资源，监控库存和上下架</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: '媒体总数', value: stats.total_media || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '上架中', value: stats.active_media || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '已下架', value: stats.inactive_media || 0, color: 'text-red-600', bg: 'bg-red-50' },
          { label: '覆盖城市', value: stats.cities_covered || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: '总价值', value: stats.total_value ? `¥${Number(stats.total_value).toLocaleString()}` : '¥0', color: 'text-orange-600', bg: 'bg-orange-50', small: true },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className={`text-2xl font-bold ${s.color} ${s.small ? 'text-lg' : ''}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="搜索媒体名称/位置..." className="pl-10 rounded-2xl" />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
          className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white">
          <option value="all">全部类型</option>
          <option value="screen">电子屏</option>
          <option value="poster">海报</option>
          <option value="video">视频</option>
          <option value="digital">数字媒体</option>
          <option value="outdoor">户外广告</option>
          <option value="print">印刷媒体</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white">
          <option value="all">全部状态</option>
          <option value="active">上架中</option>
          <option value="inactive">已下架</option>
          <option value="pending">审核中</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleBatchStatus('active')}>批量上架</Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleBatchStatus('inactive')}>批量下架</Button>
          <Button variant="primary" size="sm" className="rounded-xl bg-blue-600" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> 新增媒体
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-10 px-4 py-4"><input type="checkbox" onChange={e => setMedia(media.map(m => ({ ...m, _checked: e.target.checked })))} /></th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">媒体名称</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">类型</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">位置/城市</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">供应商</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-500">价格</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">日均曝光</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">状态</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-20 text-gray-400">加载中...</td></tr>
              ) : media.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-20 text-gray-400">暂无数据</td></tr>
              ) : media.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4"><input type="checkbox" checked={(item as any)._checked || false} onChange={e => setMedia(media.map(m => m.id === item.id ? { ...m, _checked: e.target.checked } : m))} /></td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.dimensions || '-'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 text-sm">
                      {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-600 text-sm">{item.location || '-'}</div>
                    <div className="text-xs text-gray-400">{item.city || ''}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{item.supplier_name || '-'}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-gray-900">¥{Number(item.deal_price || 0).toLocaleString()}</div>
                    {item.floor_price && <div className="text-xs text-gray-400">底价 ¥{Number(item.floor_price).toLocaleString()}</div>}
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-gray-600">{item.daily_exposure ? `${(item.daily_exposure / 10000).toFixed(1)}万` : '-'}</td>
                  <td className="py-4 px-4 text-center">{getStatusBadge(item.status)}</td>
                  <td className="py-4 px-4 text-center">
                    <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setSelectedItem(item)}>
                      <Eye className="w-4 h-4" />
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
        {selectedItem && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(selectedItem.type)}
                      <h2 className="text-xl font-bold text-gray-900">{selectedItem.name}</h2>
                    </div>
                    <p className="text-gray-400 text-sm">媒体ID: {selectedItem.id} · {getTypeLabel(selectedItem.type)}</p>
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1"><MapPin className="w-3 h-3 inline mr-1" />位置</div>
                    <div className="font-medium text-sm">{selectedItem.location || '-'}</div>
                    <div className="text-xs text-gray-400">{selectedItem.city || ''}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1"><DollarSign className="w-3 h-3 inline mr-1" />价格</div>
                    <div className="font-bold text-lg text-gray-900">¥{Number(selectedItem.deal_price || 0).toLocaleString()}</div>
                    {selectedItem.floor_price && <div className="text-xs text-gray-400">底价: ¥{Number(selectedItem.floor_price).toLocaleString()}</div>}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1"><Building2 className="w-3 h-3 inline mr-1" />供应商</div>
                    <div className="font-medium text-sm">{selectedItem.supplier_name || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1"><Layers className="w-3 h-3 inline mr-1" />尺寸</div>
                    <div className="font-medium text-sm">{selectedItem.dimensions || '-'}</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-blue-600">{selectedItem.asset_count || 0}</div>
                      <div className="text-xs text-blue-500">素材文件</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">{selectedItem.point_count || 0}</div>
                      <div className="text-xs text-blue-500">投放点位</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">{selectedItem.daily_exposure ? `${(selectedItem.daily_exposure / 10000).toFixed(1)}万` : '-'}</div>
                      <div className="text-xs text-blue-500">日均曝光</div>
                    </div>
                  </div>
                </div>

                {selectedItem.description && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">描述</div>
                    <p className="text-sm text-gray-600">{selectedItem.description}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>状态: {getStatusBadge(selectedItem.status)}</span>
                  <span>{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString('zh-CN') : ''}</span>
                </div>

                {/* 审核操作区域 — 仅 pending 状态显示 */}
                {selectedItem.status === 'pending' && (
                  <ReviewSection mediaId={selectedItem.id} mediaName={selectedItem.name} onDone={() => { setSelectedItem(null); fetchMedia() }} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── 审核子组件 ─── */
function ReviewSection({ mediaId, mediaName, onDone }: { mediaId: number; mediaName: string; onDone: () => void }) {
  const [action, setAction] = useState<'approved' | 'rejected' | ''>('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const handleSubmit = async () => {
    if (!action) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/media/${mediaId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ action, notes: action === 'rejected' ? (notes || '管理员驳回') : notes || null })
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        onDone()
      } else {
        alert(data.message || '操作失败')
      }
    } catch (e) {
      alert('网络错误')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="text-sm font-medium text-gray-700 mb-3">审核操作</div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setAction('approved')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
            action === 'approved'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          ✅ 审核通过
        </button>
        <button
          onClick={() => setAction('rejected')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${
            action === 'rejected'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          ❌ 驳回
        </button>
      </div>
      {action === 'rejected' && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="填写驳回原因（必填）"
          className="w-full border border-gray-200 rounded-xl p-3 text-sm mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
          rows={2}
        />
      )}
      {action && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
            action === 'approved'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } disabled:opacity-50`}
        >
          {submitting ? '处理中...' : action === 'approved' ? '确认审核通过' : '确认驳回'}
        </button>
      )}
    </div>
  )
}
