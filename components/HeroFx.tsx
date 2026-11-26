'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const DotField = dynamic(() => import('@/components/backgrounds/DotField'), {
  ssr: false,
})
const Beams = dynamic(
  () => import('@/components/backgrounds/Beams').then((module) => module.default),
  { ssr: false }
)
const GradientWaves = dynamic(
  () => import('@/components/backgrounds/GradientWaves'),
  { ssr: false }
)

export type HeroFxMode = 'dot' | 'beams' | 'waves'

interface HeroFxProps {
  mode: HeroFxMode
  className?: string
}

// React Bits components are vendored under MIT + Commons Clause.
// License: components/backgrounds/REACT_BITS_LICENSE.md
export default function HeroFx({ mode, className }: HeroFxProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden bg-[#020b18]', className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 35%, #0a3158 0%, #061b35 34%, #020b18 74%), linear-gradient(145deg, #020b18 0%, #03162d 55%, #01060f 100%)',
        }}
      />

      {/* A slow city-light pool keeps the background alive without competing with the headline. */}
      <div
        className="hero-light-pool absolute left-[8%] top-[18%] h-[30rem] w-[30rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0, 132, 255, 0.5), transparent 68%)' }}
      />
      <div
        className="hero-light-pool absolute bottom-[3%] right-[4%] h-[34rem] w-[34rem] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(0, 214, 255, 0.34), transparent 70%)' }}
      />

      {mode === 'dot' && (
        <div className="absolute inset-0 opacity-[0.72]">
          <DotField
            dotRadius={1.35}
            dotSpacing={22}
            pattern="grid"
            gradientFrom="#087ea4"
            gradientTo="#6fe7ff"
            gradientAngle={118}
            cursorRadius={190}
            bulgeStrength={0.2}
            twist={0.04}
            glowColor="#0aa8ff"
            glowRadius={220}
            glowIntensity={0.28}
            baseOpacity={0.16}
            waveAmplitude={2.4}
            sparkle
            speed={0.24}
            interactive
            opacity={0.68}
          />
        </div>
      )}

      {mode === 'beams' && (
        <Beams
          className="opacity-75"
          color="#42c8ff"
          beamWidth={135}
          rotation={24}
          speed={0.12}
          waveLength={240}
          depth={1.1}
          sharpness={0.58}
          twist={0.08}
          fillLight={0.08}
          glow={0.34}
          brightness={0.52}
          variation={0.2}
          grain={0.28}
          quality={0.72}
          mouseInteraction
          mouseStrength={0.12}
          intro
          fade={0.5}
          opacity={0.7}
        />
      )}

      {mode === 'waves' && (
        <div className="absolute inset-x-0 bottom-0 h-[72%]">
          <GradientWaves
            horizonColor="#0a5277"
            waveColor="#159bc7"
            crestColor="#dcfdff"
            backgroundColor="transparent"
            speed={0.2}
            amplitude={2.8}
            waveScale={0.48}
            waveRatio={1.15}
            swell={24}
            turbulence={10}
            tilt={62}
            zoom={0.95}
            height={5.2}
            fogDepth={9}
            relief={0.86}
            lightAngle={118}
            sheen={1.05}
            brightness={1.18}
            opacity={0.92}
            grain={0.2}
            quality="medium"
            intro
            mouseInteraction
            parallaxStrength={0.06}
            mouseStrength={0.12}
            paused={false}
            dpr={1.25}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,7,16,0.25)_0%,rgba(1,7,16,0.08)_38%,rgba(1,7,16,0.5)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#030c18] to-transparent" />
    </div>
  )
}
