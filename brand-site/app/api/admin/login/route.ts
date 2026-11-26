import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, createAdminToken } from '@/lib/auth-token'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers)
  const limit = checkRateLimit(`login:${ip}`, 8, 15 * 60 * 1000)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: '登录尝试过多，请 15 分钟后再试。' },
      { status: 429 }
    )
  }

  try {
    const { email, password } = (await request.json()) as {
      email?: string
      password?: string
    }
    const configuredEmail = process.env.ADMIN_EMAIL
    const configuredHash = process.env.ADMIN_PASSWORD_HASH

    if (!configuredEmail || !configuredHash) {
      console.error('Admin credentials are not configured')
      return NextResponse.json({ error: '后台尚未完成配置。' }, { status: 503 })
    }

    const validEmail = email?.trim().toLowerCase() === configuredEmail.toLowerCase()
    const validPassword = password ? await bcrypt.compare(password, configuredHash) : false

    if (!validEmail || !validPassword) {
      return NextResponse.json({ error: '账号或密码错误。' }, { status: 401 })
    }

    const token = await createAdminToken({
      email: configuredEmail,
      role: 'admin',
    })
    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 12,
    })
    return response
  } catch (error) {
    console.error('Admin login failed', error)
    return NextResponse.json({ error: '登录失败，请稍后再试。' }, { status: 500 })
  }
}
