// app/supplier/media/page.tsx - 我的资源列表
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Search, Edit3, Trash2, Eye, EyeOff, MapPin, DollarSign, BarChart3, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SupplierMediaList() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('q', search)
      const res = await fetch('/api/supplier/media?' + params.toString(), {
        headers: { 'Authorization': 'Bearer ' + (token || '') }
      })
      const data = await res.json()
      if (data.success) { setMedia(data.data); setTotalPages(data.pagination.totalPages) }
    } catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMedia() }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchMedia() }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm('确定删除"' + name + '"? 此操作不可恢复。')) return
    const token = localStorage.getItem('token')
    const res = await fetch('/api/supplier/media/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + (token || '') } })
    const data = await res.json()
    if (data.success) fetchMedia(); else alert(data.message)
  }

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const canToggle = currentStatus !== 'pending'
    const token = localStorage.getItem('token')
    const res = await fetch('/api/supplier/media/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || '') },
      body: JSON.stringify({ status: newStatus })
    })
    const data = await res.json()
    if (data.success) fetchMedia()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-gray-900">我的资源</h1><p className="text-gray-500 mt-1">管理你上传的广告资源</p></div>
        <Link href="/supplier/media/new" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all font-medium">
          <Plus className="w-4 h-4" /> 上传新资源
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索资源名称、城市..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
          </div>
        </form>
        {['', 'pending', 'active', 'inactive'].map(f => (
          <button key={f} onClick={() => { setStatusFilter(f); setPage(1) }}
            className={cn('px-4 py-2 rounded-full text-sm font-medium transition-all border',
              statusFilter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30'
            )}>{f === '' ? '全部' : f === 'active' ? '已上架' : '未上架'}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : media.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">暂无资源</h3>
          <p className="text-gray-400 text-sm mb-6">上传你的第一个广告资源，开启接单之旅</p>
          <Link href="/supplier/media/new" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 font-medium">
            <Plus className="w-4 h-4" /> 立即上传
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {media.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                      item.status === 'active' ? 'bg-green-100 text-green-700' : item.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    )}>{item.status === 'pending' ? '待审核' : item.status === 'active' ? '已上架' : '未上架'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item.city}</span>
                    <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {item.category_level2 || item.category_level1 || '-'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> ¥{item.deal_price || item.list_price || 0}/天</span>
                    {item.order_count > 0 && <span className="text-primary">{item.order_count} 次投放</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => handleToggleStatus(item.id, item.status)} disabled={item.status === 'pending'}
                    className={cn('p-2 rounded-xl transition-all', item.status === 'pending' ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600')} title={item.status === 'pending' ? '审核中' : item.status === 'active' ? '下架' : '上架'}>
                    {item.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link href={'/supplier/media/' + item.id + '/edit'}
                    className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title="编辑">
                    <Edit3 className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all" title="删除">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={cn('w-10 h-10 rounded-xl text-sm font-medium transition-all',
                    page === p ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  )}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
