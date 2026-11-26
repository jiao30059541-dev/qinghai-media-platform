'use client'

import { useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'

export default function ImageUploadField({
  name,
  defaultValue = '',
  label,
}: {
  name: string
  defaultValue?: string
  label: string
}) {
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function upload(file?: File) {
    if (!file) return
    setLoading(true)
    setError('')
    const form = new FormData()
    form.set('file', file)
    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const result = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !result.url) throw new Error(result.error || '上传失败')
      setValue(result.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '上传失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-2 text-xs font-bold text-black/60">
      <span>{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? <img src={value} alt="" className="h-20 w-20 border border-black/10 bg-white object-contain p-1" /> : <span className="grid h-20 w-20 place-items-center border border-dashed border-black/20 bg-white text-black/25"><ImagePlus className="h-6 w-6" /></span>}
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-black/15 bg-white px-4 text-xs font-black hover:border-signal">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {loading ? '上传中' : '上传图片'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => upload(event.target.files?.[0])}
          />
        </label>
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="/uploads/wechat-qr.png"
          className="admin-input max-w-[360px] text-sm font-normal"
        />
      </div>
      {error && <span className="text-xs text-signal">{error}</span>}
    </div>
  )
}
