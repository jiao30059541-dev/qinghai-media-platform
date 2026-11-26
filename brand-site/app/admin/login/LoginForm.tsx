'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Loader2, LockKeyhole } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || '登录失败')
      router.replace(nextPath)
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '登录失败')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-9 grid gap-5">
      <label className="grid gap-2 text-xs font-bold text-white/65">
        管理员邮箱
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="min-h-12 border border-white/15 bg-white/[0.06] px-4 text-sm text-white outline-none focus:border-signal"
          placeholder="admin@xnmytx.com"
        />
      </label>
      <label className="grid gap-2 text-xs font-bold text-white/65">
        密码
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-12 border border-white/15 bg-white/[0.06] px-4 text-sm text-white outline-none focus:border-signal"
          placeholder="输入后台密码"
        />
      </label>
      {error && <p className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex min-h-12 items-center justify-center gap-2 bg-signal px-6 text-sm font-black text-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        {loading ? '正在验证' : '进入后台'}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  )
}
