'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Smartphone, Lock, Eye, EyeOff, User, Building, Mail, UserPlus, Shield, RefreshCw } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<'individual' | 'company'>('individual')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [captchaId, setCaptchaId] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaSrc, setCaptchaSrc] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)

  // 加载验证码图片
  const loadCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha')
      const captchaId = res.headers.get('X-Captcha-Id') || ''
      setCaptchaId(captchaId)
      const blob = await res.blob()
      setCaptchaSrc(URL.createObjectURL(blob))
    } catch {
      setError('验证码加载失败，请刷新页面')
    }
  }

  useEffect(() => {
    loadCaptcha()
    return () => {
      if (captchaSrc) URL.revokeObjectURL(captchaSrc)
    }
  }, [])

  const handleRegister = async () => {
    setError('')

    // 验证手机号
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号码')
      return
    }

    // 验证图片验证码
    if (!captchaInput || captchaInput.length !== 4) {
      setError('请输入4位图片验证码')
      return
    }

    // 验证密码
    if (!password) {
      setError('请设置密码')
      return
    }
    if (password.length < 6) {
      setError('密码至少6位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    // 验证联系人
    if (!contactName) {
      setError('请输入联系人姓名')
      return
    }

    // 企业用户必须填写公司名称
    if (userType === 'company' && !companyName) {
      setError('企业用户请填写公司名称')
      return
    }

    // 同意协议
    if (!agreed) {
      setError('请阅读并同意用户协议和隐私政策')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          captchaId,
          captchaCode: captchaInput,
          password,
          userType,
          companyName: userType === 'company' ? companyName : undefined,
          contactName,
          email: email || undefined,
          agreeTerms: agreed
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('注册成功！请登录')
        router.push('/login')
      } else {
        setError(data.message || '注册失败，请稍后重试')
        loadCaptcha() // 刷新验证码
        setCaptchaInput('')
      }
    } catch {
      setError('网络错误，请检查网络连接后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>注册 — 青海全媒体广告平台</title>
        <meta name="description" content="注册青海全媒体广告平台，开通3天免费试用，查询青海户外广告资源、使用AI生成投放方案" />
      </Head>
      
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">注册账号</h1>
          <p className="text-gray-600 mt-2">开启广告投放之旅</p>
        </div>

        {/* 用户类型选择 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">账号类型</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUserType('individual')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                userType === 'individual'
                  ? 'border-primary bg-blue-50 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">个人用户</span>
            </button>
            <button
              onClick={() => setUserType('company')}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                userType === 'company'
                  ? 'border-primary bg-blue-50 text-primary'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Building className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">企业用户</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* 手机号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手机号 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="请输入手机号码"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={11}
              />
            </div>
          </div>

          {/* 图片验证码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              图片验证码 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="输入验证码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={4}
                />
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {captchaSrc ? (
                  <img
                    ref={imgRef}
                    src={captchaSrc}
                    alt="验证码"
                    className="h-11 rounded-lg cursor-pointer border border-gray-200"
                    onClick={() => { loadCaptcha(); setCaptchaInput('') }}
                  />
                ) : (
                  <div className="h-11 w-[120px] bg-gray-100 rounded-lg animate-pulse" />
                )}
                <button
                  type="button"
                  onClick={() => { loadCaptcha(); setCaptchaInput('') }}
                  className="p-2 text-gray-400 hover:text-primary transition-colors"
                  title="换一张"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 联系人 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系人 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="请输入联系人姓名"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* 企业名称（企业用户） */}
          {userType === 'company' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司名称 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="请输入公司全称"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱（选填）</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入电子邮箱"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              设置密码 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码（至少6位）"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 确认密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认密码 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  confirmPassword && password !== confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">两次输入的密码不一致</p>
            )}
          </div>

          {/* 协议同意 */}
          <div>
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 mr-3 w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                我已阅读并同意
                <Link href="/terms" className="text-primary hover:underline mx-1">用户协议</Link>
                和
                <Link href="/privacy" className="text-primary hover:underline mx-1">隐私政策</Link>
              </span>
            </label>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 注册按钮 */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full py-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                注册中...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                立即注册
              </>
            )}
          </button>

          {/* 已有账号 */}
          <div className="pt-6 border-t border-gray-200 text-center">
            <span className="text-sm text-gray-600">已有账号？</span>
            <Link href="/login" className="text-primary hover:underline font-medium ml-2">
              立即登录
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
