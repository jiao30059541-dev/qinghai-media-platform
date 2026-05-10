// app/admin/orders/page.tsx - 订单管理页面
'use client'

import { useState, useEffect, useCallback } from 'react'

interface OrderItem {
  id: number
  media_id: number
  media_name: string
  media_type: string
  media_location: string
  quantity: number
  duration: number
  quoted_price: number
  unit_price: number
  total_price: number
  settlement_price: number | null
}

interface Order {
  id: number
  order_number: string
  user_id: number
  total_price: number
  status: string
  industry: string | null
  budget: number | null
  city: string | null
  contact_info: string | null
  notes: string | null
  created_at: string
  updated_at: string
  customer_name: string | null
  customer_company: string | null
  customer_phone: string | null
  item_count: number
  actual_total: number
  items: OrderItem[]
}

interface Stats {
  total_orders: number
  total_revenue: number
  avg_order_value: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待支付', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', color: 'bg-blue-100 text-blue-800' },
  processing: { label: '处理中', color: 'bg-indigo-100 text-indigo-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' }
}

const STATUS_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待支付' },
  { value: 'confirmed', label: '已确认' },
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const INDUSTRY_OPTIONS = [
  { value: 'all', label: '全部行业' },
  { value: '旅游', label: '旅游' },
  { value: '房地产', label: '房地产' },
  { value: '金融', label: '金融' },
  { value: '教育', label: '教育' },
  { value: '医疗', label: '医疗' },
  { value: '通信', label: '通信' },
  { value: '能源', label: '能源' },
  { value: '食品', label: '食品' }
]

