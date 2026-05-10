// app/api/admin/analytics/route.ts - 管理员数据分析API
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

// 获取分析仪表盘数据
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
    const timeframe = searchParams.get('timeframe') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // 根据时间范围设置日期条件
    let dateCondition = ''
    let dateParams: any[] = []
    
    if (startDate && endDate) {
      dateCondition = 'AND DATE(created_at) BETWEEN ? AND ?'
      dateParams = [startDate, endDate]
    } else {
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
        default:
          dateCondition = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      }
    }
    
    // 获取关键业务指标
    const kpiSql = `
      -- 总收入和订单数
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        0 as total_revenue,
        0 as avg_order_value,
        COUNT(DISTINCT o.user_id) as active_customers,
        
        -- 媒体资源统计
        (SELECT COUNT(*) FROM media WHERE status = 'active') as active_media,
        (SELECT COUNT(DISTINCT city) FROM media WHERE status = 'active') as cities_covered,
        
        -- 用户统计
        (SELECT COUNT(*) FROM users WHERE status = 'active') as total_users,
        (SELECT COUNT(*) FROM users WHERE user_type = 'advertiser' AND status = 'active') as active_advertisers,
        (SELECT COUNT(*) FROM users WHERE user_type = 'supplier' AND status = 'active') as active_suppliers,
        
        -- 财务统计
        (SELECT SUM(amount) FROM finance WHERE type = 'income' AND status = 'paid' ${dateCondition}) as paid_income,
        (SELECT SUM(amount) FROM finance WHERE type = 'expense' ${dateCondition}) as total_expenses,
        
        -- 订单状态分布
        (SELECT COUNT(*) FROM orders WHERE status = 'completed' ${dateCondition}) as completed_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'processing' ${dateCondition}) as processing_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending' ${dateCondition}) as pending_orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'cancelled' ${dateCondition}) as cancelled_orders
      FROM orders o
      WHERE 1=1 ${dateCondition}
    `
    
    const kpiResult = await query(kpiSql, dateParams) as any[]
    const kpiData = kpiResult[0] || {}
    
    // 计算净收入和利润率
    kpiData.net_income = (kpiData.paid_income || 0) - (kpiData.total_expenses || 0)
    kpiData.profit_margin = kpiData.paid_income > 0 ? 
      ((kpiData.net_income / kpiData.paid_income) * 100).toFixed(2) : 0
    
    // 获取收入趋势数据（按天）
    const revenueTrendSql = `
      SELECT 
        DATE(o.created_at) as date,
        0 as daily_revenue,
        COUNT(DISTINCT o.id) as daily_orders,
        COUNT(DISTINCT o.user_id) as daily_customers,
        0 as avg_daily_order_value
      FROM orders o
      WHERE 1=1 ${dateCondition}
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `
    
    const revenueTrend = await query(revenueTrendSql, dateParams) as any[]
    
    // 获取订单行业分布
    const industryDistributionSql = `
      SELECT 
        COALESCE(o.industry, '未分类') as industry,
        COUNT(*) as order_count,
        0 as total_revenue,
        0 as avg_order_value
      FROM orders o
      WHERE 1=1 ${dateCondition}
      GROUP BY o.industry
      ORDER BY total_revenue DESC
      LIMIT 10
    `
    
    const industryDistribution = await query(industryDistributionSql, dateParams) as any[]
    
    // 获取城市分布
    const cityDistributionSql = `
      SELECT 
        COALESCE(o.city, '未指定') as city,
        COUNT(*) as order_count,
        0 as total_revenue
      FROM orders o
      WHERE 1=1 ${dateCondition}
      GROUP BY o.city
      ORDER BY total_revenue DESC
      LIMIT 10
    `
    
    const cityDistribution = await query(cityDistributionSql, dateParams) as any[]
    
    // 获取媒体类型表现
    const mediaPerformanceSql = `
      SELECT 
        NULL as media_type,
        COUNT(DISTINCT oi.order_id) as order_count,
        COUNT(oi.id) as item_count,
        0 as total_revenue,
        AVG(oi.unit_price) as avg_price
      FROM order_items oi
      LEFT JOIN media m ON oi.media_id = m.id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateCondition.replace('o.', 'o.').replace('created_at', 'o.created_at')}
      GROUP BY NULL
      ORDER BY total_revenue DESC
    `
    
    const mediaPerformance = await query(mediaPerformanceSql, dateParams) as any[]
    
    // 获取用户行为数据
    const userBehaviorSql = `
      SELECT 
        -- 新用户 vs 老用户
        CASE 
          WHEN u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN '新用户'
          ELSE '老用户'
        END as user_type,
        COUNT(DISTINCT o.user_id) as user_count,
        COUNT(DISTINCT o.id) as order_count,
        0 as total_revenue,
        0 as avg_order_value
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1 ${dateCondition}
      GROUP BY user_type
      
      UNION ALL
      
      SELECT 
        -- 用户类型分布
        u.user_type,
        COUNT(DISTINCT o.user_id) as user_count,
        COUNT(DISTINCT o.id) as order_count,
        0 as total_revenue,
        0 as avg_order_value
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1 ${dateCondition}
      GROUP BY u.user_type
    `
    
    const userBehavior = await query(userBehaviorSql, dateParams) as any[]
    
    // 获取转化率数据
    const conversionSql = `
      -- 用户注册到下单转化
      SELECT 
        '注册用户' as metric,
        COUNT(*) as value
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      
      UNION ALL
      
      SELECT 
        '下单用户' as metric,
        COUNT(DISTINCT user_id) as value
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      
      UNION ALL
      
      SELECT 
        '复购用户' as metric,
        COUNT(DISTINCT user_id) as value
      FROM (
        SELECT user_id, COUNT(*) as order_count
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        GROUP BY user_id
        HAVING order_count > 1
      ) as repeat_customers
    `
    
    const conversionData = await query(conversionSql) as any[]
    
    // 计算转化率
    const registeredUsers = conversionData.find(d => d.metric === '注册用户')?.value || 0
    const orderingUsers = conversionData.find(d => d.metric === '下单用户')?.value || 0
    const repeatUsers = conversionData.find(d => d.metric === '复购用户')?.value || 0
    
    const conversionRates = {
      registration_to_order: registeredUsers > 0 ? ((orderingUsers / registeredUsers) * 100).toFixed(2) : 0,
      repeat_purchase_rate: orderingUsers > 0 ? ((repeatUsers / orderingUsers) * 100).toFixed(2) : 0
    }
    
    // 获取热门媒体资源
    const topMediaSql = `
      SELECT 
        m.id,
        m.name,
        NULL as type,
        m.city,
        m.address,
        COUNT(oi.id) as order_count,
        0 as total_revenue,
        AVG(oi.unit_price) as avg_price
      FROM media m
      LEFT JOIN order_items oi ON m.id = oi.media_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateCondition.replace('o.', 'o.').replace('created_at', 'o.created_at')}
      GROUP BY m.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `
    
    const topMedia = await query(topMediaSql, dateParams) as any[]
    
    // 获取供应商表现
    const supplierPerformanceSql = `
      SELECT 
        s.id,
        NULL as company_name,
        NULL as contact_name,
        NULL as phone,
        COUNT(DISTINCT m.id) as media_count,
        COUNT(oi.id) as order_item_count,
        0 as total_revenue
      FROM suppliers s
      LEFT JOIN media m ON s.id = m.supplier_id
      LEFT JOIN order_items oi ON m.id = oi.media_id
      LEFT JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateCondition.replace('o.', 'o.').replace('created_at', 'o.created_at')}
      GROUP BY s.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `
    
    const supplierPerformance = await query(supplierPerformanceSql, dateParams) as any[]
    
    return NextResponse.json({
      success: true,
      data: {
        kpi: kpiData,
        revenueTrend,
        industryDistribution,
        cityDistribution,
        mediaPerformance,
        userBehavior,
        conversionRates,
        topMedia,
        supplierPerformance,
        timeframe: startDate && endDate ? 'custom' : timeframe,
        dateRange: startDate && endDate ? { startDate, endDate } : null
      }
    })
    
  } catch (error) {
    console.error('获取分析数据失败:', error)
    return NextResponse.json(
      { success: false, message: '获取分析数据失败' },
      { status: 500 }
    )
  }
}

