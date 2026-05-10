// app/api/cases/route.ts - 公开案例列表
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const rows = await query(
      "SELECT * FROM cases WHERE status = 'approved' ORDER BY created_at DESC LIMIT 50"
    ) as any[]

    const data = rows.map((r: any) => ({
      ...r,
      results: r.results ? (typeof r.results === 'string' ? JSON.parse(r.results) : r.results) : [],
      metrics: r.metrics ? (typeof r.metrics === 'string' ? JSON.parse(r.metrics) : r.metrics) : [],
      media_types: r.media_types ? (typeof r.media_types === 'string' ? JSON.parse(r.media_types) : r.media_types) : [],
    }))

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('获取案例失败:', error)
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 })
  }
}
