// app/plan/basket/page.tsx - 重定向到主投放篮页面
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BasketRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/plan')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-6 text-gray-600">跳转到投放篮...</p>
      </div>
    </div>
  )
}
