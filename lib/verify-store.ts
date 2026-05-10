// lib/verify-store.ts - 验证码存储（内存缓存，生产环境建议用Redis）
export interface VerificationRecord {
  code: string
  expiresAt: number
  phone: string
}

const verificationCodes = new Map<string, VerificationRecord>()
const sendAttempts = new Map<string, { count: number, lastSent: number }>()

// 清理过期的验证码
function cleanupExpiredCodes() {
  const now = Date.now()
  for (const [key, value] of Array.from(verificationCodes.entries())) {
    if (now > value.expiresAt) {
      verificationCodes.delete(key)
    }
  }
  for (const [key, value] of Array.from(sendAttempts.entries())) {
    if (now - value.lastSent > 24 * 60 * 60 * 1000) {
      sendAttempts.delete(key)
    }
  }
}

// 存储验证码
export function saveVerificationCode(phone: string, code: string) {
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5分钟过期
  verificationCodes.set(phone, { code, expiresAt, phone })
  cleanupExpiredCodes()
}

// 验证验证码（验证成功自动删除）
export function verifyVerificationCode(phone: string, code: string): boolean {
  const record = verificationCodes.get(phone)
  if (!record) return false

  const now = Date.now()
  if (now > record.expiresAt) {
    verificationCodes.delete(phone)
    return false
  }

  const isValid = record.code === code
  if (isValid) {
    verificationCodes.delete(phone)
  }
  return isValid
}

// 更新发送记录
export function updateSendAttempt(phone: string) {
  const attemptKey = `phone_${phone}`
  const attempts = sendAttempts.get(attemptKey) || { count: 0, lastSent: 0 }
  sendAttempts.set(attemptKey, {
    count: attempts.count + 1,
    lastSent: Date.now()
  })
}

// 获取发送记录
export function getSendAttempt(phone: string) {
  return sendAttempts.get(`phone_${phone}`) || { count: 0, lastSent: 0 }
}

// 导出统计数据（调试用）
export function getStoreStats() {
  return {
    codesCount: verificationCodes.size,
    attemptsCount: sendAttempts.size
  }
}

// 按手机号查询
export function getVerificationRecord(phone: string) {
  return verificationCodes.get(phone) || null
}
