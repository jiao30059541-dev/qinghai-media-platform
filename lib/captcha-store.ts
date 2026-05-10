// lib/captcha-store.ts - 图片验证码存储
const captchaCodes = new Map<string, { code: string, expiresAt: number }>()

// 清理过期验证码
function cleanup() {
  const now = Date.now()
  for (const [id, record] of Array.from(captchaCodes.entries())) {
    if (now > record.expiresAt) captchaCodes.delete(id)
  }
}

// 生成随机验证码（4位数字+字母）
export function generateCaptchaCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// 生成SVG验证码图片
export function generateCaptchaSvg(code: string): string {
  const width = 120
  const height = 44
  const chars = code.split('')

  // 每个字符随机颜色、大小、旋转
  let textElements = ''
  const charWidth = width / (chars.length + 1)

  chars.forEach((char, i) => {
    const x = charWidth * (i + 0.6) + (Math.random() - 0.5) * 8
    const y = 30 + (Math.random() - 0.5) * 8
    const fontSize = 24 + Math.floor(Math.random() * 8)
    const rotation = (Math.random() - 0.5) * 30
    const r = Math.floor(100 + Math.random() * 155).toString(16).padStart(2, '0')
    const g = Math.floor(100 + Math.random() * 155).toString(16).padStart(2, '0')
    const b = Math.floor(100 + Math.random() * 155).toString(16).padStart(2, '0')

    textElements += `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="Arial" font-weight="bold" fill="#${r}${g}${b}" transform="rotate(${rotation},${x},${y})">${char}</text>\n`
  })

  // 干扰线
  let lines = ''
  for (let i = 0; i < 4; i++) {
    const x1 = Math.random() * width
    const y1 = Math.random() * height
    const x2 = Math.random() * width
    const y2 = Math.random() * height
    const opacity = 0.3 + Math.random() * 0.4
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#999" stroke-width="${0.5 + Math.random()}" opacity="${opacity}" />\n`
  }

  // 干扰点
  let dots = ''
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    dots += `<circle cx="${x}" cy="${y}" r="${0.5 + Math.random()}" fill="#888" opacity="${0.3 + Math.random() * 0.4}" />\n`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#f5f5f5" rx="4" />
  ${lines}
  ${dots}
  ${textElements}
</svg>`
}

// 存储验证码
export function saveCaptcha(captchaId: string, code: string) {
  captchaCodes.set(captchaId, { code, expiresAt: Date.now() + 5 * 60 * 1000 })
  cleanup()
}

// 验证（验证后立即删除）
export function verifyCaptcha(captchaId: string, code: string): boolean {
  const record = captchaCodes.get(captchaId)
  if (!record) return false
  captchaCodes.delete(captchaId)
  return Date.now() <= record.expiresAt && record.code.toUpperCase() === code.toUpperCase()
}

// 清理
export function cleanupCaptcha(captchaId: string) {
  captchaCodes.delete(captchaId)
}
