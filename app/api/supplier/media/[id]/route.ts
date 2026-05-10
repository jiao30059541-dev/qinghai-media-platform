import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

async function getSupplierId(userId: number): Promise<number | null> {
  const s = await query('SELECT id FROM suppliers WHERE user_id = ?', [userId]) as any[]
  return s[0]?.id || null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    const supplierId = await getSupplierId(userId)
    if (!supplierId) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const rows = await query('SELECT * FROM media WHERE id = ? AND supplier_id = ?', [parseInt(params.id), supplierId]) as any[]
    if (!rows[0]) return NextResponse.json({ success: false, message: '资源不存在' }, { status: 404 })
    return NextResponse.json({ success: true, data: rows[0] })
  } catch { return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 }) }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    const supplierId = await getSupplierId(userId)
    if (!supplierId) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const mediaId = parseInt(params.id)
    const existing = await query('SELECT id FROM media WHERE id = ? AND supplier_id = ?', [mediaId, supplierId]) as any[]
    if (!existing[0]) return NextResponse.json({ success: false, message: '资源不存在或无权操作' }, { status: 404 })
    const data: any = await request.json()
    const updates: string[] = []
    const values: any[] = []
    // 供应商可编辑的内容字段（不含 status）
    const contentFields = ['name','category_level1','category_level2','category_level3','city','address','latitude','longitude','list_price','deal_price','floor_price','size','resolution','daily_exposure','description']
    // 检查是否只修改了 status（上下架操作）
    const onlyStatus = Object.keys(data).every(k => k === 'status')
    for (const field of contentFields) {
      if (data[field] !== undefined) { updates.push(field + ' = ?'); values.push(data[field]) }
    }
    // 如果修改了内容字段（非仅上下架），强制回退 pending 重新审核
    if (!onlyStatus && updates.length > 0) {
      updates.push('status = ?')
      values.push('pending')
    }
    // status 单独处理：仅当只传 status 时才直接使用
    if (onlyStatus && data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }
    if (updates.length === 0) return NextResponse.json({ success: false, message: '没有要更新的字段' }, { status: 400 })
    values.push(mediaId, supplierId)
    await query('UPDATE media SET ' + updates.join(', ') + ' WHERE id = ? AND supplier_id = ?', values)
    return NextResponse.json({ success: true, message: onlyStatus ? '状态已更新' : '更新成功，需等待管理员重新审核' })
  } catch { return NextResponse.json({ success: false, message: '更新失败' }, { status: 500 }) }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    const supplierId = await getSupplierId(userId)
    if (!supplierId) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const mediaId = parseInt(params.id)
    const existing = await query('SELECT id FROM media WHERE id = ? AND supplier_id = ?', [mediaId, supplierId]) as any[]
    if (!existing[0]) return NextResponse.json({ success: false, message: '资源不存在或无权操作' }, { status: 404 })
    await query('DELETE FROM media_assets WHERE media_id = ?', [mediaId])
    await query('DELETE FROM media_points WHERE media_id = ?', [mediaId])
    await query('DELETE FROM media WHERE id = ?', [mediaId])
    return NextResponse.json({ success: true, message: '删除成功' })
  } catch { return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 }) }
}
