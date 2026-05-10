// app/login/page.tsx - 更新版：真实API调用+供应商跳转
'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { ArrowLeft, Smartphone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'code' | 'password'>('password')
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      alert('请输入正确的手机号码')
      return
    }
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })
      const data = await res.json()
      if (data.success) {
        if (data.code) alert(`验证码：${data.code}`) // 开发模式显示验证码
      } else {
        alert(data.message || '发送失败')
      }
    } catch {
      // 静默失败，开发环境可能没有该API
    }
  }

  const handleLogin = async () => {
    if (!phone) { alert('请输入手机号码'); return }
    if (loginMethod === 'code' && !verificationCode) { alert('请输入验证码'); return }
    if (loginMethod === 'password' && !password) { alert('请输入密码'); return }
    
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          password: loginMethod === 'password' ? password : undefined,
          code: loginMethod === 'code' ? verificationCode : undefined,
          loginMethod
        })
      })
      const data = await res.json()
      
      if (data.success) {
        // 存储用户信息
        localStorage.setItem('token', data.token)
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // 如果是供应商，额外存储并跳转到供应商中心
        if (data.user?.role === 'supplier') {
          // 获取供应商详细信息
          try {
            const supplierRes = await fetch('/api/supplier/me', {
              headers: { 'Authorization': `Bearer ${data.token}` }
            })
            const supplierData = await supplierRes.json()
            if (supplierData.success) {
              localStorage.setItem('supplier_user', JSON.stringify(supplierData.data))
            }
          } catch {}
          
          window.location.href = redirectTo || '/supplier/dashboard'
        } else if (data.user?.user_type === 'admin') {
          window.location.href = '/admin'
        } else {
          window.location.href = redirectTo || '/'
        }
      } else {
        alert(data.message || '登录失败')
      }
    } catch (err) {
      alert('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>登录 — 青海全媒体广告平台</title>
        <meta name="description" content="登录青海全媒体广告智能投放平台，管理投放方案、查看订单历史" />
      </Head>
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" /> 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">登录账号</h1>
          <p className="text-gray-600">登录后可以保存投放方案、查看订单历史</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Login method toggle */}
          <div className="flex mb-6 border-b">
            <button onClick={() => setLoginMethod('code')}
              className={`flex-1 py-3 text-center font-medium ${loginMethod === 'code' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
              验证码登录
            </button>
            <button onClick={() => setLoginMethod('password')}
              className={`flex-1 py-3 text-center font-medium ${loginMethod === 'password' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>
              密码登录
            </button>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 11))}
                placeholder="请输入11位手机号码"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </div>
          
          {loginMethod === 'code' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">验证码</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                    placeholder="6位验证码"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <button onClick={handleSendCode} disabled={countdown > 0 || !phone || phone.length !== 11}
                  className="px-4 py-3 bg-blue-50 text-primary font-medium rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                  {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          
          <button onClick={handleLogin} disabled={isLoading}
            className="w-full py-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading ? '登录中...' : '登录'}
          </button>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              还没有账号？<Link href="/register" className="text-primary hover:underline font-medium">立即注册</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          登录即代表您同意
          <Link href="/terms" className="text-primary hover:underline mx-1">用户协议</Link>
          和
          <Link href="/privacy" className="text-primary hover:underline mx-1">隐私政策</Link>
        </div>
      </main>
    </div>
  )
}
