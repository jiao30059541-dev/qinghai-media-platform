// app/api/captcha/route.ts - 生成图片验证码
import { NextRequest, NextResponse } from 'next/server'
import { generateCaptchaCode, generateCaptchaSvg, saveCaptcha } from '@/lib/captcha-store'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  // 生成验证码
  const code = generateCaptchaCode()
  const captchaId = crypto.randomUUID()

  // 存储验证码
  saveCaptcha(captchaId, code)

  // 生成SVG
  const svg = generateCaptchaSvg(code)

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Captcha-Id': captchaId,
    },
  })
}
