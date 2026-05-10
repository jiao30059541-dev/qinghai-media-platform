// components/AiMediaParser.tsx - AI智能识别广告资源册子
// 上传图片/PDF → AI识别 → 预填表单 → 用户确认编辑
'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Image, Loader2, CheckCircle, AlertCircle, Sparkles, X, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParsedMedia {
  name: string
  city: string
  address: string
  category_level2: string
  size: string
  resolution: string
  daily_exposure: number
  list_price: number
  deal_price: number
  description: string
  lighting: string
  orientation: string
  images_found: number
}

interface AiMediaParserProps {
  onParsed: (data: ParsedMedia) => void
  onCancel: () => void
}

const mediaTypeOptions = [
  'LED大屏', '户外大牌', '墙体广告', '电梯广告',
  '道闸广告', '公交广告', '机场广告', '电视广告', '数字广告', '社区广告',
]

export default function AiMediaParser({ onParsed, onCancel }: AiMediaParserProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [result, setResult] = useState<ParsedMedia | null>(null)
  const [error, setError] = useState('')
  const [isMock, setIsMock] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<ParsedMedia | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError('')
    setResult(null)
    setIsMock(false)

    // 生成预览
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  const handleParse = async () => {
    if (!file) {
      setError('请先选择文件')
      return
    }

    setParsing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/supplier/media/ai-parse', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + (localStorage.getItem('token') || ''),
        },
        body: formData,
      })

      const data = await res.json()
      if (!data.success) {
        setError(data.message || '识别失败')
        return
      }

      setResult(data.data)
      setEditForm({ ...data.data })
      setIsMock(!!data.isMock)

      // 自动填充到父组件
      if (!data.isMock) {
        onParsed(data.data)
      }
    } catch (e: any) {
      setError('网络错误，请重试')
    } finally {
      setParsing(false)
    }
  }

  const handleEditConfirm = () => {
    if (editForm) {
      onParsed(editForm)
    }
  }

  const handleEditChange = (field: keyof ParsedMedia, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  // 文件选择区域
  if (!file) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border-2 border-dashed border-blue-200 shadow-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">AI智能识别</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            上传广告资源图片或PDF手册，AI自动识别并填写资源信息
          </p>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold text-lg"
            >
              <Upload className="w-5 h-5" />
              选择图片或PDF
            </button>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Image className="w-4 h-4" /> JPG/PNG/WebP</span>
              <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> PDF</span>
              <span>最大 10MB</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-sm">
              跳过AI识别，手动填写 →
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // 文件已选，等待识别
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      {/* 文件信息 */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            file.type === 'application/pdf' ? 'bg-red-50' : 'bg-blue-50'
          )}>
            {file.type === 'application/pdf'
              ? <FileText className="w-6 h-6 text-red-500" />
              : <Image className="w-6 h-6 text-blue-500" />
            }
          </div>
          <div>
            <p className="font-medium text-gray-900 truncate max-w-[200px]">{file.name}</p>
            <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
          </div>
        </div>
        <button onClick={() => { setFile(null); setPreview(null); setResult(null) }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 预览 */}
      {preview && !result && (
        <div className="mb-6 rounded-2xl overflow-hidden bg-gray-50">
          <img src={preview} alt="预览" className="w-full h-48 object-contain" />
        </div>
      )}

      {/* 识别按钮 / 加载状态 */}
      {!result && !parsing && (
        <button onClick={handleParse}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white py-3.5 rounded-2xl hover:shadow-lg font-semibold transition-all">
          <Sparkles className="w-5 h-5" />
          AI识别资源信息
        </button>
      )}

      {parsing && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-600 font-medium">AI正在分析资源册子...</p>
          <p className="text-sm text-gray-400 mt-1">正在提取名称、城市、价格等信息</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>{error}</p>
            <button onClick={() => { setFile(null); setError('') }}
              className="text-sm text-red-700 underline mt-1 inline-block">
              重新选择文件
            </button>
          </div>
        </div>
      )}

      {/* 识别结果预览 */}
      {result && editForm && (
        <div className="space-y-4">
          {isMock && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>注意：</strong>AI服务暂不可用，以下为模拟数据。请手动填写或点击确认后编辑。
              </div>
            </div>
          )}
          {!isMock && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              AI识别完成，已识别 {result.images_found || 1} 个资源信息
            </div>
          )}

          {/* 编辑表单 */}
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <FieldEdit label="资源名称" value={editForm.name}
                onChange={v => handleEditChange('name', v)} required />
              <FieldEdit label="所在城市" value={editForm.city}
                onChange={v => handleEditChange('city', v)} required />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">媒体类型</label>
                <select value={editForm.category_level2}
                  onChange={e => handleEditChange('category_level2', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">请选择</option>
                  {mediaTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <FieldEdit label="尺寸" value={editForm.size}
                onChange={v => handleEditChange('size', v)} placeholder="如：12m×6m" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <FieldEdit label="挂牌价(元/天)" value={String(editForm.list_price || '')}
                onChange={v => handleEditChange('list_price', Number(v) || 0)} type="number" />
              <FieldEdit label="成交价(元/天)" value={String(editForm.deal_price || '')}
                onChange={v => handleEditChange('deal_price', Number(v) || 0)} type="number" />
              <FieldEdit label="日曝光量" value={String(editForm.daily_exposure || '')}
                onChange={v => handleEditChange('daily_exposure', Number(v) || 0)} type="number" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">资源描述</label>
              <textarea value={editForm.description}
                onChange={e => handleEditChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button onClick={() => onParsed(editForm)}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl hover:bg-primary/90 font-semibold transition-all">
              <CheckCircle className="w-4 h-4" />
              确认并使用这些信息
            </button>
            <button onClick={() => { setFile(null); setPreview(null); setResult(null); setEditForm(null) }}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all">
              重新上传
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// 内联编辑字段
function FieldEdit({ label, value, onChange, placeholder, required, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}
