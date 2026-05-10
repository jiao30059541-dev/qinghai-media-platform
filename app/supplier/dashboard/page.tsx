// app/supplier/dashboard/page.tsx - 供应商工作台（含资质上传）
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Monitor, ShoppingCart, DollarSign, TrendingUp, Plus, Eye, ArrowRight, Clock, Package, BarChart3, Loader2, Upload, FileText, Download, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SupplierDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [cert, setCert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [uploading, setUploading] = useState<'license' | 'authorization' | null>(null)
  const [uploadMsg, setUploadMsg] = useState('')

  const fetchCert = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const res = await fetch('/api/supplier/certification', {
        headers: { 'Authorization': 'Bearer ' + token }
      })
      const d = await res.json()
      if (d.success) setCert(d.data)
    } catch {}
  }

  useEffect(() => {
    try { const s = localStorage.getItem('supplier_user'); if (s) setUser(JSON.parse(s)) } catch {}
    const token = localStorage.getItem('token')
    Promise.all([
      fetch('/api/supplier/stats', { headers: { 'Authorization': 'Bearer ' + (token || '') } }).then(r => r.json()).then(d => { if (d.success) setStats(d.data) }).catch(() => {}),
      fetch('/api/supplier/certification', { headers: { 'Authorization': 'Bearer ' + (token || '') } }).then(r => r.json()).then(d => { if (d.success) setCert(d.data) }).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  const handleUpload = async (type: 'license' | 'authorization') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      if (file.size > 5 * 1024 * 1024) { setUploadMsg('图片不能超过5MB'); return }
      setUploading(type)
      setUploadMsg('')
      try {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          const base64 = reader.result
          const token = localStorage.getItem('token')
          const res = await fetch('/api/supplier/certification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || '') },
            body: JSON.stringify({ type, image_base64: base64 })
          })
          const d = await res.json()
          if (d.success) {
            setUploadMsg(`${type === 'license' ? '营业执照' : '授权书'}上传成功！`)
            fetchCert()
          } else {
            setUploadMsg(d.message || '上传失败')
          }
        }
      } catch { setUploadMsg('上传失败') }
      finally { setUploading(null) }
    }
    input.click()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>

  const statCards = [
    { label: '我的资源', value: stats?.media?.total || 0, icon: Monitor, color: 'bg-blue-500', href: '/supplier/media' },
    { label: '已上架', value: stats?.media?.active || 0, icon: Eye, color: 'bg-green-500', href: '/supplier/media?status=active' },
    { label: '待处理订单', value: stats?.orders?.pending || 0, icon: Clock, color: 'bg-yellow-500', href: '/supplier/orders?status=pending' },
    { label: '累计收益', value: '¥' + (stats?.revenue?.total || '0'), icon: DollarSign, color: 'bg-purple-500', href: '/supplier/orders' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来，{user?.supplier?.company_name || '供应商'}</h1>
        <p className="text-gray-500">管理你的媒体资源，查看订单和收益</p>
      </motion.div>

      {/* 资质认证卡片 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={cn('rounded-2xl p-6 border transition-all', cert?.certified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200')}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', cert?.certified ? 'bg-green-100' : 'bg-amber-100')}>
              {cert?.certified ? <CheckCircle className="w-6 h-6 text-green-600" /> : <ShieldCheck className="w-6 h-6 text-amber-600" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">企业资质认证</h3>
              <p className="text-sm text-gray-600 mb-3">
                {cert?.certified
                  ? '资质已齐全，可以上传媒体资源'
                  : '请上传营业执照和授权书，完成后才能上传媒体资源'}
              </p>
              <div className="flex flex-wrap gap-3">
                {/* 营业执照 */}
                <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm', cert?.has_license ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-200')}>
                  {cert?.has_license ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  营业执照
                  {cert?.license_url && <a href={cert.license_url} target="_blank" className="ml-1 text-xs text-primary hover:underline">查看</a>}
                </div>
                {/* 授权书 */}
                <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-sm', cert?.has_authorization ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-200')}>
                  {cert?.has_authorization ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  授权书
                  {cert?.authorization_url && <a href={cert.authorization_url} target="_blank" className="ml-1 text-xs text-primary hover:underline">查看</a>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!cert?.has_license && (
              <button onClick={() => handleUpload('license')} disabled={uploading !== null}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50">
                {uploading === 'license' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                上传营业执照
              </button>
            )}
            {!cert?.has_authorization && (
              <div className="flex gap-2">
                <a href="/templates/authorization-template.html" target="_blank" download
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                  <Download className="w-4 h-4" />
                  下载模板
                </a>
                <button onClick={() => handleUpload('authorization')} disabled={uploading !== null}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50">
                  {uploading === 'authorization' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  上传授权书
                </button>
              </div>
            )}
          </div>
        </div>
        {uploadMsg && (
          <div className={cn('mt-3 text-sm', uploadMsg.includes('成功') ? 'text-green-600' : 'text-red-600')}>{uploadMsg}</div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', card.color)}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </Link>
        ))}
      </motion.div>

      {/* Quick Actions & Recent Orders */}
      <motion.div className="grid md:grid-cols-2 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> 快捷操作</h3>
          <div className="space-y-3">
            <Link href={cert?.certified ? "/supplier/media/new" : "#"} onClick={e => { if (!cert?.certified) { e.preventDefault(); alert('请先上传企业资质（营业执照和授权书）后再上传资源') }}}
              className={cn("flex items-center justify-between p-3 rounded-xl transition-all group", cert?.certified ? "bg-primary/5 hover:bg-primary/10" : "bg-gray-50 opacity-60")}>
              <div className="flex items-center gap-3">
                <Plus className={cn("w-5 h-5", cert?.certified ? "text-primary" : "text-gray-400")} />
                <div><div className="font-medium text-gray-900">上传新资源</div><div className="text-sm text-gray-500">添加你的广告位信息</div></div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/supplier/media" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div><div className="font-medium text-gray-900">管理已有资源</div><div className="text-sm text-gray-500">编辑、上架或下架资源</div></div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
            <Link href="/supplier/orders" className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all group">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                <div><div className="font-medium text-gray-900">查看订单</div><div className="text-sm text-gray-500">处理和管理投放订单</div></div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> 最近订单</h3>
            <Link href="/supplier/orders" className="text-sm text-primary hover:underline">查看全部</Link>
          </div>
          {stats?.recent_orders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_orders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{order.media_name}</div>
                    <div className="text-xs text-gray-500">{order.client_name} · ¥{order.total_price}</div>
                  </div>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full', order.status === 'confirmed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500')}>
                    {order.status === 'confirmed' ? '已完成' : order.status === 'pending' ? '待处理' : order.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">暂无订单</div>
          )}
        </div>
      </motion.div>

      <motion.div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-2xl p-6 border border-primary/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center flex-shrink-0"><TrendingUp className="w-5 h-5 text-white" /></div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">提升曝光小贴士</h3>
            <p className="text-sm text-gray-600">完善资源描述和图片信息可以提升资源曝光率。建议上传高清实拍照片，详细描述广告位的具体位置和人流数据。先上传营业执照和授权书完成资质认证，即可开始上传媒体资源。</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
