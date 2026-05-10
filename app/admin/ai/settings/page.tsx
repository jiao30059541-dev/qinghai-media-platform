// app/admin/ai/settings/page.tsx - AI运营设置页面
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Save, RefreshCw, FileText, Clock, Activity,
  CheckCircle, AlertTriangle, Sliders, Globe, Zap,
  Eye, Star, Sparkles, ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface SettingItem {
  key: string
  label: string
  type: 'number' | 'boolean' | 'time'
  defaultValue: string
  value: string
}

export default function AdminAISettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({})
  const [notif, setNotif] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

  const getToken = () => localStorage.getItem('adminToken') || localStorage.getItem('token') || ''

  const showNotif = (type: 'success' | 'error', msg: string) => {
    setNotif({ type, msg })
    setTimeout(() => setNotif(null), 3000)
  }

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/settings', {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const json = await res.json()
      if (json.success) setSettings(json.data.settings)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    if (Object.keys(editedSettings).length === 0) {
      showNotif('error', '没有更改')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/ai/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ settings: editedSettings })
      })
      const json = await res.json()
      if (json.success) {
        showNotif('success', json.message)
        setEditedSettings({})
        fetchSettings()
      } else {
        showNotif('error', json.message)
      }
    } catch (err) {
      showNotif('error', '保存失败')
    }
    finally { setSaving(false) }
  }

  const handleChange = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }))
  }

  const getValue = (item: SettingItem) => {
    if (item.key in editedSettings) return editedSettings[item.key]
    return item.value
  }

  // 按类别分组设置
  const basicSettings = settings.filter(s =>
    ['daily_content_count', 'auto_publish', 'require_review'].includes(s.key)
  )
  const scheduleSettings = settings.filter(s =>
    ['content_schedule_1', 'content_schedule_2', 'content_schedule_3'].includes(s.key)
  )
  const ratioSettings = settings.filter(s =>
    ['content_ratio_industry', 'content_ratio_local', 'content_ratio_case'].includes(s.key)
  )
  const featureSettings = settings.filter(s =>
    ['hot_topic_enabled', 'lead_scoring_enabled', 'keyword_auto_generate'].includes(s.key)
  )

  const hasChanges = Object.keys(editedSettings).length > 0

  return (
    <div className="p-6">
      {/* 通知 */}
      {notif && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-lg text-sm font-medium flex items-center gap-2 ${
            notif.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {notif.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {notif.msg}
        </motion.div>
      )}

      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <a href="/admin/ai" className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              AI运营设置
            </h1>
          </div>
          <p className="text-gray-500 ml-11">配置AI内容生成、发布计划和功能开关</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" />
            刷新
          </Button>
          <Button
            variant="primary"
            size="sm"
            className={cn('rounded-xl', hasChanges ? 'bg-gradient-to-r from-primary to-blue-600' : '')}
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            <Save className="w-4 h-4 mr-1" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* 主设置面板 */}
          <div className="col-span-2 space-y-6">
            {/* 基本设置 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-500" /> 基本设置
              </h3>
              <div className="space-y-4">
                {basicSettings.map(item => (
                  <SettingRow
                    key={item.key}
                    item={item}
                    value={getValue(item)}
                    onChange={handleChange}
                    editedKeys={editedSettings}
                  />
                ))}
              </div>
            </div>

            {/* 内容比例 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" /> 内容比例配置
              </h3>
              <p className="text-sm text-gray-400 mb-4">三种内容类型每天的生成比例分配（总和应为100%）</p>
              <div className="space-y-4">
                {ratioSettings.map(item => (
                  <SettingRow
                    key={item.key}
                    item={item}
                    value={getValue(item)}
                    onChange={handleChange}
                    editedKeys={editedSettings}
                  />
                ))}
                {/* 比例进度条 */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500 mb-2">当前比例</div>
                  <div className="flex h-3 rounded-full overflow-hidden">
                    {ratioSettings.map((item, i) => {
                      const val = parseInt(getValue(item)) || 0
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500']
                      const labels = ['行业知识', '本地媒体', '投放案例']
                      return (
                        <div
                          key={item.key}
                          className={`${colors[i]} h-full transition-all`}
                          style={{ width: `${val}%` }}
                          title={`${labels[i]}: ${val}%`}
                        />
                      )
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    {ratioSettings.map((item, i) => {
                      const labels = ['行业知识', '本地媒体', '投放案例']
                      return <span key={item.key}>{labels[i]}: {getValue(item)}%</span>
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 发布时间 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" /> 发布时间计划
              </h3>
              <p className="text-sm text-gray-400 mb-4">设置每天自动发布内容的时间点</p>
              <div className="space-y-4">
                {scheduleSettings.map((item, i) => (
                  <SettingRow
                    key={item.key}
                    item={item}
                    value={getValue(item)}
                    onChange={handleChange}
                    prefix={`#${i + 1} `}
                    editedKeys={editedSettings}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 右侧面板 */}
          <div className="space-y-6">
            {/* 功能开关 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> 功能开关
              </h3>
              <div className="space-y-4">
                {featureSettings.map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <div className="text-sm text-gray-700">{item.label}</div>
                    <button
                      onClick={() => handleChange(item.key, getValue(item) === 'true' ? 'false' : 'true')}
                      className={cn(
                        'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                        getValue(item) === 'true' ? 'bg-blue-600' : 'bg-gray-300'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                          getValue(item) === 'true' ? 'translate-x-5' : ''
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 快速操作 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> 快速操作
              </h3>
              <div className="space-y-3">
                <a
                  href="/admin/ai"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-xl text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> 查看Dashboard</span>
                  <span>→</span>
                </a>
                <a
                  href="/admin/ai"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-xl text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> 配置内容生成</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* 当前配置摘要 */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" /> 当前配置摘要
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">每日发文</span>
                  <span className="font-medium">{settings.find(s => s.key === 'daily_content_count')?.value || '-'}篇</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">自动发布</span>
                  <span className={cn('font-medium', settings.find(s => s.key === 'auto_publish')?.value === 'true' ? 'text-green-600' : 'text-yellow-600')}>
                    {settings.find(s => s.key === 'auto_publish')?.value === 'true' ? '开启' : '关闭'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">人工审核</span>
                  <span className={cn('font-medium', settings.find(s => s.key === 'require_review')?.value === 'true' ? 'text-green-600' : 'text-gray-600')}>
                    {settings.find(s => s.key === 'require_review')?.value === 'true' ? '需要' : '不需要'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">热点追踪</span>
                  <span className={cn('font-medium', settings.find(s => s.key === 'hot_topic_enabled')?.value === 'true' ? 'text-green-600' : 'text-gray-400')}>
                    {settings.find(s => s.key === 'hot_topic_enabled')?.value === 'true' ? '已开启' : '已关闭'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingRow({
  item,
  value,
  onChange,
  prefix,
  editedKeys,
}: {
  item: SettingItem
  value: string
  onChange: (key: string, value: string) => void
  prefix?: string
  editedKeys?: Record<string, string>
}) {
  const isEdited = editedKeys ? item.key in editedKeys : false

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          {prefix}{item.label}
        </div>
        <div className="text-xs text-gray-400 font-mono">{item.key}</div>
      </div>
      <div className="flex items-center gap-3">
        {item.type === 'boolean' ? (
          <button
            onClick={() => onChange(item.key, value === 'true' ? 'false' : 'true')}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              value === 'true' ? 'bg-blue-600' : 'bg-gray-300'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                value === 'true' ? 'translate-x-5' : ''
              )}
            />
          </button>
        ) : item.type === 'time' ? (
          <input
            type="time"
            value={value}
            onChange={e => onChange(item.key, e.target.value)}
            className="w-32 rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-center"
          />
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={e => onChange(item.key, e.target.value)}
              className="w-20 text-right rounded-xl border border-gray-200 px-3 py-1.5 text-sm"
              min={item.key.includes('ratio') ? 0 : undefined}
              max={item.key.includes('ratio') ? 100 : undefined}
            />
            {item.key.includes('ratio') && <span className="text-xs text-gray-400">%</span>}
          </div>
        )}
        {isEdited && (
          <span className="w-2 h-2 rounded-full bg-blue-500" title="已修改" />
        )}
      </div>
    </div>
  )
}