// 生成分析报表
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
      reportType,
      timeframe = 'month',
      startDate,
      endDate,
      format = 'json',
      includeCharts = true,
      emailRecipients = []
    } = data
    
    if (!reportType) {
      return NextResponse.json(
        { success: false, message: '报表类型不能为空' },
        { status: 400 }
      )
    }
    
    // 根据报表类型生成数据
    let reportData: any = {}
    let reportTitle = ''
    
    switch (reportType) {
      case 'revenue':
        reportTitle = '收入分析报表'
        // 这里可以调用GET方法获取收入数据
        break
      case 'orders':
        reportTitle = '订单分析报表'
        break
      case 'users':
        reportTitle = '用户分析报表'
        break
      case 'media':
        reportTitle = '媒体资源分析报表'
        break
      case 'comprehensive':
        reportTitle = '综合业务分析报表'
        break
      default:
        return NextResponse.json(
          { success: false, message: '不支持的报表类型' },
          { status: 400 }
        )
    }
    
    // 生成报表ID和时间戳
    const reportId = `REPORT-${Date.now()}`
    const generatedAt = new Date().toISOString()
    
    // 记录报表生成日志
    const logSql = `
      INSERT INTO admin_logs (admin_id, action, target_type, details, created_at)
      VALUES (?, 'generate_report', 'report', ?, NOW())
    `
    
    await query(logSql, [
      admin.userId,
      JSON.stringify({
        reportId,
        reportType,
        timeframe,
        startDate,
        endDate,
        format,
        generatedAt
      })
    ])
    
    // 如果指定了邮件收件人，可以在这里触发邮件发送
    if (Array.isArray(emailRecipients) && emailRecipients.length > 0) {
      // 实际项目中这里应该调用邮件服务
      console.log(`报表 ${reportId} 将发送给:`, emailRecipients)
    }
    
    return NextResponse.json({
      success: true,
      message: '报表生成成功',
      data: {
        reportId,
        reportTitle,
        reportType,
        timeframe,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
        format,
        generatedAt,
        downloadUrl: `/api/admin/analytics/reports/${reportId}.${format}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7天后过期
      }
    })
    
  } catch (error) {
    console.error('生成报表失败:', error)
    return NextResponse.json(
      { success: false, message: '生成报表失败' },
      { status: 500 }
    )
  }
}

// 获取特定报表
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
    const { metrics = [], dimensions = [], filters = {} } = data
    
    // 构建动态查询
    let selectClause = 'SELECT '
    let fromClause = 'FROM orders o'
    let whereClause = 'WHERE 1=1'
    let groupByClause = ''
    const queryParams: any[] = []
    
    // 处理指标
    const metricMap: Record<string, string> = {
      'revenue': '0',
      'order_count': 'COUNT(DISTINCT o.id)',
      'customer_count': 'COUNT(DISTINCT o.user_id)',
      'avg_order_value': '0',
      'completed_orders': 'SUM(CASE WHEN o.status = "completed" THEN 1 ELSE 0 END)'
    }
    
    const selectedMetrics = metrics
      .filter((m: string) => metricMap[m])
      .map((m: string) => `${metricMap[m]} as ${m}`)
    
    if (selectedMetrics.length === 0) {
      selectedMetrics.push('COUNT(*) as record_count')
    }
    
    selectClause += selectedMetrics.join(', ')
    
    // 处理维度
    const dimensionMap: Record<string, string> = {
      'date': 'DATE(o.created_at)',
      'industry': 'o.industry',
      'city': 'o.city',
      'status': 'o.status',
      'user_type': 'u.user_type'
    }
    
    const selectedDimensions = dimensions
      .filter((d: string) => dimensionMap[d])
      .map((d: string) => dimensionMap[d])
    
    if (selectedDimensions.length > 0) {
      selectClause += ', ' + selectedDimensions.join(', ')
      groupByClause = 'GROUP BY ' + selectedDimensions.join(', ')
      
      // 如果需要用户类型维度，添加JOIN
      if (dimensions.includes('user_type')) {
        fromClause += ' LEFT JOIN users u ON o.user_id = u.id'
      }
    }
    
    // 处理过滤器
    if (filters.startDate) {
      whereClause += ' AND DATE(o.created_at) >= ?'
      queryParams.push(filters.startDate)
    }
    
    if (filters.endDate) {
      whereClause += ' AND DATE(o.created_at) <= ?'
      queryParams.push(filters.endDate)
    }
    
    if (filters.industry && filters.industry !== 'all') {
      whereClause += ' AND o.industry = ?'
      queryParams.push(filters.industry)
    }
    
    if (filters.city && filters.city !== 'all') {
      whereClause += ' AND o.city = ?'
      queryParams.push(filters.city)
    }
    
    if (filters.status && filters.status !== 'all') {
      whereClause += ' AND o.status = ?'
      queryParams.push(filters.status)
    }
    
    // 构建完整查询
    const dynamicSql = `
      ${selectClause}
      ${fromClause}
      ${whereClause}
      ${groupByClause}
      ORDER BY ${selectedDimensions.length > 0 ? selectedDimensions[0] : 'o.created_at'} DESC
      LIMIT 1000
    `
    
    const result = await query(dynamicSql, queryParams) as any[]
    
    return NextResponse.json({
      success: true,
      data: {
        metrics,
        dimensions,
        filters,
        result,
        query: dynamicSql,
        total: result.length
      }
    })
    
  } catch (error) {
    console.error('执行动态查询失败:', error)
    return NextResponse.json(
      { success: false, message: '执行动态查询失败' },
      { status: 500 }
    )
  }
}