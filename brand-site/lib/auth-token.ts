import { jwtVerify, SignJWT } from 'jose'

export const SESSION_COOKIE = 'mytx_admin'

export type AdminSession = {
  email: string
  role: 'admin'
}

function secret() {
  const configured = process.env.JWT_SECRET
  if (!configured && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production')
  }
  return new TextEncoder().encode(configured || 'development-only-change-this-secret')
}

export async function createAdminToken(session: AdminSession) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret())
}

export async function verifyAdminToken(token?: string | null): Promise<AdminSession | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret())
    if (payload.role !== 'admin' || typeof payload.email !== 'string') return null
    return { email: payload.email, role: 'admin' }
  } catch {
    return null
  }
}
