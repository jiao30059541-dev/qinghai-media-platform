'use client'

import { useState } from 'react'

export default function FloatingContact() {
  const [expanded, setExpanded] = useState(false)
  const [showWechat, setShowWechat] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', budget: '', note: '' })

  const phone = '13997187771'
  const wechat = '13997187771'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } catch {}
    setSubmitted(true)
    setTimeout(() => {
      setShowForm(false)
      setSubmitted(false)
      setForm({ name: '', phone: '', budget: '', note: '' })
    }, 2500)
  }

  const bgColor = expanded ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'

  return (
    <>
      {(showWechat || showForm) && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => { setShowWechat(false); setShowForm(false) }}
        />
      )}

      {showWechat && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-8 w-72 text-center">
          <div className="text-2xl mb-2">💬</div>
          <div className="font-bold text-gray-800 text-lg mb-1">微信咨询</div>
          <div className="text-gray-500 text-sm mb-4">添加微信，免费获取投放方案</div>
          <div className="bg-green-50 border border-green-200 rounded-xl py-4 px-6 mb-4">
            <div className="text-xs text-gray-400 mb-1">微信号</div>
            <div className="text-xl font-bold text-green-600 tracking-wider">{wechat}</div>
          </div>
          <div className="text-xs text-gray-400">长按复制微信号添加好友</div>
          <button onClick={() => setShowWechat(false)} className="mt-4 text-gray-400 text-sm hover:text-gray-600">
            关闭
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-8 w-80">
          {submitted ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <div className="font-bold text-gray-800 text-lg">提交成功！</div>
              <div className="text-gray-500 text-sm mt-1">我们将在2小时内联系您</div>
            </div>
          ) : (
            <>
              <div className="font-bold text-gray-800 text-lg mb-1">免费获取投放方案</div>
              <div className="text-gray-400 text-sm mb-5">填写信息，专属顾问为您定制方案</div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  required
                  placeholder="您的姓名 *"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
                <input
                  required
                  placeholder="手机号码 *"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
                <select
                  value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-500 focus:outline-none focus:border-blue-400"
                >
                  <option value="">预算范围（选填）</option>
                  <option value="1-3万">1-3万</option>
                  <option value="3-10万">3-10万</option>
                  <option value="10-30万">10-30万</option>
                  <option value="30万以上">30万以上</option>
                </select>
                <textarea
                  placeholder="投放需求（选填）"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
                >
                  立即获取方案
                </button>
              </form>
              <button
                onClick={() => setShowForm(false)}
                className="w-full text-center mt-3 text-gray-400 text-sm hover:text-gray-600"
              >
                取消
              </button>
            </>
          )}
        </div>
      )}

      <div className="fixed right-4 bottom-24 z-30 flex flex-col items-end gap-2">
        {expanded && (
          <div className="flex flex-col gap-2 items-end mb-1">
            <a
              href="tel:13997187771"
              className="flex items-center gap-2 bg-white shadow-lg rounded-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all border border-gray-100"
            >
              <span>📞</span>
              <span>13997187771</span>
            </a>
            <button
              onClick={() => { setShowWechat(true); setExpanded(false) }}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 shadow-lg rounded-full px-4 py-2.5 text-sm font-medium text-white transition-all"
            >
              <span>💬</span>
              <span>微信咨询</span>
            </button>
            <button
              onClick={() => { setShowForm(true); setExpanded(false) }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg rounded-full px-4 py-2.5 text-sm font-medium text-white transition-all"
            >
              <span>📋</span>
              <span>免费询价</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setExpanded(e => !e)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white text-xl transition-all duration-300 ${bgColor}`}
        >
          {expanded ? '✕' : '💬'}
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-gray-100 shadow-lg flex">
        <a
          href="tel:13997187771"
          className="flex-1 flex items-center justify-center gap-2 py-4 text-gray-700 font-medium text-sm"
        >
          <span>📞</span>
          <span>电话咨询</span>
        </a>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => setShowForm(true)}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-medium text-sm"
        >
          <span>📋</span>
          <span>免费询价</span>
        </button>
      </div>
    </>
  )
}