const CITY_OPTIONS = [
  { value: 'all', label: '全部城市' },
  { value: '西宁', label: '西宁' },
  { value: '海东', label: '海东' },
  { value: '海北', label: '海北' },
  { value: '黄南', label: '黄南' },
  { value: '海南', label: '海南' },
  { value: '果洛', label: '果洛' },
  { value: '玉树', label: '玉树' },
  { value: '海西', label: '海西' },
  { value: '全省', label: '全省覆盖' }
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [stats, setStats] = useState<Stats>({ total_orders: 0, total_revenue: 0, avg_order_value: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [authToken, setAuthToken] = useState('')

  // 获取登录token
  useEffect(() => {
    const token = localStorage.getItem('ai_ads_admin') || ''
    setAuthToken(token)
  }, [])

  const fetchOrders = useCallback(async () => {
    if (!authToken) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
        industry: industryFilter,
        city: cityFilter
      })
      if (searchTerm) params.set('search', searchTerm)

      const res = await fetch(`/api/admin/orders?${params}`, {
        headers: { 'X-Admin-Token': authToken }
      })
      const result = await res.json()
      if (result.success) {
        setOrders(result.data.orders)
        setPagination(result.data.pagination)
        setStats(result.data.stats)
      } else {
        setError(result.message || '获取数据失败')
      }
    } catch (e: any) {
      setError('网络错误: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, statusFilter, industryFilter, cityFilter, searchTerm, authToken])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': authToken },
        body: JSON.stringify({ orderId, status })
      })
      const result = await res.json()
      if (result.success) {
        fetchOrders()
      } else {
        alert('更新失败: ' + result.message)
      }
    } catch (e: any) {
      alert('网络错误: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const batchUpdateStatus = async (status: string) => {
    if (selectedOrders.length === 0) return
    if (!confirm(`确定将 ${selectedOrders.length} 个订单状态改为「${STATUS_MAP[status]?.label || status}」？`)) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': authToken },
        body: JSON.stringify({ orderIds: selectedOrders, status })
      })
      const result = await res.json()
      if (result.success) {
        setSelectedOrders([])
        fetchOrders()
      } else {
        alert('批量更新失败: ' + result.message)
      }
    } catch (e: any) {
      alert('网络错误: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedOrders(orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map(o => o.id))
    else setSelectedOrders([])
  }

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) setSelectedOrders(prev => [...prev, id])
    else setSelectedOrders(prev => prev.filter(i => i !== id))
  }

  const getStatusBadge = (status: string) => {
    const s = STATUS_MAP[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
  }

  const formatMoney = (amount: number) => `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  // 生成页码
  const renderPagination = () => {
    const { page, totalPages } = pagination
    if (totalPages <= 1) return null
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return (
      <div className="flex items-center justify-center gap-1 mt-4">
        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">上一页</button>
        {pages.map((p, i) =>
          typeof p === 'string' ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span> :
          <button key={p} onClick={() => handlePageChange(p)}
            className={`px-3 py-1.5 text-sm border rounded ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}`}>{p}</button>
        )}
        <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">下一页</button>
      </div>
    )
  }

  // 订单详情弹窗
  const renderDetailModal = () => {
    if (!detailOrder) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailOrder(null)}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">订单详情</h3>
            <button onClick={() => setDetailOrder(null)} className="p-1 hover:bg-gray-100 rounded">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">订单号</span><p className="font-medium">{detailOrder.id ? `ORD${detailOrder.id}` : '-'}</p></div>
              <div><span className="text-gray-500">状态</span><p>{getStatusBadge(detailOrder.status)}</p></div>
              <div><span className="text-gray-500">客户</span><p className="font-medium">{detailOrder.customer_name || '-'}</p></div>
              <div><span className="text-gray-500">公司</span><p>{detailOrder.customer_company || '-'}</p></div>
              <div><span className="text-gray-500">电话</span><p>{detailOrder.customer_phone || '-'}</p></div>
              <div><span className="text-gray-500">行业</span><p>{detailOrder.industry || '-'}</p></div>
              <div><span className="text-gray-500">城市</span><p>{detailOrder.city || '-'}</p></div>
              <div><span className="text-gray-500">总金额</span><p className="font-bold text-lg">{formatMoney(detailOrder.total_price)}</p></div>
              <div className="col-span-2"><span className="text-gray-500">创建时间</span><p>{formatDate(detailOrder.created_at)}</p></div>
              <div className="col-span-2"><span className="text-gray-500">备注</span><p className="text-gray-700">{detailOrder.notes || '-'}</p></div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">订单明细 ({detailOrder.items?.length || 0})</h4>
              <table className="w-full text-sm">
                <thead><tr className="border-b text-gray-500">
                  <th className="text-left py-2">资源名称</th><th className="text-right py-2">数量</th><th className="text-right py-2">时长</th><th className="text-right py-2">单价</th><th className="text-right py-2">小计</th>
                </tr></thead>
                <tbody>
                  {(detailOrder.items || []).map((item, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{item.media_name || `资源 #${item.media_id}`}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{item.duration}天</td>
                      <td className="text-right py-2">{formatMoney(item.unit_price || item.quoted_price || 0)}</td>
                      <td className="text-right py-2 font-medium">{formatMoney(item.total_price || item.quoted_price * item.quantity || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-4 flex justify-end space-x-3">
              {detailOrder.status === 'pending' && (
                <button onClick={() => { updateOrderStatus(detailOrder.id, 'confirmed'); setDetailOrder(null) }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">确认订单</button>
              )}
              {detailOrder.status === 'confirmed' && (
                <button onClick={() => { updateOrderStatus(detailOrder.id, 'processing'); setDetailOrder(null) }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">开始处理</button>
              )}
              {detailOrder.status === 'processing' && (
                <button onClick={() => { updateOrderStatus(detailOrder.id, 'completed'); setDetailOrder(null) }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">标记完成</button>
              )}
              {detailOrder.status !== 'cancelled' && detailOrder.status !== 'completed' && (
                <button onClick={() => { updateOrderStatus(detailOrder.id, 'cancelled'); setDetailOrder(null) }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">取消订单</button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">总订单数</p>
          <p className="text-2xl font-bold mt-1">{stats.total_orders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">总营收</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(stats.total_revenue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <p className="text-sm text-gray-500">平均订单额</p>
          <p className="text-2xl font-bold mt-1">{formatMoney(stats.avg_order_value)}</p>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <input type="text" placeholder="搜索订单号、客户名称、公司、电话..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onKeyDown={e => { if (e.key === 'Enter') { setPagination(prev => ({ ...prev, page: 1 })) } }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={industryFilter} onChange={e => { setIndustryFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            {INDUSTRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }}
            className="px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            {CITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">已选择 {selectedOrders.length} 个订单</span>
          <div className="flex gap-2">
            <button onClick={() => batchUpdateStatus('confirmed')} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">确认订单</button>
            <button onClick={() => batchUpdateStatus('processing')} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">开始处理</button>
            <button onClick={() => batchUpdateStatus('completed')} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">标记完成</button>
          </div>
        </div>
      )}

      {/* 订单列表 */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <p className="text-sm text-gray-500">
            共 <span className="font-medium">{pagination.total}</span> 条记录
            {!loading && orders.length > 0 && (
              <span className="text-gray-400 ml-1">（第 {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} 条）</span>
            )}
          </p>
          <button onClick={fetchOrders} disabled={loading}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50">
            {loading ? '加载中...' : '刷新'}
          </button>
        </div>

        {loading && orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-500 text-sm">加载中...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">暂无订单数据</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="w-10 px-4 py-3 text-left">
                    <input type="checkbox" onChange={e => handleSelectAll(e.target.checked)}
                      checked={selectedOrders.length > 0 && selectedOrders.length === orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}
                      className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">行业/城市</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" onChange={e => handleSelectOne(order.id, e.target.checked)}
                        checked={selectedOrders.includes(order.id)}
                        disabled={order.status === 'completed' || order.status === 'cancelled'}
                        className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{order.id ? `ORD${order.id}` : '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{order.customer_name || '-'}</div>
                      <div className="text-xs text-gray-500">{order.customer_company || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm font-bold">{formatMoney(order.total_price)}</div>
                      <div className="text-xs text-gray-500">{order.item_count} 个资源</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">{order.industry || '-'}</div>
                      <div className="text-xs text-gray-400">{order.city || '-'}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDetailOrder(order)}
                        className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                        详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 border-t">
          {renderPagination()}
        </div>
      </div>

      {/* 订单详情弹窗 */}
      {renderDetailModal()}
    </div>
  )
}
