import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // 从Authorization头部解析JWT
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key')
    } catch {
      return NextResponse.json({ success: false, message: 'Token无效' }, { status: 401 })
    }

    const userId = decoded.userId
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Token无效' }, { status: 401 })
    }

    const users = await query('SELECT id, name, phone, role, company_name, contact_name, email FROM users WHERE id = ?', [userId]) as any[]
    if (!users[0]) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 })
    }

    if (users[0].role !== 'supplier') {
      return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    }

    const suppliers = await query('SELECT * FROM suppliers WHERE user_id = ?', [userId]) as any[]
    if (!suppliers[0]) {
      return NextResponse.json({ success: false, message: '未找到供应商资料' }, { status: 404 })
    }

    const mediaCount = await query('SELECT COUNT(*) as count FROM media WHERE supplier_id = ?', [suppliers[0].id]) as any[]
    const activeMedia = await query("SELECT COUNT(*) as count FROM media WHERE supplier_id = ? AND status = 'active'", [suppliers[0].id]) as any[]

    return NextResponse.json({
      success: true,
      data: {
        user: users[0],
        supplier: suppliers[0],
        stats: {
          total_media: mediaCount[0]?.count || 0,
          active_media: activeMedia[0]?.count || 0
        }
      }
    })
  } catch (error: any) {
    console.error('获取供应商信息失败:', error)
    return NextResponse.json({
      success: false,
      message: error?.message || '获取失败'
    }, { status: 500 })
  }
}
