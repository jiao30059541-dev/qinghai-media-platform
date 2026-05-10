'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Users, LayoutDashboard, TrendingUp, DollarSign, Monitor, Settings, LogOut, Loader2, AlertCircle } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  })

  // Simple admin login - check local role
  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true)
      setLoginError('')
      localStorage.setItem('adminRole', 'true')
    } else {
      setLoginError('\u7528\u6237\u540d\u6216\u5bc6\u7801\u9519\u8bef')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    setPassword('')
    localStorage.removeItem('adminRole')
  }

  // Check saved admin role on mount
  useEffect(() => {
    const saved = localStorage.getItem('adminRole')
    if (saved === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  // Fetch orders data
  useEffect(() => {
    if (!isLoggedIn) return
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        })
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setOrders(json.data)
          setStats({
            totalOrders: json.data.length,
            totalRevenue: json.data.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
            pendingOrders: json.data.filter((o: any) => o.status === 'pending' || o.status === 'new').length,
            completedOrders: json.data.filter((o: any) => o.status === 'completed' || o.status === 'approved').length
          })
        } else if (json.orders) {
          const orderList = Array.isArray(json.orders) ? json.orders : []
          setOrders(orderList)
          setStats({
            totalOrders: orderList.length,
            totalRevenue: orderList.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0),
            pendingOrders: orderList.filter((o: any) => o.status === 'pending' || o.status === 'new').length,
            completedOrders: orderList.filter((o: any) => o.status === 'completed' || o.status === 'approved').length
          })
        } else {
          setOrders([])
        }
      } catch {
        // Use demo data if API fails
        setStats({
          totalOrders: 128,
          totalRevenue: 3680000,
          pendingOrders: 23,
          completedOrders: 95
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isLoggedIn])

  // Not logged in - show login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">{'\u540e\u53f0\u7ba1\u7406'}</h1>
            <p className="text-gray-600 mt-2">{'\u8bf7\u767b\u5f55\u540e\u7ba1\u7406\u5e73\u53f0'}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{'\u7528\u6237\u540d'}</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="admin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{'\u5bc6\u7801'}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="admin123" />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button onClick={handleLogin}
              className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              {'\u767b \u5f55'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">{'\u5e7f\u544a\u5e73\u53f0\u540e\u53f0\u7ba1\u7406'}</h1>
          </div>
          <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5 mr-1" />
            {'\u9000\u51fa\u767b\u5f55'}
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{'\u603b\u8ba2\u5355\u6570'}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{'\u603b\u8425\u6536'}</p>
                    <p className="text-3xl font-bold text-gray-900">{'\u00a5'}{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{'\u5f85\u5904\u7406'}</p>
                    <p className="text-3xl font-bold text-orange-500">{stats.pendingOrders}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-orange-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{'\u5df2\u5b8c\u6210'}</p>
                    <p className="text-3xl font-bold text-green-500">{stats.completedOrders}</p>
                  </div>
                  <LayoutDashboard className="w-10 h-10 text-green-500" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {'\u6700\u8fd1\u8ba2\u5355'}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{'\u5e7f\u544a\u4f4d'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{'\u91d1\u989d'}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{'\u72b6\u6001'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.length > 0 ? orders.slice(0, 10).map((order: any, i: number) => (
                        <tr key={order.id || i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">#{order.id || i + 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{order.media_name || order.name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{'\u00a5'}{(order.total_amount || order.price || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' || order.status === 'approved' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' || order.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>{order.status || '-'}</span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">{'\u6682\u65e0\u8ba2\u5355\u6570\u636e'}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    {'\u5e7f\u544a\u4f4d\u7ba1\u7406'}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">{'\u7ba1\u7406\u5e73\u53f0\u4e0a\u7684\u6240\u6709\u5e7f\u544a\u4f4d\u8d44\u6e90'}</p>
                  <button onClick={() => router.push('/media')} className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold">
                    {'\u8fdb\u5165\u5e7f\u544a\u4f4d\u7ba1\u7406'}
                  </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    {'\u7cfb\u7edf\u8bbe\u7f6e'}
                  </h2>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">{'\u7528\u6237\u7ba1\u7406'}</button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">{'\u89d2\u8272\u914d\u7f6e'}</button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">{'\u7cfb\u7edf\u65e5\u5fd7'}</button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">{'\u6570\u636e\u5907\u4efd'}</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
