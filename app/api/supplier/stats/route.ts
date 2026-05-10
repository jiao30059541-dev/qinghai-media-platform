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
    const totalMedia = await query('SELECT COUNT(*) as c FROM media WHERE supplier_id = ?', [supplierId]) as any[]
    const activeMedia = await query("SELECT COUNT(*) as c FROM media WHERE supplier_id = ? AND status = 'active'", [supplierId]) as any[]
    const inactiveMedia = await query("SELECT COUNT(*) as c FROM media WHERE supplier_id = ? AND status = 'inactive'", [supplierId]) as any[]
    const totalOrders = await query('SELECT COUNT(*) as c FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN media m ON oi.media_id = m.id WHERE m.supplier_id = ?', [supplierId]) as any[]
    const pendingOrders = await query('SELECT COUNT(*) as c FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN media m ON oi.media_id = m.id WHERE m.supplier_id = ? AND o.status = "pending"', [supplierId]) as any[]
    const confirmedOrders = await query('SELECT COUNT(*) as c FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN media m ON oi.media_id = m.id WHERE m.supplier_id = ? AND o.status = "confirmed"', [supplierId]) as any[]
    const totalRevenue = await query('SELECT COALESCE(SUM(oi.settlement_price), 0) as total FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN media m ON oi.media_id = m.id WHERE m.supplier_id = ? AND o.status = "confirmed"', [supplierId]) as any[]
    const recentOrders = await query('SELECT o.id, o.total_price, o.status, o.created_at, m.name as media_name, u.name as client_name FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN media m ON oi.media_id = m.id LEFT JOIN users u ON o.user_id = u.id WHERE m.supplier_id = ? ORDER BY o.created_at DESC LIMIT 5', [supplierId]) as any[]
    const mediaByCategory = await query('SELECT category_level1 as name, COUNT(*) as value FROM media WHERE supplier_id = ? GROUP BY category_level1 ORDER BY value DESC', [supplierId]) as any[]
    return NextResponse.json({
      success: true,
      data: {
        media: { total: totalMedia[0]?.c || 0, active: activeMedia[0]?.c || 0, inactive: inactiveMedia[0]?.c || 0 },
        orders: { total: totalOrders[0]?.c || 0, pending: pendingOrders[0]?.c || 0, confirmed: confirmedOrders[0]?.c || 0 },
        revenue: { total: parseFloat(totalRevenue[0]?.total || '0').toFixed(2) },
        recent_orders: recentOrders,
        media_by_category: mediaByCategory
      }
    })
  } catch (error: any) {
    console.error('获取供应商统计失败:', error)
    return NextResponse.json({ success: false, message: '获取失败', details: error?.message }, { status: 500 })
  }
}