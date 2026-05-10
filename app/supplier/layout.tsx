// app/supplier/layout.tsx - 供应商中心布局 (修复侧边栏排版)
'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Monitor, Plus, ShoppingCart, ChevronLeft, Menu, X, LogOut, Building2, Loader2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { name: '工作台', href: '/supplier/dashboard', icon: LayoutDashboard },
  { name: '我的资源', href: '/supplier/media', icon: Monitor },
  { name: '上传资源', href: '/supplier/media/new', icon: Plus },
  { name: '投放案例', href: '/supplier/cases', icon: TrendingUp },
  { name: '我的订单', href: '/supplier/orders', icon: ShoppingCart },
]

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Public routes: no auth required
  const isPublicRoute = pathname === '/supplier'

  useEffect(() => {
    setMounted(true)

    // 给 body 加类名控制主站 header/footer 隐藏，确保退出时自动恢复
    document.body.classList.add('supplier-layout-active')

    if (isPublicRoute) { setLoading(false); return }

    try {
      const stored = localStorage.getItem('supplier_user')
      if (stored) {
        setUser(JSON.parse(stored))
        setLoading(false)
      } else {
        const token = localStorage.getItem('token')
        if (token) {
          fetch('/api/supplier/me', { headers: { 'Authorization': 'Bearer ' + token } })
            .then(r => r.json())
            .then(d => {
              if (d.success) { localStorage.setItem('supplier_user', JSON.stringify(d.data)); setUser(d.data) }
              else router.push('/login')
            })
            .catch(() => router.push('/login'))
            .finally(() => setLoading(false))
        } else { router.push('/login'); setLoading(false) }
      }
    } catch { router.push('/login'); setLoading(false) }

    // 离开时清理
    return () => {
      document.body.classList.remove('supplier-layout-active')
    }
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('supplier_user'); localStorage.removeItem('token'); localStorage.removeItem('user')
    router.push('/login')
  }

  if (isPublicRoute) {
    return <>{children}</>
  }

  if (!mounted || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" /><p className="text-gray-500">加载中...</p></div>
    </div>
  )

  const sidebarWidth = collapsed ? 72 : 256

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 flex flex-col shadow-sm max-md:hidden"
      >
        <div className="h-16 flex items-center px-4 border-b border-gray-100 flex-shrink-0">
          {collapsed ? (
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">青</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">青媒</span>
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-gray-900 text-sm truncate">供应商中心</div>
                <div className="text-xs text-gray-400 truncate">{user?.supplier?.company_name || ''}</div>
              </div>
            </div>
          )}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/supplier/media' && (pathname.startsWith('/supplier/media/') || pathname === '/supplier/media'))
            return (
              <Link key={item.href} href={item.href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium transition-all',
                  isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 p-2 space-y-1 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-gray-600 hover:bg-gray-100 transition-all">
            <Building2 className="w-5 h-5 flex-shrink-0" />{!collapsed && <span className="text-sm whitespace-nowrap">返回主站</span>}
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />{!collapsed && <span className="text-sm whitespace-nowrap">退出登录</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-gray-600 transition-all">
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <motion.aside
        animate={{ x: mobileSidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-gray-200 z-50 flex flex-col shadow-xl md:hidden"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">青媒</span>
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-gray-900 text-sm truncate">供应商中心</div>
              <div className="text-xs text-gray-400 truncate">{user?.supplier?.company_name || ''}</div>
            </div>
          </div>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === '/supplier/media' && (pathname.startsWith('/supplier/media/') || pathname === '/supplier/media'))
            return (
              <Link key={item.href} href={item.href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-2xl font-medium transition-all',
                  isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 p-2 space-y-1 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-gray-600 hover:bg-gray-100 transition-all">
            <Building2 className="w-5 h-5" /><span className="text-sm">返回主站</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-5 h-5" /><span className="text-sm">退出登录</span>
          </button>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className={cn(
        'transition-all duration-300 min-h-screen flex flex-col',
        'max-md:ml-0',     // No sidebar padding on mobile
        'md:ml-[256px]',   // Expanded sidebar
        collapsed && 'md:ml-[72px]'  // Collapsed sidebar
      )}>
        {/* Top header bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Menu className="w-5 h-5" />
            </button>
            {/* Desktop collapse button */}
            <button onClick={() => setCollapsed(!collapsed)} className="max-md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-gray-400 hidden sm:block">
              {sidebarItems.find(i => pathname.startsWith(i.href))?.name || '供应商中心'}
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full text-sm">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.supplier?.company_name?.[0] || '供'}
              </div>
              <span className="text-gray-700 truncate max-w-[120px] sm:max-w-none">
                {user?.supplier?.company_name || ''}
              </span>
            </div>
          )}
        </header>
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
