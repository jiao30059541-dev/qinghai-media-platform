// app/api/admin/finance/route.ts - 管理员财务管理API
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

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

// 获取财务数据（管理员权限）
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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const offset = (page - 1) * limit
    
    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (type && type !== 'all') {
      whereClause += ' AND type = ?'
      params.push(type)
    }
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    if (startDate) {
      whereClause += ' AND DATE(created_at) >= ?'
      params.push(startDate)
    }
    
    if (endDate) {
      whereClause += ' AND DATE(created_at) <= ?'
      params.push(endDate)
    }
    
    // 查询财务记录总数
    const countSql = `SELECT COUNT(*) as total FROM finance ${whereClause}`
    const countResult = await query(countSql, params) as any[]
    const total = countResult[0]?.total || 0
    
    // 查询财务记录列表（包含用户和订单信息）
    const financeSql = `
      SELECT 
        f.*,
        u.real_name as user_name,
        u.company_name as user_company,
        o.id as order_id,
        0 as order_amount
      FROM finance f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN orders o ON f.order_id = o.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const financeRecords = await query(financeSql, [...params, limit, offset]) as any[]
    
    // 获取财务统计信息
    const statsSql = `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN status = 'unpaid' THEN amount ELSE 0 END) as total_unpaid,
        COUNT(DISTINCT user_id) as unique_users
      FROM finance
      ${whereClause}
    `
    
    const statsResult = await query(statsSql, params) as any[]
    const stats = statsResult[0] || {}
    
    // 计算净收入
    stats.net_income = (stats.total_income || 0) - (stats.total_expense || 0)
    
    return NextResponse.json({
      success: true,
      data: {
        records: financeRecords,
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
    console.error('获取财务数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取财务数据失败' },
      { status: 500 }
    )
  }
}

// 创建财务记录（管理员权限）
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
      userId,
      orderId,
      amount,
      type,
      status = 'pending',
      description,
      paymentMethod,
      transactionId,
      notes
    } = data
    
    // 验证必填字段
    if (!userId || !amount || !type) {
      return NextResponse.json(
        { success: false, message: '用户ID、金额和类型不能为空' },
        { status: 400 }
      )
    }
    
    // 检查用户是否存在
    const userCheckSql = 'SELECT id FROM users WHERE id = ?'
    const userCheck = await query(userCheckSql, [userId]) as any[]
    
    if (userCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 400 }
      )
    }
    
    // 如果有关联订单，检查订单是否存在
    if (orderId) {
      const orderCheckSql = 'SELECT id FROM orders WHERE id = ?'
      const orderCheck = await query(orderCheckSql, [orderId]) as any[]
      
      if (orderCheck.length === 0) {
        return NextResponse.json(
          { success: false, message: '订单不存在' },
          { status: 400 }
        )
      }
    }
    
    // 创建财务记录
    const insertSql = `
      INSERT INTO finance (
        user_id, order_id, amount, type, status,
        description, payment_method, transaction_id,
        notes, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `
    
    const result = await query(insertSql, [
      userId,
      orderId || null,
      parseFloat(amount),
      type,
      status,
      description || null,
      paymentMethod || null,
      transactionId || null,
      notes || null,
      admin.userId
    ]) as any
    
    const financeId = result.insertId
    
    // 记录操作日志
    const logSql = `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
      VALUES (?, 'create_finance_record', 'finance', ?, ?, NOW())
    `
    
    await query(logSql, [
      admin.userId,
      financeId,
      JSON.stringify({ userId, amount, type, status })
    ])
    
    return NextResponse.json({
      success: true,
      message: '财务记录创建成功',
      data: { financeId }
    })
    
  } catch (error) {
    console.error('创建财务记录失败:', error)
    return NextResponse.json(
      { success: false, message: '创建财务记录失败' },
      { status: 500 }
    )
  }
}

// 更新财务记录状态（管理员权限）
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
    const { financeId, status, paymentMethod, transactionId, notes } = data
    
    if (!financeId || !status) {
      return NextResponse.json(
        { success: false, message: '财务记录ID和状态不能为空' },
        { status: 400 }
      )
    }
    
    // 检查财务记录是否存在
    const financeCheckSql = 'SELECT id, user_id, amount, type FROM finance WHERE id = ?'
    const financeCheck = await query(financeCheckSql, [financeId]) as any[]
    
    if (financeCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '财务记录不存在' },
        { status: 404 }
      )
    }
    
    // 更新财务记录
    const updateSql = `
      UPDATE finance 
      SET status = ?, payment_method = ?, transaction_id = ?, 
          notes = ?, updated_at = NOW(), updated_by = ?
      WHERE id = ?
    `
    
    await query(updateSql, [
      status,
      paymentMethod || null,
      transactionId || null,
      notes || null,
      admin.userId,
      financeId
    ])
    
    // 记录操作日志
    const logSql = `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
      VALUES (?, 'update_finance_status', 'finance', ?, ?, NOW())
    `
    
    await query(logSql, [
      admin.userId,
      financeId,
      JSON.stringify({ 
        oldStatus: financeCheck[0].status, 
        newStatus: status,
        paymentMethod,
        transactionId 
      })
    ])
    
    return NextResponse.json({
      success: true,
      message: '财务记录状态更新成功',
      data: { financeId, status }
    })
    
  } catch (error) {
    console.error('更新财务记录状态失败:', error)
    return NextResponse.json(
      { success: false, message: '更新财务记录状态失败' },
      { status: 500 }
    )
  }
}

// 获取财务仪表盘数据
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
    const { timeframe = 'month' } = data
    
    // 根据时间范围获取财务数据
    let dateCondition = ''
    switch (timeframe) {
      case 'week':
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        break
      case 'month':
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        break
      case 'quarter':
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)'
        break
      case 'year':
        dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)'
        break
    }
    
    // 获取收入趋势数据（按天）
    const incomeTrendSql = `
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END) as daily_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as daily_expense,
        COUNT(DISTINCT user_id) as daily_customers
      FROM finance
      WHERE 1=1 ${dateCondition}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `
    
    const incomeTrend = await query(incomeTrendSql) as any[]
    
    // 获取收入分类数据
    const incomeByTypeSql = `
      SELECT 
        CASE 
          WHEN description LIKE '%广告%' THEN '广告收入'
          WHEN description LIKE '%服务%' THEN '服务费'
          WHEN description LIKE '%会员%' THEN '会员费'
          ELSE '其他收入'
        END as category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM finance
      WHERE type = 'income' AND status = 'paid' ${dateCondition}
      GROUP BY category
      ORDER BY total_amount DESC
    `
    
    const incomeByType = await query(incomeByTypeSql) as any[]
    
    // 获取待处理财务记录
    const pendingFinanceSql = `
      SELECT 
        f.*,
        u.real_name as user_name,
        u.company_name as user_company
      FROM finance f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE f.status IN ('pending', 'unpaid')
      ORDER BY f.created_at DESC
      LIMIT 10
    `
    
    const pendingFinance = await query(pendingFinanceSql) as any[]
    
    // 获取财务KPI数据
    const kpiSql = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        AVG(CASE WHEN type = 'income' AND status = 'paid' THEN amount ELSE 0 END) as avg_income_per_transaction,
        COUNT(DISTINCT user_id) as paying_customers
      FROM finance
      WHERE 1=1 ${dateCondition}
    `
    
    const kpiData = await query(kpiSql) as any[]
    const kpi = kpiData[0] || {}
    
    // 计算净收入和利润率
    kpi.net_income = (kpi.total_income || 0) - (kpi.total_expense || 0)
    kpi.profit_margin = kpi.total_income > 0 ? ((kpi.net_income / kpi.total_income) * 100).toFixed(2) : 0
    
    return NextResponse.json({
      success: true,
      data: {
        incomeTrend,
        incomeByType,
        pendingFinance,
        kpi,
        timeframe
      }
    })
    
  } catch (error) {
    console.error('获取财务仪表盘数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取财务仪表盘数据失败' },
      { status: 500 }
    )
  }
}