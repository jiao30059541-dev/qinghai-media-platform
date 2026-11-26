// components/HeroVideo.tsx - React Bits hero atmosphere with a CSS fallback.
'use client'

import { useEffect, useState } from 'react'
import HeroFx, { type HeroFxMode } from '@/components/HeroFx'
import { cn } from '@/lib/utils'

interface HeroVideoProps {
  className?: string
}

const modes: Array<{ value: HeroFxMode; label: string }> = [
  { value: 'dot', label: '点阵' },
  { value: 'beams', label: '光束' },
  { value: 'waves', label: '波浪' },
]

const isHeroFxMode = (value: string | null): value is HeroFxMode =>
  value === 'dot' || value === 'beams' || value === 'waves'

export default function HeroVideo({ className }: HeroVideoProps) {
  const [mode, setMode] = useState<HeroFxMode>('dot')
  const [showLab, setShowLab] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedMode = params.get('heroFx')

    if (isHeroFxMode(requestedMode)) {
      setMode(requestedMode)
    }
    setShowLab(params.get('heroLab') === '1')
  }, [])

  return (
    <div className={cn('absolute inset-0 z-0 overflow-hidden', className)}>
      <HeroFx mode={mode} />

      {showLab && (
        <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 bg-slate-950/55 p-1 text-xs text-white/70 shadow-2xl backdrop-blur-xl">
          {modes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={cn(
                'rounded-full px-4 py-2 transition-colors',
                mode === item.value
                  ? 'bg-white text-slate-950'
                  : 'hover:bg-white/10 hover:text-white'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
