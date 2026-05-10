// app/supplier/orders/page.tsx - 供应商订单管理
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ShoppingCart, Clock, AlertCircle, Search, MapPin, DollarSign, User, Loader2 } from 'lucide-react'

export default function SupplierOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filter) params.set('status', filter)
      const res = await fetch('/api/supplier/orders?' + params.toString(), {
        headers: { 'Authorization': 'Bearer ' + (token || '') }
      })
      const data = await res.json()
      if (data.success) { setOrders(data.data); setTotalPages(data.pagination.totalPages) }
    } catch(err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [page, filter])

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string, class: string }> = {
      pending: { label: '待处理', class: 'bg-yellow-100 text-yellow-700' },
      confirmed: { label: '已完成', class: 'bg-green-100 text-green-700' },
      cancelled: { label: '已取消', class: 'bg-red-100 text-red-700' },
      processing: { label: '进行中', class: 'bg-blue-100 text-blue-700' },
    }
    const s = map[status] || { label: status, class: 'bg-gray-100 text-gray-600' }
    return <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', s.class)}>{s.label}</span>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">我的订单</h1><p className="text-gray-500 mt-1">查看和管理你的投放订单</p></div>
      <div className="flex gap-2">
        {['', 'pending', 'confirmed', 'cancelled'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }}
            className={cn('px-4 py-2 rounded-full text-sm font-medium transition-all border',
              filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30'
            )}>{f === '' ? '全部' : f === 'pending' ? '待处理' : f === 'confirmed' ? '已完成' : '已取消'}</button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">暂无订单</h3>
          <p className="text-gray-400 text-sm mt-2">当有广告主投放你的资源时，订单将显示在这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900">{order.media_name}</h3>
                    {statusBadge(order.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {order.client_name || '未知客户'}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {order.city}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> ¥{order.quoted_price || order.total_price}</span>
                    <span className="text-xs text-gray-400">{new Date(order.order_date).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
              </div>
              {selectedOrder?.id === order.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-1">客户信息</div>
                      <div className="font-medium">{order.client_name}</div>
                      <div className="text-gray-500">{order.client_phone}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">价格信息</div>
                      <div className="font-medium">报价：¥{order.quoted_price || order.total_price}</div>
                      {order.settlement_price && <div className="text-gray-500">结算价：¥{order.settlement_price}</div>}
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">订单编号</div>
                      <div className="font-mono text-xs">#{order.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-1">下单时间</div>
                      <div>{new Date(order.order_date).toLocaleString('zh-CN')}</div>
                    </div>
                  </div>
                </motion.div>
              )}
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
