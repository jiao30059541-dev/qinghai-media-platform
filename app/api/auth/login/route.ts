import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// 简单的内存缓存（与send-code共享）
const verificationCodes = new Map<string, { code: string, expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { phone, password, code, loginMethod = 'password' } = data
    
    if (!phone) {
      return NextResponse.json(
        { success: false, message: '请输入手机号码' },
        { status: 400 }
      )
    }
    
    // 根据登录方式验证
    if (loginMethod === 'password') {
      if (!password) {
        return NextResponse.json(
          { success: false, message: '请输入密码' },
          { status: 400 }
        )
      }
      
      // 查询用户
      const userSql = 'SELECT * FROM users WHERE phone = ? AND status = "active"'
      const users = await query(userSql, [phone]) as any[]
      
      if (users.length === 0) {
        return NextResponse.json(
          { success: false, message: '用户不存在或账号已禁用' },
          { status: 400 }
        )
      }
      
      const user = users[0]
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, message: '密码不正确' },
          { status: 400 }
        )
      }
      
      // 生成JWT token（在生产环境中应该使用安全的密钥）
      const token = jwt.sign(
        { userId: user.id, phone: user.phone, userType: user.user_type, role: user.role },
        process.env.JWT_SECRET || 'development-secret-key',
        { expiresIn: '7d' }
      )
      
      // 移除密码字段
      const { password: _, ...userWithoutPassword } = user
      
      return NextResponse.json({
        success: true,
        message: '登录成功',
        token,
        user: userWithoutPassword
      })
      
    } else if (loginMethod === 'code') {
      // 验证码登录
      if (!code) {
        return NextResponse.json(
          { success: false, message: '请输入验证码' },
          { status: 400 }
        )
      }
      
      // 验证验证码
      const verificationData = verificationCodes.get(phone)
      if (!verificationData) {
        return NextResponse.json(
          { success: false, message: '请先获取验证码' },
          { status: 400 }
        )
      }
      
      if (verificationData.expiresAt < Date.now()) {
        verificationCodes.delete(phone)
        return NextResponse.json(
          { success: false, message: '验证码已过期，请重新获取' },
          { status: 400 }
        )
      }
      
      if (verificationData.code !== code) {
        return NextResponse.json(
          { success: false, message: '验证码不正确' },
          { status: 400 }
        )
      }
      
      // 查询或创建用户（验证码登录可能自动注册）
      const userSql = 'SELECT * FROM users WHERE phone = ?'
      const users = await query(userSql, [phone]) as any[]
      
      let user
      if (users.length === 0) {
        // 自动注册新用户
        const insertSql = `
          INSERT INTO users (phone, user_type, status, created_at) 
          VALUES (?, 'individual', 'active', NOW())
        `
        const result = await query(insertSql, [phone]) as any
        user = { id: result.insertId, phone, user_type: 'individual' }
      } else {
        user = users[0]
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone, userType: user.user_type, role: user.role },
        process.env.JWT_SECRET || 'development-secret-key',
        { expiresIn: '7d' }
      )
      
      // 清理验证码
      verificationCodes.delete(phone)
      
      return NextResponse.json({
        success: true,
        message: '登录成功',
        token,
        user: user.password ? { ...user, password: undefined } : user
      })
      
    } else {
      return NextResponse.json(
        { success: false, message: '不支持的登录方式' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('登录失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}