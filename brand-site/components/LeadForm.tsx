'use client'

import { FormEvent, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'

export default function LeadForm({
  source = 'website',
  defaultScreen,
}: {
  source?: string
  defaultScreen?: string
}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const startedAt = useRef(Date.now())

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setMessage('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, source, formStartedAt: startedAt.current }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || '提交失败')
      setStatus('success')
      setMessage('已收到，我们会尽快联系你。')
      event.currentTarget.reset()
    } catch {
      setStatus('error')
      setMessage('暂时无法提交，请直接拨打电话联系。')
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          姓名
          <input className="form-field font-normal" name="name" required placeholder="怎么称呼你" />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          手机
          <input
            className="form-field font-normal"
            name="phone"
            required
            inputMode="tel"
            pattern="1[3-9][0-9]{9}"
            placeholder="用于接收投放方案"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          意向屏幕
          <select className="form-field font-normal" name="screenInterest" defaultValue={defaultScreen || ''}>
            <option value="">请选择</option>
            <option value="guomao">国贸大厦 LED 屏</option>
            <option value="hengrun">恒润大厦 LED 屏</option>
            <option value="both">双屏联动方案</option>
            <option value="unsure">需要选屏建议</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          计划投放月份
          <input className="form-field font-normal" type="month" name="campaignDate" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        公司与需求
        <textarea
          className="form-field font-normal"
          name="message"
          placeholder="品牌、行业、预算范围或传播目标"
        />
      </label>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary mt-1 disabled:cursor-wait disabled:opacity-70"
      >
        {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {status === 'sending' ? '正在提交' : '提交投放需求'}
      </button>
      {message && (
        <p
          className={`text-sm font-semibold ${
            status === 'success' ? 'text-emerald-700' : 'text-signal'
          }`}
          role="status"
        >
          {message}
        </p>
      )}
      <p className="text-xs leading-6 text-black/40">
        提交即表示同意我们为本次咨询联系你。信息仅用于投放方案沟通，不对外公开。
      </p>
    </form>
  )
}
