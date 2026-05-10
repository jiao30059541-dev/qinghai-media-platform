// app/api/admin/media/[id]/review/route.ts - 管理员审核媒体资源
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key') as any
    if (decoded.role !== 'admin') return null
    return decoded
  } catch {
    return null
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json({ success: false, message: '需要管理员权限' }, { status: 403 })
    }

    const mediaId = parseInt(params.id)
    if (isNaN(mediaId)) {
      return NextResponse.json({ success: false, message: '无效的媒体ID' }, { status: 400 })
    }

    const data = await request.json()
    const { action, notes } = data

    if (!action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { success: false, message: '请指定审核操作: approved 或 rejected' },
        { status: 400 }
      )
    }

    // 检查媒体资源是否存在且为 pending 状态
    const checkSql = 'SELECT id, name, status, supplier_id FROM media WHERE id = ?'
    const records = await query(checkSql, [mediaId]) as any[]

    if (records.length === 0) {
      return NextResponse.json({ success: false, message: '媒体资源不存在' }, { status: 404 })
    }

    const media = records[0]

    // 开始事务
    await query('START TRANSACTION')

    try {
      if (action === 'approved') {
        // 审核通过 -> 设为 active
        const updateSql = 'UPDATE media SET status = ?, updated_at = NOW() WHERE id = ? AND status = ?'
        const result = await query(updateSql, ['active', mediaId, 'pending']) as any

        if (result.affectedRows === 0) {
          await query('ROLLBACK')
          return NextResponse.json(
            { success: false, message: '媒体资源状态不是 pending，无法审核通过' },
            { status: 400 }
          )
        }
      } else {
        // 审核驳回 -> 设为 inactive，并记录驳回原因
        const updateSql = 'UPDATE media SET status = ?, reject_reason = ?, updated_at = NOW() WHERE id = ? AND status = ?'
        const result = await query(updateSql, ['inactive', notes || '管理员驳回', mediaId, 'pending']) as any

        if (result.affectedRows === 0) {
          await query('ROLLBACK')
          return NextResponse.json(
            { success: false, message: '媒体资源状态不是 pending，无法驳回' },
            { status: 400 }
          )
        }
      }

      // 记录审核日志
      const logSql = `
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, ?, 'media', ?, ?, NOW())
      `
      await query(logSql, [
        admin.userId,
        action === 'approved' ? 'review_media_approved' : 'review_media_rejected',
        mediaId,
        JSON.stringify({
          mediaName: media.name,
          supplierId: media.supplier_id,
          action,
          notes: notes || null
        })
      ])

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: action === 'approved' ? '媒体资源审核通过，已上架' : '媒体资源审核驳回',
        data: { mediaId, status: action === 'approved' ? 'active' : 'inactive', notes: notes || null }
      })

    } catch (error) {
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('审核媒体资源失败:', error)
    return NextResponse.json(
      { success: false, message: '审核媒体资源失败' },
      { status: 500 }
    )
  }
}
