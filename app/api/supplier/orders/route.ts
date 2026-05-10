import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    const suppliers = await query('SELECT id FROM suppliers WHERE user_id = ?', [userId]) as any[]
    if (!suppliers[0]) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const supplierId = suppliers[0].id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const status = searchParams.get('status')
    let whereClause = 'WHERE m.supplier_id = ?'
    const params: any[] = [supplierId]
    if (status) { whereClause += ' AND o.status = ?'; params.push(status) }
    const countResult = await query('SELECT COUNT(*) as total FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN media m ON oi.media_id = m.id ' + whereClause, params) as any[]
    const total = countResult[0]?.total || 0
    const rows = await query('SELECT o.id, o.total_price, o.status, o.created_at as order_date, oi.quoted_price, oi.settlement_price, m.id as media_id, m.name as media_name, m.city, m.category_level1, u.name as client_name, u.phone as client_phone FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN media m ON oi.media_id = m.id LEFT JOIN users u ON o.user_id = u.id ' + whereClause + ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?', [...params, limit, offset]) as any[]
    return NextResponse.json({ success: true, data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 })
  }
}