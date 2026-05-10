// components/HeroVideo.tsx - 使用CSS渐变背景（视频文件暂不可用时的优雅降级）
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface HeroVideoProps {
  className?: string
}

const slides = [
  { 
    gradient: 'from-slate-900 via-blue-900 to-indigo-900',
    label: '城市地标LED夜景',
    overlay: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.3) 0%, transparent 70%)'
  },
  { 
    gradient: 'from-gray-900 via-emerald-900 to-teal-900',
    label: '公交媒体全覆盖',
    overlay: 'radial-gradient(ellipse at 70% 40%, rgba(16,185,129,0.3) 0%, transparent 70%)'
  },
  { 
    gradient: 'from-zinc-900 via-purple-900 to-violet-900',
    label: '商圈核心广告位',
    overlay: 'radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.3) 0%, transparent 70%)'
  }
]

export default function HeroVideo({ className }: HeroVideoProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  const slide = slides[currentSlide]

  return (
    <div className={cn('absolute inset-0 z-0 overflow-hidden', className)}>
      {/* 渐变背景 */}
      <div 
        key={currentSlide}
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-all duration-1000',
          slide.gradient
        )}
      />
      
      {/* 动态光效 */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: slide.overlay }}
      />
      
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/40" />
      
      {/* 动态粒子效果 */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${i * 17 % 100}%`,
              top: `${i * 23 % 100}%`,
              animationDelay: `${(i * 0.7) % 5}s`,
              animationDuration: `${2 + i % 4}s`
            }}
          />
        ))}
      </div>
      
      {/* 指示器 */}
      <div className="absolute bottom-4 left-8 text-white/80 text-sm">
        <div className="flex items-center space-x-4">
          <span>{slide.label}</span>
          <span>•</span>
          <span>轮播 {currentSlide + 1}/{slides.length}</span>
        </div>
      </div>

      {/* 指示点 */}
      <div className="absolute bottom-8 right-8 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentSlide 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/70'
            )}
          />
        ))}
      </div>
    </div>
  )
}
