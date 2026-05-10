// app/api/admin/suppliers/route.ts - 管理员获取供应商申请列表
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let whereClause = ''
    const params: any[] = []

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereClause = 'WHERE a.status = ?'
      params.push(status)
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM supplier_applications a ${whereClause}`
    const countResult = await query(countSql, params) as any[]
    const total = countResult[0]?.total || 0

    // 获取列表
    const sql = `
      SELECT a.*, u.name as reviewer_name
      FROM supplier_applications a
      LEFT JOIN users u ON a.reviewed_by = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `
    const applications = await query(sql, [...params, limit, offset]) as any[]

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('获取供应商申请列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取失败' },
      { status: 500 }
    )
  }
}
