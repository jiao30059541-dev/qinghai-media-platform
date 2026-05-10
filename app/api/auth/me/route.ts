// app/api/auth/me/route.ts - 获取当前登录用户信息
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未登录' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key') as any

    const users = await query('SELECT id, role, name, phone, real_name, email, company_name, industry, budget_range, created_at FROM users WHERE id = ?', [decoded.userId]) as any[]
    
    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: users[0]
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Token无效或已过期' },
      { status: 401 }
    )
  }
}
