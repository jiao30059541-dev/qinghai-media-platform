import { NextRequest, NextResponse } from 'next/server'
import { SmsService, createSmsService } from '@/lib/sms-service'
import {
  saveVerificationCode,
  updateSendAttempt,
  getSendAttempt,
  getStoreStats
} from '@/lib/verify-store'

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    // 验证手机号格式
    if (!phone || phone.length !== 11 || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '手机号码格式不正确，请输入11位有效手机号' },
        { status: 400 }
      )
    }

    // 检查发送频率
    const now = Date.now()
    const attempts = getSendAttempt(phone)

    // 60秒内不能重复发送
    if (now - attempts.lastSent < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (now - attempts.lastSent)) / 1000)
      return NextResponse.json(
        { success: false, message: `请等待${waitSeconds}秒后再发送验证码` },
        { status: 429 }
      )
    }

    // 24小时内最多发送10次
    if (attempts.count >= 10 && now - attempts.lastSent < 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { success: false, message: '今日验证码发送次数已达上限，请明天再试' },
        { status: 429 }
      )
    }

    // 创建短信服务
    const smsService = createSmsService()
    const provider = smsService.getProvider()

    console.log(`[验证码] 准备发送到 ${phone}，使用服务商: ${provider}`)

    // 发送验证码
    const smsResult = await smsService.sendVerificationCode(phone)

    if (!smsResult.success) {
      console.error(`[验证码] 发送失败: ${smsResult.message}`, smsResult.error)
      return NextResponse.json(
        { success: false, message: smsResult.message || '验证码发送失败' },
        { status: 500 }
      )
    }

    // 验证码发送成功，存储到共享缓存
    const code = smsResult.code!
    saveVerificationCode(phone, code)

    // 更新发送记录
    updateSendAttempt(phone)

    // 记录发送日志
    console.log(`[验证码] 发送成功到 ${phone}: ${code}，有效期5分钟`)

    // 准备响应
    const responseData: any = {
      success: true,
      message: provider === 'dev' ? '验证码已发送（开发模式）' : '验证码已发送'
    }

    // 开发模式下返回验证码便于测试
    if (provider === 'dev') {
      responseData.code = code
      responseData.note = '开发模式下验证码显示在此，生产环境将发送短信'
    }

    // 生产环境下的提示
    if (provider !== 'dev' && smsService.isConfigured()) {
      responseData.note = '验证码已通过短信发送，请查收'
    }

    return NextResponse.json(responseData)

  } catch (error: any) {
    console.error('发送验证码失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取验证码状态（调试用）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  const stats = getStoreStats()

  if (!phone) {
    return NextResponse.json({
      count: stats.codesCount,
      attemptsCount: stats.attemptsCount
    })
  }

  const record = await import('@/lib/verify-store').then(m => m.getVerificationRecord(phone))
  const attempts = getSendAttempt(phone)

  return NextResponse.json({
    phone,
    hasCode: !!record,
    code: record?.code,
    expiresIn: record ? Math.max(0, record.expiresAt - Date.now()) / 1000 : 0,
    sendAttempts: attempts.count,
    lastSent: attempts.lastSent
  })
}
