// app/admin/settings/page.tsx - 系统设置页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Settings, Save, RefreshCw, Shield, Database, Server,
  Bell, Lock, Globe, Mail, Sliders, Clock, Activity,
  CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Users, Key, Terminal, Upload, Download, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, any[]>>({})
  const [systemInfo, setSystemInfo] = useState<any>({})
  const [systemStatus, setSystemStatus] = useState<any>({})
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedSettings, setEditedSettings] = useState<Record<string, any>>({})
  const [notif, setNotif] = useState<{ type: 'success' | 'error', msg: string } | null>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [maintaining, setMaintaining] = useState(false)

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotif({ type, msg })
    setTimeout(() => setNotif(null), 3000)
  }

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const params = activeCategory !== 'all' ? `?category=${activeCategory}` : ''
      const res = await fetch(`/api/admin/settings${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const data = await res.json()
      if (data.success) {
        setSettings(data.data.settings || {})
        setSystemInfo(data.data.systemInfo || {})
        setSystemStatus(data.data.systemStatus || {})
        setRecentLogs(data.data.recentLogs || [])
        setCategories(data.data.categories || [])
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [activeCategory])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    if (Object.keys(editedSettings).length === 0) { showNotif('error', '没有更改'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ settings: editedSettings, category: activeCategory })
      })
      const data = await res.json()
      if (data.success) { showNotif('success', data.message); setEditedSettings({}); fetchSettings() }
      else showNotif('error', data.message)
    } catch (err) { showNotif('error', '保存失败') }
    finally { setSaving(false) }
  }

  const handleMaintenance = async (action: string) => {
    setMaintaining(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ action })
      })
      const data = await res.json()
      if (data.success) {
        showNotif('success', data.message)
        if (action === 'test_connections') setSystemHealth(data.data.connections)
        fetchSettings()
      } else showNotif('error', data.message)
    } catch (err) { showNotif('error', '操作失败') }
    finally { setMaintaining(false) }
  }

  const tabCategories = [
    { id: 'all', label: '全部', icon: Sliders },
    { id: 'general', label: '通用', icon: Globe },
    { id: 'notification', label: '通知', icon: Bell },
    { id: 'security', label: '安全', icon: Lock },
    { id: 'payment', label: '支付', icon: CreditCard },
    { id: 'system', label: '系统', icon: Server },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">系统设置</h1>
          <p className="text-gray-500">管理系统配置、维护和权限</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleMaintenance('test_connections')} disabled={maintaining}>
            <Activity className="w-4 h-4 mr-1" /> 检测连接
          </Button>
          <Button variant="primary" size="sm" className="rounded-xl bg-blue-600" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? '保存中...' : '保存更改'}
          </Button>
        </div>
      </div>

      {notif && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2 ${
            notif.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {notif.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {notif.msg}
        </motion.div>
      )}

      {/* System Status */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: '数据库', status: systemStatus?.database || 'connected', healthy: systemStatus?.database === 'connected' },
          { label: 'API服务', status: systemStatus?.api || 'running', healthy: systemStatus?.api === 'running' },
          { label: '缓存', status: systemStatus?.cache || 'enabled', healthy: systemStatus?.cache === 'enabled' },
          { label: '存储', status: systemStatus?.storage || 'normal', healthy: systemStatus?.storage === 'normal' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{s.label}</span>
              <span className={cn('w-2.5 h-2.5 rounded-full', s.healthy ? 'bg-green-500' : 'bg-red-500')} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{s.healthy ? '正常' : '异常'}</span>
              <span className="text-xs text-gray-400">{s.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-4 mb-6">
        {tabCategories.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.id} onClick={() => setActiveCategory(tab.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all',
                activeCategory === tab.id ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              )}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-700 mb-4">配置项</h3>
          {loading ? (
            <p className="text-center py-12 text-gray-400">加载中...</p>
          ) : Object.keys(settings).length === 0 ? (
            <p className="text-center py-12 text-gray-400">暂无配置项</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(settings).map(([cat, items]) => (
                <div key={cat}>
                  <h4 className="text-sm font-medium text-gray-400 uppercase mb-3">{cat}</h4>
                  {items.map((item: any) => (
                    <div key={item.key_name || item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.description || item.key_name}</div>
                        <div className="text-xs text-gray-400 font-mono">{item.key_name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.data_type === 'boolean' ? (
                          <button onClick={() => setEditedSettings({ ...editedSettings, [item.key_name]: !(editedSettings[item.key_name] ?? JSON.parse(item.value || 'false')) })}
                            className={cn(
                              'w-12 h-6 rounded-full transition-colors relative',
                              (editedSettings[item.key_name] ?? JSON.parse(item.value || 'false')) ? 'bg-blue-600' : 'bg-gray-300'
                            )}>
                            <span className={cn(
                              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                              (editedSettings[item.key_name] ?? JSON.parse(item.value || 'false')) ? 'translate-x-6' : ''
                            )} />
                          </button>
                        ) : item.data_type === 'number' ? (
                          <input type="number" defaultValue={item.value || 0}
                            onChange={e => setEditedSettings({ ...editedSettings, [item.key_name]: e.target.value })}
                            className="w-24 text-right rounded-xl border border-gray-200 px-3 py-1.5 text-sm" />
                        ) : (
                          <input defaultValue={item.value || ''}
                            onChange={e => setEditedSettings({ ...editedSettings, [item.key_name]: e.target.value })}
                            className="w-48 text-right rounded-xl border border-gray-200 px-3 py-1.5 text-sm" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info & Recent Logs */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" /> 系统信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">数据库版本</span>
                <span className="font-medium">{systemInfo.database?.version || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">数据表数</span>
                <span className="font-medium">{systemInfo.database?.count || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">用户数</span>
                <span className="font-medium">{systemInfo.users?.count || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">订单数</span>
                <span className="font-medium">{systemInfo.orders?.count || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">媒体资源</span>
                <span className="font-medium">{systemInfo.media?.count || 0}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">运行时间</span>
                  <span className="font-medium">{Math.floor((systemStatus?.uptime || 0) / 3600)}小时</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-500" /> 维护操作
            </h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-between rounded-xl" onClick={() => handleMaintenance('clear_cache')} disabled={maintaining}>
                <span className="flex items-center gap-2"><Trash2 className="w-4 h-4" /> 清理缓存</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-between rounded-xl" onClick={() => handleMaintenance('optimize_tables')} disabled={maintaining}>
                <span className="flex items-center gap-2"><Database className="w-4 h-4" /> 优化数据库</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-between rounded-xl" onClick={() => handleMaintenance('backup_database')} disabled={maintaining}>
                <span className="flex items-center gap-2"><Download className="w-4 h-4" /> 备份数据库</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-between rounded-xl" onClick={() => handleMaintenance('cleanup_logs')} disabled={maintaining}>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 清理旧日志</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-500" /> 最近操作日志
        </h3>
        {recentLogs.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentLogs.map((log: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-8">{log.id}</span>
                  <div>
                    <span className="text-sm text-gray-700">{log.action || '-'}</span>
                    <span className="text-xs text-gray-400 ml-2">{log.target_type || ''}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {log.created_at ? new Date(log.created_at).toLocaleString('zh-CN') : '-'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400">暂无操作日志</p>
        )}
      </div>
    </div>
  )
}

function CreditCard(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
