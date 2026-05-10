// app/api/admin/users/route.ts - 管理员用户管理API
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// 验证管理员JWT token
function verifyAdminToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key') as any
    // 检查用户角色是否为管理员
    if (decoded.role !== 'admin') {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// 获取所有用户（管理员权限）
export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const userType = searchParams.get('userType')
    const industry = searchParams.get('industry')
    const idCardVerified = searchParams.get('idCardVerified')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit
    
    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    if (userType && userType !== 'all') {
      whereClause += ' AND user_type = ?'
      params.push(userType)
    }
    
    if (industry && industry !== 'all') {
      whereClause += ' AND industry = ?'
      params.push(industry)
    }
    
    if (idCardVerified && idCardVerified !== 'all') {
      const verified = idCardVerified === 'verified' ? 1 : 0
      whereClause += ' AND id_card_verified = ?'
      params.push(verified)
    }
    
    if (search) {
      whereClause += ' AND (real_name LIKE ? OR phone LIKE ? OR email LIKE ? OR company_name LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }
    
    // 查询用户总数
    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`
    const countResult = await query(countSql, params) as any[]
    const total = countResult[0]?.total || 0
    
    // 查询用户列表
    const usersSql = `
      SELECT 
        id, real_name, phone, email, company_name, industry,
        user_type, status, id_card_verified, created_at,
        NULL as order_count, NULL as total_spent
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const users = await query(usersSql, [...params, limit, offset]) as any[]
    
    // 获取用户统计信息
    const statsSql = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
        COUNT(CASE WHEN user_type = 'advertiser' THEN 1 END) as advertisers,
        COUNT(CASE WHEN user_type = 'supplier' THEN 1 END) as suppliers,
        COUNT(CASE WHEN id_card_verified = 1 THEN 1 END) as verified_users,
        0 as avg_orders_per_user,
        0 as total_revenue
      FROM users
      ${whereClause}
    `
    
    const statsResult = await query(statsSql, params.filter(p => !p.includes('%'))) as any[]
    const stats = statsResult[0] || {}
    
    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats
      }
    })
    
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取用户列表失败' },
      { status: 500 }
    )
  }
}

// 创建新用户（管理员权限）
export async function POST(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    const {
      realName,
      phone,
      email,
      companyName,
      industry,
      userType = 'advertiser',
      password,
      idCard,
      idCardVerified = false,
      status = 'active'
    } = data
    
    // 验证必填字段
    if (!realName || !phone || !password) {
      return NextResponse.json(
        { success: false, message: '姓名、电话和密码不能为空' },
        { status: 400 }
      )
    }
    
    // 检查手机号是否已存在
    const checkPhoneSql = 'SELECT id FROM users WHERE phone = ?'
    const existingUser = await query(checkPhoneSql, [phone]) as any[]
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: '手机号已注册' },
        { status: 400 }
      )
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 创建用户
    const insertSql = `
      INSERT INTO users (
        real_name, phone, email, company_name, industry,
        user_type, password, id_card, id_card_verified,
        status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `
    
    const result = await query(insertSql, [
      realName,
      phone,
      email || null,
      companyName || null,
      industry || null,
      userType,
      hashedPassword,
      idCard || null,
      idCardVerified ? 1 : 0,
      status
    ]) as any
    
    const userId = result.insertId
    
    // 记录操作日志
    const logSql = `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
      VALUES (?, 'create_user', 'user', ?, ?, NOW())
    `
    
    await query(logSql, [
      admin.userId,
      userId,
      JSON.stringify({ realName, phone, userType, status })
    ])
    
    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      data: { userId }
    })
    
  } catch (error) {
    console.error('创建用户失败:', error)
    return NextResponse.json(
      { success: false, message: '创建用户失败' },
      { status: 500 }
    )
  }
}

// 更新用户信息（管理员权限）
export async function PATCH(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    const { userId, updates } = data
    
    if (!userId || !updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, message: '用户ID和更新数据不能为空' },
        { status: 400 }
      )
    }
    
    // 检查用户是否存在
    const userCheckSql = 'SELECT id, real_name FROM users WHERE id = ?'
    const userCheck = await query(userCheckSql, [userId]) as any[]
    
    if (userCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }
    
    // 构建更新字段
    const allowedFields = [
      'real_name', 'phone', 'email', 'company_name', 'industry',
      'user_type', 'status', 'id_card', 'id_card_verified'
    ]
    
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      if (allowedFields.includes(dbKey) && value !== undefined) {
        updateFields.push(`${dbKey} = ?`)
        
        // 特殊处理布尔值
        if (dbKey === 'id_card_verified') {
          updateValues.push(value ? 1 : 0)
        } else {
          updateValues.push(value)
        }
      }
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: '没有有效的更新字段' },
        { status: 400 }
      )
    }
    
    // 如果有密码更新，需要加密
    if (updates.password) {
      const hashedPassword = await bcrypt.hash(updates.password, 10)
      updateFields.push('password = ?')
      updateValues.push(hashedPassword)
    }
    
    // 添加更新时间
    updateFields.push('updated_at = NOW()')
    
    // 执行更新
    const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
    await query(updateSql, [...updateValues, userId])
    
    // 记录操作日志
    const logSql = `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
      VALUES (?, 'update_user', 'user', ?, ?, NOW())
    `
    
    await query(logSql, [
      admin.userId,
      userId,
      JSON.stringify({ updates, previousData: userCheck[0] })
    ])
    
    return NextResponse.json({
      success: true,
      message: '用户信息更新成功',
      data: { userId }
    })
    
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { success: false, message: '更新用户信息失败' },
      { status: 500 }
    )
  }
}

// 批量操作用户
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const admin = verifyAdminToken(token)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '需要管理员权限' },
        { status: 403 }
      )
    }
    
    const data = await request.json()
    const { userIds, action, value } = data
    
    if (!Array.isArray(userIds) || userIds.length === 0 || !action) {
      return NextResponse.json(
        { success: false, message: '用户ID列表和操作类型不能为空' },
        { status: 400 }
      )
    }
    
    // 验证操作类型
    const allowedActions = ['activate', 'deactivate', 'verify_id', 'unverify_id']
    if (!allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, message: '不支持的操作类型' },
        { status: 400 }
      )
    }
    
    // 开始事务
    await query('START TRANSACTION')
    
    try {
      let updateField = ''
      let updateValue: any = ''
      
      switch (action) {
        case 'activate':
          updateField = 'status'
          updateValue = 'active'
          break
        case 'deactivate':
          updateField = 'status'
          updateValue = 'inactive'
          break
        case 'verify_id':
          updateField = 'id_card_verified'
          updateValue = 1
          break
        case 'unverify_id':
          updateField = 'id_card_verified'
          updateValue = 0
          break
      }
      
      // 批量更新
      const placeholders = userIds.map(() => '?').join(',')
      const updateSql = `UPDATE users SET ${updateField} = ?, updated_at = NOW() WHERE id IN (${placeholders})`
      
      await query(updateSql, [updateValue, ...userIds])
      
      // 记录批量操作日志
      const logSql = `
        INSERT INTO admin_logs (admin_id, action, target_type, details, created_at)
        VALUES (?, 'batch_${action}_users', 'user', ?, NOW())
      `
      
      await query(logSql, [
        admin.userId,
        JSON.stringify({ userIds, action, value, count: userIds.length })
      ])
      
      // 提交事务
      await query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: `成功对 ${userIds.length} 个用户执行 ${action} 操作`,
        data: { count: userIds.length, action }
      })
      
    } catch (error) {
      // 回滚事务
      await query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    console.error('批量操作用户失败:', error)
    return NextResponse.json(
      { success: false, message: '批量操作用户失败' },
      { status: 500 }
    )
  }
}