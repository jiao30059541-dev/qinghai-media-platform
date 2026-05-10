// app/api/supplier/cases/route.ts - 供应商案例提交/列表
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

    const rows = await query('SELECT * FROM cases WHERE supplier_id = ? ORDER BY created_at DESC', [supplierId]) as any[]
    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    console.error('获取案例列表失败:', error)
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })

    const suppliers = await query('SELECT id FROM suppliers WHERE user_id = ?', [userId]) as any[]
    if (!suppliers[0]) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const supplierId = suppliers[0].id

    const body = await request.json()
    const { title, client, industry, challenge, solution, results, metrics, cover_image, media_types } = body

    if (!title) {
      return NextResponse.json({ success: false, message: '请填写案例标题' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO cases (supplier_id, title, client, industry, challenge, solution, results, metrics, cover_image, media_types, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        supplierId, title, client || null, industry || null,
        challenge || null, solution || null,
        results ? JSON.stringify(results) : null,
        metrics ? JSON.stringify(metrics) : null,
        cover_image || null,
        media_types ? JSON.stringify(media_types) : null
      ]
    ) as any

    return NextResponse.json({
      success: true,
      message: '案例提交成功，等待管理员审核',
      data: { id: result.insertId }
    })
  } catch (error: any) {
    console.error('案例提交失败:', error)
    return NextResponse.json({ success: false, message: '提交失败: ' + (error?.message || '') }, { status: 500 })
  }
}
