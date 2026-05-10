// app/api/admin/orders/route.ts - 管理员订单管理API
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// 从request获取token（支持多种方式）
function getToken(request: NextRequest): string | null {
  // 1. Bearer header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1]
  // 2. X-Admin-Token header
  const xToken = request.headers.get('x-admin-token')
  if (xToken) return xToken
  // 3. Query param token
  const urlToken = request.nextUrl.searchParams.get('token')
  if (urlToken) return urlToken
  return null
}

function isAuthenticated(request: NextRequest): boolean {
  const token = getToken(request)
  return token === 'Jiao7375' || token === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
}

// GET - 获取订单列表（支持筛选、分页、搜索）
export async function GET(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const status = searchParams.get('status')
    const industry = searchParams.get('industry')
    const city = searchParams.get('city')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

    // 动态构建WHERE条件
    const conditions: string[] = []
    const params: any[] = []

    if (status && status !== 'all') {
      conditions.push('o.status = ?')
      params.push(status)
    }
    if (industry && industry !== 'all') {
      conditions.push('o.industry = ?')
      params.push(industry)
    }
    if (city && city !== 'all') {
      conditions.push('o.city = ?')
      params.push(city)
    }
    if (search) {
      conditions.push('(o.id LIKE ? OR u.name LIKE ? OR u.company_name LIKE ? OR u.phone LIKE ?)')
      const p = `%${search}%`
      params.push(p, p, p, p)
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id ${whereClause}`
    const countResult = await query(countSql, params) as any[]
    const total = countResult[0]?.total || 0

    // 查询订单列表
    const ordersSql = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.company_name as customer_company,
        u.phone as customer_phone,
        u.email as customer_email,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
        (SELECT COALESCE(SUM(oi.quoted_price), 0) FROM order_items oi WHERE oi.order_id = o.id) as actual_total
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `

    const orders = await query(ordersSql, [...params, limit, offset]) as any[]

    // 查询每个订单的明细
    for (const order of orders) {
      const itemsSql = `
        SELECT oi.*, m.name as media_name, m.category_level1 as media_type, m.city as media_location
        FROM order_items oi
        LEFT JOIN media m ON oi.media_id = m.id
        WHERE oi.order_id = ?
        ORDER BY oi.created_at
      `
      const items = await query(itemsSql, [order.id]) as any[]
      order.items = items
    }

    // 统计信息
    const statsSql = `SELECT COUNT(*) as total_orders, COALESCE(SUM(total_price), 0) as total_revenue, COALESCE(AVG(total_price), 0) as avg_order_value FROM orders o ${whereClause}`
    const statsResult = await query(statsSql, params) as any[]
    const stats = statsResult[0] || {}

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        stats
      }
    })
  } catch (error) {
    console.error('获取订单失败:', error)
    return NextResponse.json({ success: false, message: '获取订单列表失败' }, { status: 500 })
  }
}

// PATCH - 更新单个订单状态
export async function PATCH(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 })
    }

    const data = await request.json()
    const { orderId, status, notes } = data

    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: '订单ID和状态不能为空' }, { status: 400 })
    }

    // 验证订单存在
    const checkResult = await query('SELECT id, status FROM orders WHERE id = ?', [orderId]) as any[]
    if (checkResult.length === 0) {
      return NextResponse.json({ success: false, message: '订单不存在' }, { status: 404 })
    }

    // 更新状态
    await query('UPDATE orders SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?', [
      status, notes || null, orderId
    ])

    return NextResponse.json({
      success: true,
      message: '订单状态更新成功',
      data: { orderId, status }
    })
  } catch (error) {
    console.error('更新订单失败:', error)
    return NextResponse.json({ success: false, message: '更新订单状态失败' }, { status: 500 })
  }
}

// PUT - 批量更新订单状态
export async function PUT(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 })
    }

    const data = await request.json()
    const { orderIds, status } = data

    if (!Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return NextResponse.json({ success: false, message: '参数无效' }, { status: 400 })
    }

    await query('START TRANSACTION')
    try {
      const placeholders = orderIds.map(() => '?').join(',')
      await query(
        `UPDATE orders SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`,
        [status, ...orderIds]
      )
      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: `成功更新 ${orderIds.length} 个订单状态`,
        data: { count: orderIds.length, status }
      })
    } catch (e) {
      await query('ROLLBACK')
      throw e
    }
  } catch (error) {
    console.error('批量更新订单失败:', error)
    return NextResponse.json({ success: false, message: '批量更新失败' }, { status: 500 })
  }
}
