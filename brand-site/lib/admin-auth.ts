import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifyAdminToken } from '@/lib/auth-token'

export async function getAdminSession() {
  const cookieStore = await cookies()
  return verifyAdminToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
