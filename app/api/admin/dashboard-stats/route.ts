// app/api/admin/dashboard-stats/route.ts - 后台Dashboard数据
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const statsSql = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'client') as total_clients,
        (SELECT COUNT(*) FROM suppliers WHERE status = 'approved') as total_suppliers,
        (SELECT COUNT(*) FROM media WHERE status = 'active') as total_media,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'confirmed') as confirmed_orders,
        (SELECT SUM(total_price) FROM orders WHERE status = 'confirmed') as total_revenue
    `
    const [result] = await query(statsSql) as any[]
    return NextResponse.json({ success: true, data: result || {} })
  } catch (error) {
    return NextResponse.json({ success: false, message: '获取统计数据失败' }, { status: 500 })
  }
}
