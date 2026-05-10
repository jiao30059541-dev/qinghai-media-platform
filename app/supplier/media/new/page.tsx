// app/supplier/media/new/page.tsx - 上传新广告资源（支持AI智能识别）
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ImagePlus, MapPin, DollarSign, Info, CheckCircle, Loader2, ArrowLeft, Monitor, Smartphone, Layout, Target, BarChart3, ShieldCheck, AlertTriangle, Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import AiMediaParser from '@/components/AiMediaParser'

const mediaTypes = [
  { value: 'LED大屏', label: 'LED大屏', icon: Monitor, desc: '户外LED显示屏广告' },
  { value: '户外大牌', label: '户外大牌', icon: Layout, desc: '大型户外广告牌' },
  { value: '墙体广告', label: '墙体广告', icon: Layout, desc: '建筑墙体广告' },
  { value: '电梯广告', label: '电梯广告', icon: Smartphone, desc: '电梯框架/电子屏' },
  { value: '道闸广告', label: '道闸广告', icon: Target, desc: '停车场道闸广告' },
  { value: '公交广告', label: '公交广告', icon: BarChart3, desc: '公交车身/站台广告' },
  { value: '机场广告', label: '机场广告', icon: Monitor, desc: '机场内各类广告位' },
  { value: '电视广告', label: '电视广告', icon: Monitor, desc: '电视媒体广告' },
]

const cities = ['西宁', '海东', '格尔木', '德令哈', '玉树', '黄南', '海南', '海北', '果洛', '海西']

