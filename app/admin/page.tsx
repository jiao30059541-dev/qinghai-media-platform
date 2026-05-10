// app/admin/page.tsx - 管理后台仪表盘（集成到admin layout）
'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Users, DollarSign, ShoppingBag, Monitor, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard-stats')
      if (res.ok) {
        const data = await res.json()
        if (data.success) setStats(data.data || {})
      }
    } catch {}
  }

  const cards = [
    { label: '总用户数', value: stats.total_clients || 0, icon: Users, color: 'blue' },
    { label: '供应商', value: stats.total_suppliers || 0, icon: TrendingUp, color: 'green' },
    { label: '广告资源', value: stats.total_media || 0, icon: Monitor, color: 'purple' },
    { label: '总订单', value: stats.total_orders || 0, icon: ShoppingBag, color: 'orange' },
  ]

  return (
    <div>
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          const colorMap: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          }
          return (
            <div key={card.label} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${colorMap[card.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{card.label}</dt>
                      <dd>
                        <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 快捷入口 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/admin/users" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-700">用户管理</span>
          </a>
          <a href="/admin/orders" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
            <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-700">订单管理</span>
          </a>
          <a href="/admin/media" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
            <Monitor className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-700">媒体资源</span>
          </a>
          <a href="/admin/settings" className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors">
            <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-orange-700">系统设置</span>
          </a>
        </div>
      </div>
    </div>
  )
}
