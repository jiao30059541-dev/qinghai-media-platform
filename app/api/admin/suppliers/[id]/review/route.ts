// app/api/admin/suppliers/[id]/review/route.ts - 管理员审核供应商
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const id = parseInt(params.id)
    const data = await request.json()
    const { action, notes } = data

    if (!action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { success: false, message: '请指定审核操作: approved 或 rejected' },
        { status: 400 }
      )
    }

    // 更新申请状态
    const updateSql = `UPDATE supplier_applications 
      SET status = ?, reviewed_by = ?, reviewed_at = NOW(), review_notes = ? 
      WHERE id = ? AND status = 'pending'`

    const result = await query(updateSql, [action, userId, notes || null, id]) as any

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: '申请不存在或已被审核' },
        { status: 400 }
      )
    }

    // 如果审核通过，同步到 suppliers 表
    if (action === 'approved') {
      const appSql = 'SELECT * FROM supplier_applications WHERE id = ?'
      const apps = await query(appSql, [id]) as any[]
      const app = apps[0]

      if (app) {
        // 查找或创建用户
        let userSql = 'SELECT id FROM users WHERE phone = ?'
        let users = await query(userSql, [app.phone]) as any[]
        let userId2: number

        if (users.length > 0) {
          userId2 = users[0].id
          // 更新角色为supplier
          await query('UPDATE users SET role = ?, user_type = ? WHERE id = ?', ['supplier', 'supplier', userId2])
        } else {
          const insertUserSql = `INSERT INTO users (phone, name, user_type, role, status, created_at) 
            VALUES (?, ?, 'supplier', 'supplier', 'active', NOW())`
          const userResult = await query(insertUserSql, [app.phone, app.contact_name]) as any
          userId2 = userResult.insertId
        }

        // 检查是否已在 suppliers 表
        const checkSql = 'SELECT id FROM suppliers WHERE user_id = ?'
        const existing = await query(checkSql, [userId2]) as any[]

        if (existing.length === 0) {
          const insertSql = `INSERT INTO suppliers (user_id, company_name, status, created_at)
            VALUES (?, ?, 'approved', NOW())`
          await query(insertSql, [userId2, app.company_name])
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approved' ? '已通过审核' : '已拒绝申请',
      data: { id, status: action }
    })

  } catch (error) {
    console.error('审核供应商申请失败:', error)
    return NextResponse.json(
      { success: false, message: '审核失败' },
      { status: 500 }
    )
  }
}
