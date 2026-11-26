import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminToken } from '@/lib/auth-token'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLogin = pathname === '/admin/login' || pathname === '/api/admin/login'
  const session = await verifyAdminToken(request.cookies.get(SESSION_COOKIE)?.value)

  if (isLogin) {
    if (session && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  if (!session) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const login = new URL('/admin/login', request.url)
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
