import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { verifyCaptcha } from '@/lib/captcha-store'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      phone,
      captchaId,
      captchaCode,
      password,
      userType = 'individual',
      companyName,
      contactName,
      email,
      agreeTerms
    } = data

    // 验证必填字段
    if (!phone || !password || !contactName) {
      return NextResponse.json(
        { success: false, message: '请填写手机号、密码和联系人姓名' },
        { status: 400 }
      )
    }

    // 验证手机格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, message: '手机号码格式不正确' },
        { status: 400 }
      )
    }

    // 验证图片验证码
    if (!captchaId || !captchaCode) {
      return NextResponse.json(
        { success: false, message: '请完成图片验证码' },
        { status: 400 }
      )
    }

    const isValidCaptcha = verifyCaptcha(captchaId, captchaCode)
    if (!isValidCaptcha) {
      return NextResponse.json(
        { success: false, message: '图片验证码错误，请重新输入' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码至少6位' },
        { status: 400 }
      )
    }

    // 企业用户必须填写公司名称
    if (userType === 'company' && !companyName) {
      return NextResponse.json(
        { success: false, message: '企业用户请填写公司名称' },
        { status: 400 }
      )
    }

    // 检查手机是否已注册
    const checkSql = 'SELECT id FROM users WHERE phone = ?'
    const existingUsers = await query(checkSql, [phone]) as any[]

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: '该手机号已注册，请直接登录' },
        { status: 400 }
      )
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const userSql = `
      INSERT INTO users (
        phone, password, user_type, company_name, 
        contact_name, email, name, role, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'client', 'active', NOW())
    `

    const userResult = await query(userSql, [
      phone,
      hashedPassword,
      userType,
      companyName || null,
      contactName,
      email || null,
      contactName  // 显示名
    ]) as any

    return NextResponse.json({
      success: true,
      message: '注册成功！请登录',
      userId: userResult.insertId
    })

  } catch (error) {
    console.error('注册失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
