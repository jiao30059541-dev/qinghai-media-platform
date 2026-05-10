// components/Header.tsx - 导航栏（服务端渲染优先）
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const navItems = [
  { name: '首页', href: '/' },
  { name: '广告资源', href: '/media' },
  { name: 'AI方案', href: '/ai-chat' },
  { name: '投放案例', href: '/cases' },
  { name: '投放研究', href: '/articles' },
  { name: '供应商后台', href: '/supplier' },
  { name: '关于平台', href: '/about' },
]

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showMobileAuth, setShowMobileAuth] = useState(false)
  const isSupplier = user?.role === 'supplier'

  useEffect(() => {
    // 清理旧style标签（防止之前用createElement方式注入的残留）
    const oldStyleIds = ['supplier-layout-hide', 'supplier-entry-hide']
    oldStyleIds.forEach(id => {
      const el = document.getElementById(id)
      if (el && (el as HTMLStyleElement).tagName === 'STYLE') {
        el.remove()
      }
    })

    setMounted(true)
    setShowMobileAuth(true)
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('supplier_user')
    setUser(null)
    window.location.href = '/'
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">青媒</span>
            </div>
            <span className="text-base font-bold text-gray-900 hidden sm:inline">青海全媒体广告平台</span>
          </Link>

          {/* Desktop Nav - 始终可见无需JS */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                {item.name}
              </Link>
            ))}
            {isSupplier && (
              <Link href="/supplier/dashboard"
                className="px-3 py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                供应商中心
              </Link>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {mounted ? (user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{isSupplier ? '供应商' : user.name || user.phone}</span>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">退出</button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">登录</Link>
                <Link href="/register"><button className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">注册</button></Link>
              </>
            )) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">登录</Link>
                <Link href="/register"><button className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">注册</button></Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-3">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className="py-2.5 px-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}>{item.name}</Link>
              ))}
              {isSupplier && (
                <Link href="/supplier/dashboard" className="py-2.5 px-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}>
                  <LayoutDashboard className="w-4 h-4 inline mr-1.5" />供应商中心
                </Link>
              )}
              {mounted ? (user ? (
                <div className="pt-3 mt-2 border-t border-gray-100">
                  <div className="px-3 text-sm text-gray-500 mb-2">{user.name || user.phone}</div>
                  <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 text-sm text-red-500 hover:bg-red-50 rounded-lg">退出登录</button>
                </div>
              ) : (
                <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}><button className="w-full py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">登录</button></Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}><button className="w-full py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90">注册</button></Link>
                </div>
              )) : (
                <div className="pt-3 mt-2 border-t border-gray-100 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}><button className="w-full py-2.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">登录</button></Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}><button className="w-full py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90">注册</button></Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