export default function NewMediaPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'choose' | 'ai' | 'manual'>('choose')
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [cert, setCert] = useState<any>(null)
  const [certLoading, setCertLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', city: '', address: '', category_level2: '',
    list_price: '', deal_price: '', floor_price: '',
    size: '', resolution: '', daily_exposure: '', description: ''
  })

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  // 检查资质
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setCertLoading(false); return }
    fetch('/api/supplier/certification', { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(d => { if (d.success) setCert(d.data) }).catch(() => {})
      .finally(() => setCertLoading(false))
  }, [])

  // AI识别回调 - 填入表单，跳到第二步
  const handleAiParsed = (data: any) => {
    const floorPrice = data.deal_price ? Math.round(data.deal_price * 0.8) : ''
    setForm({
      name: data.name || '',
      city: data.city || '',
      address: data.address || '',
      category_level2: data.category_level2 || '',
      list_price: data.list_price ? String(data.list_price) : '',
      deal_price: data.deal_price ? String(data.deal_price) : '',
      floor_price: floorPrice ? String(floorPrice) : '',
      size: data.size || '',
      resolution: data.resolution || '',
      daily_exposure: data.daily_exposure ? String(data.daily_exposure) : '',
      description: data.description || '',
    })
    setMode('manual')
    setStep(2) // 跳到媒体属性，因为基本信息已填
  }

  const handleSubmit = async () => {
    if (!form.name || !form.city || !form.category_level2) { alert('请填写资源名称、城市和媒体类型'); return }
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/supplier/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (token || '') },
        body: JSON.stringify({
          ...form, category_level1: '户外广告',
          list_price: parseFloat(form.list_price || '0'),
          deal_price: parseFloat(form.deal_price || '0'),
          floor_price: parseFloat(form.floor_price || '0'),
          daily_exposure: parseInt(form.daily_exposure || '0'),
        })
      })
      const data = await res.json()
      setResult(data)
      if (data.success) setStep(4)
      else alert(data.message)
    } catch (err) { alert('提交失败，请重试') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 mr-3">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">上传新资源</h1>
          <p className="text-sm text-gray-500">添加你的广告资源到平台进行售卖</p>
        </div>
      </div>

      {/* 入口模式选择 */}
      {mode === 'choose' && (
        <div className="space-y-4">
          <AiMediaParser
            onParsed={handleAiParsed}
            onCancel={() => setMode('manual')}
          />
        </div>
      )}

      {/* 手动填写模式 */}
      {mode === 'manual' && (
        <>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-8">
            {[{ num: 1, label: '基本信息' }, { num: 2, label: '媒体属性' }, { num: 3, label: '价格信息' }, { num: 4, label: '完成' }].map((s, i) => (
              <div key={s.num} className="flex-1 flex items-center">
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                  step > s.num ? 'bg-green-500 text-white' : step === s.num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                )}>{step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}</div>
                <span className={cn('text-sm ml-2 hidden sm:inline', step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-400')}>{s.label}</span>
                {i < 3 && <div className={cn('flex-1 h-0.5 mx-2', step > s.num ? 'bg-green-500' : 'bg-gray-200')} />}
              </div>
            ))}
          </div>

          {/* 如果是从AI识别过来的，显示一个标签 */}
          {form.name && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center gap-2 text-sm text-blue-700">
              <Sparkles className="w-4 h-4" />
              AI已识别并预填了资源信息，您可以修改或继续下一步
              <button onClick={() => { setMode('choose'); setForm({name:'',city:'',address:'',category_level2:'',list_price:'',deal_price:'',floor_price:'',size:'',resolution:'',daily_exposure:'',description:''}) }}
                className="ml-auto text-blue-800 underline text-xs whitespace-nowrap">重新识别</button>
            </div>
          )}

          {/* Step 1: 基本信息 */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              {/* 资质校验 */}
              {!certLoading && cert && !cert.certified && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">资质认证未完成</h4>
                    <p className="text-sm text-amber-700 mb-2">上传媒体资源前需先完成企业资质认证（营业执照 + 授权书）</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full', cert?.has_license ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-amber-200')}>
                        {cert?.has_license ? <CheckCircle className="w-3 h-3" /> : '✕'} 营业执照
                      </span>
                      <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full', cert?.has_authorization ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-amber-200')}>
                        {cert?.has_authorization ? <CheckCircle className="w-3 h-3" /> : '✕'} 授权书
                      </span>
                    </div>
                    <button onClick={() => router.push('/supplier/dashboard')} className="mt-3 text-sm text-primary font-medium hover:underline">
                      去上传资质 →
                    </button>
                  </div>
                </div>
              )}
              {!certLoading && cert?.certified && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" /> 资质认证已完成，可以上传媒体资源
                </div>
              )}
              {certLoading && (
                <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> 检查资质认证状态...
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
                <button onClick={() => setMode('choose')}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium">
                  <Sparkles className="w-4 h-4" /> AI智能识别
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">资源名称 *</label>
                  <input type="text" placeholder="例如：西宁火车站LED大屏" value={form.name} onChange={e => update('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">所在城市 *</label>
                    <select value={form.city} onChange={e => update('city', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">选择城市</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">媒体类型 *</label>
                    <select value={form.category_level2} onChange={e => update('category_level2', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">选择类型</option>
                      {mediaTypes.map(mt => <option key={mt.value} value={mt.value}>{mt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
                  <input type="text" placeholder="例如：城东区建国路1号火车站广场" value={form.address} onChange={e => update('address', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">资源描述</label>
                  <textarea placeholder="详细描述广告位位置、周围环境、人流情况、优势特点等" value={form.description} onChange={e => update('description', e.target.value)} rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button onClick={() => setStep(2)} className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 font-medium transition-all">下一步：媒体属性</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: 媒体属性 */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">媒体属性</h2>
              <div className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">尺寸（宽×高）</label>
                    <input type="text" placeholder="例如：12m × 6m" value={form.size} onChange={e => update('size', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">分辨率</label>
                    <input type="text" placeholder="例如：4K超高清" value={form.resolution} onChange={e => update('resolution', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">日均曝光量</label>
                  <input type="number" placeholder="例如：100000" value={form.daily_exposure} onChange={e => update('daily_exposure', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <p className="text-xs text-gray-400 mt-1">每天预计触达人数</p>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all">上一步</button>
                <button onClick={() => setStep(3)} className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 font-medium transition-all">下一步：价格信息</button>
              </div>
            </motion.div>
          )}

          {/* Step 3: 价格信息 */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">价格信息</h2>
              <div className="space-y-5">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">挂牌价（元/天）</label>
                    <input type="number" placeholder="35000" value={form.list_price} onChange={e => update('list_price', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">成交价（元/天）</label>
                    <input type="number" placeholder="28000" value={form.deal_price} onChange={e => update('deal_price', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">底价（元/天）</label>
                    <input type="number" placeholder="20000" value={form.floor_price} onChange={e => update('floor_price', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>价格说明：</strong><br />
                      挂牌价：展示给客户的原始价格<br />
                      成交价：客户最终支付的价格（可含折扣）<br />
                      底价：你接受的最低价格（平台结算参考）
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all">上一步</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="bg-primary text-white px-10 py-3 rounded-xl hover:bg-primary/90 font-medium transition-all disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? '提交中...' : '提交审核'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: 完成 */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">提交成功！</h2>
              <p className="text-gray-500 mb-2">你的资源已成功提交，等待管理员审核上架</p>
              <p className="text-sm text-gray-400 mb-8">审核通过后，广告主即可在平台上搜索到你的资源</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => router.push('/supplier/media')} className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary/90 font-medium transition-all">查看我的资源</button>
                <button onClick={() => { setStep(1); setForm({ name: '', city: '', address: '', category_level2: '', list_price: '', deal_price: '', floor_price: '', size: '', resolution: '', daily_exposure: '', description: '' }) }}
                  className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all">继续上传</button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
