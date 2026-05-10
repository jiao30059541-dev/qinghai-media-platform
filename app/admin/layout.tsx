// app/admin/layout.tsx - 专业后台管理布局
'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, Users, DollarSign, Monitor, Settings,
  LogOut, Menu, X, TrendingUp, Package, Shield, BarChart3, FileText,
  MessageSquare, Bell, Search, ChevronDown, Home, Calendar, Target,
  Zap, CreditCard, Building, MapPin, Tag, Eye, Star, Activity, Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: '仪表盘', href: '/admin', icon: LayoutDashboard, current: true },
  { name: '订单管理', href: '/admin/orders', icon: ShoppingBag, current: false },
  { name: '用户管理', href: '/admin/users', icon: Users, current: false },
  { name: '媒体资源', href: '/admin/media', icon: Monitor, current: false },
  { name: '财务管理', href: '/admin/finance', icon: DollarSign, current: false },
  { name: '供应商', href: '/admin/suppliers', icon: Building, current: false },
  { name: '数据分析', href: '/admin/analytics', icon: BarChart3, current: false },
  { name: '系统设置', href: '/admin/settings', icon: Settings, current: false },
  { name: '报表管理', href: '/admin/reports', icon: FileText, current: false },
  { name: 'A/B测试', href: '/admin/ab-tests', icon: Target, current: false },
  { name: '系统监控', href: '/admin/monitoring', icon: Activity, current: false },
  { name: 'AI运营中心', href: '/admin/ai', icon: Brain, current: false },
]

const stats = [
  { name: '今日订单', value: '12', change: '+4', changeType: 'positive' },
  { name: '今日收入', value: '¥28,450', change: '+12%', changeType: 'positive' },
  { name: '待处理', value: '8', change: '-2', changeType: 'negative' },
  { name: '用户增长', value: '24', change: '+8%', changeType: 'positive' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // 更新导航项的当前状态
  const updatedNavigation = navigation.map(item => ({
    ...item,
    current: pathname === item.href || pathname.startsWith(item.href + '/')
  }))

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRole')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('supplier_user')
    localStorage.removeItem('supplierToken')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端侧边栏 */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-50 flex">
          {/* 遮罩层 */}
          <div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* 侧边栏 */}
          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">关闭侧边栏</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-primary" />
                  <span className="ml-3 text-xl font-bold text-gray-900">广告平台管理</span>
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {updatedNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      item.current
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={cn(
                        item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-4 flex-shrink-0 h-6 w-6'
                      )}
                    />
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">管理员</p>
                  <p className="text-sm font-medium text-gray-500">admin@qinghai-ad.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 桌面端侧边栏 */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-primary" />
                <span className="ml-3 text-xl font-bold text-gray-900">广告平台管理</span>
              </div>
            </div>
            
            <nav className="mt-8 flex-1 px-4 space-y-1">
              {updatedNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    item.current
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors'
                  )}
                >
                  <item.icon
                    className={cn(
                      item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-5 w-5'
                    )}
                  />
                  {item.name}
                  {item.name === '订单管理' && (
                    <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      8
                    </span>
                  )}
                </a>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">管理员</p>
                <p className="text-xs text-gray-500">admin@qinghai-ad.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                title="退出登录"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* 顶部导航栏 */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">打开侧边栏</span>
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full max-w-lg lg:max-w-xs">
                <label htmlFor="search" className="sr-only">
                  搜索
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="搜索订单、用户、广告位..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center lg:ml-6 space-x-4">
              <button className="p-1 text-gray-400 hover:text-gray-500 relative">
                <span className="sr-only">查看通知</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>
              
              <button className="p-1 text-gray-400 hover:text-gray-500">
                <span className="sr-only">消息</span>
                <MessageSquare className="h-6 w-6" />
              </button>
              
              {/* 用户菜单 */}
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <span className="sr-only">打开用户菜单</span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white font-medium">A</span>
                    </div>
                    <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                  </button>
                </div>
                
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <span className="block px-4 py-2 text-xs text-gray-400 border-b border-gray-100">
                      管理员
                    </span>
                    <a
                      href="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      系统设置
                    </a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 mt-1 pt-2"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 页面内容 */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* 页面标题 */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {updatedNavigation.find(item => item.current)?.name || '仪表盘'}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  管理广告平台的所有业务数据
                </p>
              </div>
              
              {/* 统计卡片 - 仅在仪表盘显示 */}
              {pathname === '/admin' && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                  <div
                    key={stat.name}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {stat.name}
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {stat.value}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                      <div className="text-sm">
                        <span className={cn(
                          'font-medium',
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {stat.changeType === 'positive' ? '+' : '-'}
                          {stat.change}
                        </span>
                        <span className="text-gray-500 ml-2">较昨日</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
              
              {/* 主内容 */}
              <div className="bg-white shadow rounded-lg">
                {children}
              </div>
            </div>
          </div>
        </main>
        
        {/* 页脚 */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2024 青海全媒体广告平台. 保留所有权利.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  隐私政策
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  服务条款
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  帮助中心
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}