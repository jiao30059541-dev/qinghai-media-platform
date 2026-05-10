import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

async function getSupplierId(userId: number): Promise<number | null> {
  const supplier = await query('SELECT id FROM suppliers WHERE user_id = ?', [userId]) as any[]
  return supplier[0]?.id || null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    const supplierId = await getSupplierId(userId)
    if (!supplierId) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const status = searchParams.get('status')
    const search = searchParams.get('q')
    let whereClause = 'WHERE m.supplier_id = ?'
    const params: any[] = [supplierId]
    if (status === 'active' || status === 'inactive') { whereClause += ' AND m.status = ?'; params.push(status) }
    if (search) { whereClause += ' AND (m.name LIKE ? OR m.city LIKE ?)'; params.push('%' + search + '%', '%' + search + '%') }
    const countResult = await query('SELECT COUNT(*) as total FROM media m ' + whereClause, params) as any[]
    const total = countResult[0]?.total || 0
    const sql = 'SELECT m.*, (SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.media_id = m.id) as order_count FROM media m ' + whereClause + ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?'
    const rows = await query(sql, [...params, limit, offset]) as any[]
    return NextResponse.json({ success: true, data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '获取失败', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    const supplierId = await getSupplierId(userId)
    if (!supplierId) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const data = await request.json()
    const { name, category_level1, category_level2, category_level3, city, address, latitude, longitude, list_price, deal_price, floor_price, size, resolution, daily_exposure, media_type } = data
    if (!name || !city) return NextResponse.json({ success: false, message: '请填写资源名称和城市' }, { status: 400 })
    const cat1 = category_level1 || media_type || '户外广告'
    const cat2 = category_level2 || ''
    const cat3 = category_level3 || ''
    const result = await query(
      'INSERT INTO media (supplier_id, name, category_level1, category_level2, category_level3, city, address, latitude, longitude, list_price, deal_price, floor_price, size, resolution, daily_exposure) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [supplierId, name, cat1, cat2, cat3, city, address||null, latitude||null, longitude||null, list_price||0, deal_price||0, floor_price||0, size||null, resolution||null, daily_exposure||0]
    ) as any
    return NextResponse.json({ success: true, message: '资源创建成功，等待管理员审核上架', data: { id: result.insertId } })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: '创建失败', details: error.message }, { status: 500 })
  }
}