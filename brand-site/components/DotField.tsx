'use client'

import { useEffect, useRef } from 'react'

type Dot = {
  x: number
  y: number
  baseAlpha: number
}

export default function DotField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasNode = canvasRef.current
    if (!canvasNode) return

    const drawingContext = canvasNode.getContext('2d')
    if (!drawingContext) return

    const canvas: HTMLCanvasElement = canvasNode
    const context: CanvasRenderingContext2D = drawingContext

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: -1000, y: -1000, active: false }
    let dots: Dot[] = []
    let width = 0
    let height = 0
    let frame = 0
    let visible = true

    function buildDots() {
      const gap = width < 768 ? 24 : 30
      const nextDots: Dot[] = []

      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          nextDots.push({
            x,
            y,
            baseAlpha: 0.16 + ((x * 13 + y * 7) % 11) / 90,
          })
        }
      }

      dots = nextDots
    }

    function resize() {
      const bounds = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = bounds.width
      height = bounds.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      buildDots()
      draw(0)
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height)
      const wave = reducedMotion ? 0 : time / 2600

      for (const dot of dots) {
        const distance = Math.hypot(dot.x - pointer.x, dot.y - pointer.y)
        const pointerGlow = pointer.active ? Math.max(0, 1 - distance / 150) : 0
        const pulse = reducedMotion ? 1 : 0.88 + Math.sin(wave + dot.x * 0.012 + dot.y * 0.009) * 0.12
        const radius = 1.05 + pointerGlow * 1.8

        context.beginPath()
        context.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 255, 255, ${Math.min(0.86, dot.baseAlpha * pulse + pointerGlow * 0.55)})`
        context.fill()
      }

      if (visible && !reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    function onPointerMove(event: PointerEvent) {
      const bounds = canvas.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }

    function onPointerLeave() {
      pointer.active = false
      pointer.x = -1000
      pointer.y = -1000
    }

    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      window.cancelAnimationFrame(frame)
      if (visible) frame = window.requestAnimationFrame(draw)
    })

    resizeObserver.observe(canvas)
    visibilityObserver.observe(canvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    resize()

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} aria-hidden="true" />
}
