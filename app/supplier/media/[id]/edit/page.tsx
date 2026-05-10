// app/supplier/media/[id]/edit/page.tsx - 编辑媒体资源
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

const cities = ['西宁', '海东', '格尔木', '德令哈', '玉树', '黄南', '海南', '海北', '果洛', '海西']

export default function EditMediaPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', address: '', category_level1: '', category_level2: '',
    list_price: '', deal_price: '', floor_price: '',
    size: '', resolution: '', daily_exposure: '', description: ''
  })

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('/api/supplier/media/' + params.id, { headers: { 'Authorization': 'Bearer ' + (token || '') } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const m = d.data
          setForm({
            name: m.name || '', city: m.city || '', address: m.address || '',
            category_level1: m.category_level1 || '', category_level2: m.category_level2 || '',
            list_price: String(m.list_price || ''), deal_price: String(m.deal_price || ''), floor_price: String(m.floor_price || ''),
            size: m.size || '', resolution: m.resolution || '', daily_exposure: String(m.daily_exposure || ''),
            description: m.description || ''
          })
        } else { alert('资源不存在'); router.push('/supplier/media') }
      })
      .catch(() => alert('加载失败'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleSave = async () => {
    if (!form.name || !form.city) { alert('请填写资源名称和城市'); return }
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/supplier/media/' + params.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || '') },
        body: JSON.stringify({
          ...form,
          list_price: parseFloat(form.list_price || '0'),
          deal_price: parseFloat(form.deal_price || '0'),
          floor_price: parseFloat(form.floor_price || '0'),
          daily_exposure: parseInt(form.daily_exposure || '0'),
        })
      })
      const data = await res.json()
      if (data.success) { setSaved(true); setTimeout(() => router.push('/supplier/media'), 1500) }
      else alert(data.message)
    } catch (err) { alert('保存失败') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-all">
        <ArrowLeft className="w-4 h-4" /> 返回
      </button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">编辑资源</h2>
        {saved ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">保存成功！</h3>
            <p className="text-gray-500">正在跳转...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">资源名称</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
                <select value={form.city} onChange={e => update('city', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">媒体类型</label>
              <input type="text" value={form.category_level2} onChange={e => update('category_level2', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
              <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">挂牌价</label>
                <input type="number" value={form.list_price} onChange={e => update('list_price', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">成交价</label>
                <input type="number" value={form.deal_price} onChange={e => update('deal_price', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">底价</label>
                <input type="number" value={form.floor_price} onChange={e => update('floor_price', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
                <input type="text" value={form.size} onChange={e => update('size', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">日均曝光</label>
                <input type="number" value={form.daily_exposure} onChange={e => update('daily_exposure', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
        )}
        {!saved && (
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={() => router.back()} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all">取消</button>
            <button onClick={handleSave} disabled={saving}
              className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 font-medium transition-all disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
