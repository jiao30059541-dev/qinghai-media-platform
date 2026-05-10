// app/admin/users/page.tsx - 用户管理页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, ChevronLeft, ChevronRight, Shield, UserCheck,
  Building2, Phone, Mail, MapPin, Clock, CheckCircle, XCircle,
  Filter, MoreVertical, Edit, Trash2, UserPlus, Star, BadgeCheck
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface User {
  id: number
  real_name: string
  phone: string
  email: string
  company_name: string
  industry: string
  user_type: string
  status: string
  id_card_verified: number
  created_at: string
  last_login: string
  order_count: number
  total_spent: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<any>({})
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Token from localStorage
  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filterType !== 'all') params.set('userType', filterType)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users)
        setTotalPages(data.data.pagination.totalPages)
        setTotal(data.data.pagination.total)
        setStats(data.data.stats)
      }
    } catch (err) {
      console.error('Failed to fetch', err)
    } finally {
      setLoading(false)
    }
  }, [filterType, filterStatus, search, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleBatchAction = async (action: string) => {
    const checked = users.filter(u => (u as any)._checked)
    if (checked.length === 0) { alert('请选择用户'); return }
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ userIds: checked.map(u => u.id), action })
    })
    const data = await res.json()
    if (data.success) { fetchUsers(); alert(data.message) }
    else alert(data.message)
  }

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { advertiser: '广告主', supplier: '供应商', admin: '管理员' }
    return map[type] || type
  }

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" /> 正常</span>
    return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium"><XCircle className="w-3 h-3" /> 禁用</span>
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">用户管理</h1>
        <p className="text-gray-500">管理平台所有用户，查看用户详情和统计信息</p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: '总用户', value: stats.total_users || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '活跃用户', value: stats.active_users || 0, color: 'text-green-600', bg: 'bg-green-50' },
          { label: '广告主', value: stats.advertisers || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: '供应商', value: stats.suppliers || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: '已实名', value: stats.verified_users || 0, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="搜索用户姓名/手机号/企业..." className="pl-10 rounded-2xl" />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1) }}
          className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white">
          <option value="all">全部类型</option>
          <option value="advertiser">广告主</option>
          <option value="supplier">供应商</option>
          <option value="admin">管理员</option>
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white">
          <option value="all">全部状态</option>
          <option value="active">正常</option>
          <option value="inactive">禁用</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleBatchAction('activate')}>批量启用</Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleBatchAction('deactivate')}>批量禁用</Button>
          <Button variant="primary" size="sm" className="rounded-xl bg-blue-600" onClick={() => setShowCreate(true)}>
            <UserPlus className="w-4 h-4 mr-1" /> 新增用户
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-10 px-4 py-4"><input type="checkbox" onChange={e => setUsers(users.map(u => ({ ...u, _checked: e.target.checked })))} /></th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">用户信息</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">手机号</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-500">类型</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">实名</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">订单数</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">状态</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">注册时间</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-20 text-gray-400">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-20 text-gray-400">暂无数据</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4"><input type="checkbox" checked={(user as any)._checked || false} onChange={e => setUsers(users.map(u => u.id === user.id ? { ...u, _checked: e.target.checked } : u))} /></td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{user.real_name}</div>
                    <div className="text-xs text-gray-400">{user.company_name || '-'}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{user.phone}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
                      user.user_type === 'admin' ? 'bg-red-100 text-red-600' :
                      user.user_type === 'supplier' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    )}>{getTypeLabel(user.user_type)}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {user.id_card_verified ? (
                      <BadgeCheck className="w-5 h-5 text-green-500 mx-auto" />
                    ) : <span className="text-gray-300 text-sm">-</span>}
                  </td>
                  <td className="py-4 px-4 text-center text-gray-600">{user.order_count || 0}</td>
                  <td className="py-4 px-4 text-center">{getStatusBadge(user.status)}</td>
                  <td className="py-4 px-4 text-center text-sm text-gray-400">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '-'}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setSelectedUser(user)}>
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setEditUser(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
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
        {selectedUser && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.real_name}</h2>
                    <p className="text-gray-400 text-sm">用户ID: {selectedUser.id}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Phone className="w-3 h-3" /> 手机号</div>
                    <div className="font-medium text-sm">{selectedUser.phone}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Mail className="w-3 h-3" /> 邮箱</div>
                    <div className="font-medium text-sm">{selectedUser.email || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Building2 className="w-3 h-3" /> 企业</div>
                    <div className="font-medium text-sm">{selectedUser.company_name || '-'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><MapPin className="w-3 h-3" /> 行业</div>
                    <div className="font-medium text-sm">{selectedUser.industry || '-'}</div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-blue-600">{selectedUser.order_count || 0}</div>
                      <div className="text-xs text-blue-500">订单数</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">¥{(selectedUser.total_spent || 0).toLocaleString()}</div>
                      <div className="text-xs text-blue-500">总消费</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-600">{selectedUser.id_card_verified ? '是' : '否'}</div>
                      <div className="text-xs text-blue-500">实名认证</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>注册时间: {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('zh-CN') : '-'}</span>
                  <span>最后登录: {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('zh-CN') : '-'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
