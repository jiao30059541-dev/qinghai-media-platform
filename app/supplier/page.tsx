// app/supplier/page.tsx - 供应商后台入口
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Head from 'next/head'
import { Building2, LogIn, UserPlus, ArrowRight, ShieldCheck, Loader2, CheckCircle, AlertTriangle, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SupplierEntryPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' })
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerForm, setRegisterForm] = useState({ company: '', contact: '', phone: '', email: '', city: '', media: '', desc: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    // Check if already logged in as supplier
    try {
      const stored = localStorage.getItem('supplier_user')
      if (stored) {
        router.replace('/supplier/dashboard')
        return
      }
    } catch {}
    // 给 body 加类名隐藏主站 Header/Footer，确保退出时自动恢复
    document.body.classList.add('supplier-entry-active')
    setChecking(false)

    // 离开时清理
    return () => {
      document.body.classList.remove('supplier-entry-active')
    }
  }, [router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.company || !registerForm.contact || !registerForm.phone) {
      setError('请填写企业名称、联系人和联系电话')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/supplier/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: registerForm.company,
          contact_name: registerForm.contact,
          phone: registerForm.phone,
          email: registerForm.email || undefined,
          city: registerForm.city || undefined,
          media_type: registerForm.media || undefined,
          description: registerForm.desc || undefined,
        })
      })
      const data = await res.json()
      if (data.success && data.token) {
        // 展示AI评分结果，不立即跳转
        setResult(data)
        // 保存token到内存，点击"进入后台"时再存localStorage跳转
        ;(window as any).__supplier_token = data.token
      } else {
        setResult(data)
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginForm.phone || !loginForm.password) {
      setLoginError('请输入手机号和密码')
      return
    }
    setLoginError('')
    setLoginSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: loginForm.phone,
          password: loginForm.password,
          loginMethod: 'password'
        })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // 获取供应商详细信息
        if (data.user?.role === 'supplier') {
          const supplierRes = await fetch('/api/supplier/me', {
            headers: { 'Authorization': `Bearer ${data.token}` }
          })
          const supplierData = await supplierRes.json()
          if (supplierData.success) {
            localStorage.setItem('supplier_user', JSON.stringify(supplierData.data))
          }
        }
        router.replace('/supplier/dashboard')
      } else {
        setLoginError(data.message || '登录失败')
      }
    } catch {
      setLoginError('网络错误，请稍后重试')
    } finally {
      setLoginSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Head>
        <title>供应商后台 — 青海全媒体广告平台</title>
        <meta name="description" content="广告供应商入驻青海全媒体广告平台，管理媒体资源、查看订单收益、AI智能初审快速入驻" />
      </Head>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">青媒</span>
            </div>
            <span className="font-bold text-gray-900">供应商后台</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
            返回主站
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-sm text-primary font-medium mb-4">
            <ShieldCheck className="w-4 h-4" /> 供应商专属管理平台
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            供应商后台入口
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            管理媒体资源、查看订单收益、更新资质信息，一站式供应商经营管理平台
          </p>
        </motion.div>

        {/* Tab Switch */}
        <motion.div className="max-w-md mx-auto mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-200">
            <button
              onClick={() => { setTab('login'); setError(''); setResult(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                tab === 'login' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" /> 登录后台
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setResult(null) }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                tab === 'register' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> 入驻申请
            </button>
          </div>
        </motion.div>

        {tab === 'login' ? (
          /* ───── Login Card ───── */
          <motion.div className="max-w-md mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">供应商登录</h2>
                <p className="text-gray-500 text-sm mt-1">使用入驻时注册的手机号登录</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">手机号</label>
                  <Input
                    value={loginForm.phone}
                    onChange={e => setLoginForm({...loginForm, phone: e.target.value})}
                    placeholder="请输入手机号"
                    required
                    className="w-full rounded-2xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
                  <Input
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    placeholder="请输入登录密码"
                    required
                    className="w-full rounded-2xl"
                  />
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {loginError}
                  </div>
                )}

                <Button type="submit" disabled={loginSubmitting} variant="primary" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl text-base font-semibold">
                  {loginSubmitting ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> 登录中...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><LogIn className="w-5 h-5" /> 登录后台</span>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-400">
                  还没有账号？<button onClick={() => { setTab('register'); setLoginError('') }} className="text-primary font-medium hover:underline">立即入驻</button>
                </p>
                <p className="text-center text-xs text-gray-400 mt-2">
                  请联系平台管理员获取登录密码
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ───── Register Card ───── */
          <motion.div className="max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            {result?.success ? (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">申请已提交！</h3>
                  <p className="text-gray-500">我们将在1-3个工作日内完成审核</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-700">AI综合评分</span>
                    <span className={`text-3xl font-bold ${
                      (result.data?.ai_score || 0) >= 70 ? 'text-green-600' :
                      (result.data?.ai_score || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.data?.ai_score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      (result.data?.ai_score || 0) >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      (result.data?.ai_score || 0) >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`} style={{ width: `${result.data?.ai_score || 0}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                  {result.data?.ai_decision === 'recommend_approve' ? (
                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                      <ThumbsUp className="w-5 h-5" /> AI建议：通过
                    </span>
                  ) : result.data?.ai_decision === 'recommend_reject' ? (
                    <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
                      <ThumbsDown className="w-5 h-5" /> AI建议：拒绝
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
                      <HelpCircle className="w-5 h-5" /> AI建议：需人工审核
                    </span>
                  )}
                  <span className="text-sm text-gray-400">| 最终以人工审核为准</span>
                </div>

                <div className="text-center text-sm text-gray-400 mb-6">
                  <p>申请编号：{result.data?.id}</p>
                  <p className="mt-1">审核通过后，我们将通过短信通知您</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => { setResult(null); setRegisterForm({ company: '', contact: '', phone: '', email: '', city: '', media: '', desc: '' }) }}>
                    继续申请
                  </Button>
                  <Button variant="primary" className="flex-1 rounded-2xl bg-primary hover:bg-primary/90" onClick={() => {
                    const token = (window as any).__supplier_token
                    if (token && result?.data) {
                      localStorage.setItem('token', token)
                      localStorage.setItem('supplier_user', JSON.stringify({
                        user: { id: result.data.user_id, name: result.data.contact_name, phone: result.data.phone },
                        supplier: { id: result.data.id, company_name: result.data.company_name, status: result.data.status },
                        stats: { total_media: 0, active_media: 0 }
                      }))
                      router.replace('/supplier/dashboard')
                    } else {
                      setTab('login')
                    }
                  }}>
                    进入后台 <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">供应商入驻</h2>
                  <p className="text-gray-500 text-sm mt-1">AI智能初审，快速获取评估结果</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">企业名称 *</label>
                      <Input value={registerForm.company} onChange={e => setRegisterForm({...registerForm, company: e.target.value})} placeholder="请输入企业全称" required className="w-full rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">联系人姓名 *</label>
                      <Input value={registerForm.contact} onChange={e => setRegisterForm({...registerForm, contact: e.target.value})} placeholder="请输入联系人姓名" required className="w-full rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">联系电话 *</label>
                      <Input value={registerForm.phone} onChange={e => setRegisterForm({...registerForm, phone: e.target.value})} placeholder="请输入手机号" required className="w-full rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
                      <Input value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} placeholder="请输入邮箱地址" type="email" className="w-full rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">所在城市</label>
                      <Input value={registerForm.city} onChange={e => setRegisterForm({...registerForm, city: e.target.value})} placeholder="如：西宁" className="w-full rounded-2xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">媒体资源类型</label>
                      <Input value={registerForm.media} onChange={e => setRegisterForm({...registerForm, media: e.target.value})} placeholder="如：户外大牌、LED大屏、电梯广告" className="w-full rounded-2xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">资源描述</label>
                    <textarea value={registerForm.desc} onChange={e => setRegisterForm({...registerForm, desc: e.target.value})} rows={4} placeholder="请简要描述您的媒体资源情况（数量、位置、覆盖人群等），详细的描述有助于AI获得更高评分"
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" />
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                  )}

                  <Button type="submit" disabled={submitting} variant="primary" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white py-3.5 rounded-2xl text-base font-semibold">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> AI智能评估中...</span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">提交入驻申请 <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                  已有账号？<button onClick={() => setTab('login')} className="text-primary font-medium hover:underline">去登录</button>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
