import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import jwt from 'jsonwebtoken'

// 验证JWT token
function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret-key') as any
    return decoded
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '身份验证失败' },
        { status: 401 }
      )
    }
    
    const data = await request.json()
    const {
      mediaItems,      // 广告位列表 [{id, quantity, duration, price}]
      totalAmount,     // 总金额
      industry,        // 行业
      budget,          // 预算
      city,            // 城市
      aiAnalysis,      // AI分析结果
      contactInfo,     // 联系人信息
      notes            // 备注
    } = data
    
    // 验证必填字段
    if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
      return NextResponse.json(
        { success: false, message: '请选择至少一个广告位' },
        { status: 400 }
      )
    }
    
    if (!totalAmount) {
      return NextResponse.json(
        { success: false, message: '总金额不能为空' },
        { status: 400 }
      )
    }
    
    // 开始事务
    await query('START TRANSACTION')
    
    try {
      // 创建订单
      const orderSql = `
        INSERT INTO orders (
          user_id, total_amount, ai_analysis, industry, 
          budget, city, contact_info, notes, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `
      
      const orderResult = await query(orderSql, [
        user.userId,
        totalAmount,
        aiAnalysis || null,
        industry || null,
        budget || null,
        city || null,
        contactInfo ? JSON.stringify(contactInfo) : null,
        notes || null
      ]) as any
      
      const orderId = orderResult.insertId
      
      // 创建订单明细
      for (const item of mediaItems) {
        const mediaSql = 'SELECT id, name, deal_price, floor_price FROM media WHERE id = ?'
        const mediaList = await query(mediaSql, [item.id]) as any[]
        
        if (mediaList.length === 0) {
          throw new Error(`广告位ID ${item.id} 不存在`)
        }
        
        const media = mediaList[0]
        const itemPrice = item.price || media.deal_price || 0
        const itemTotal = itemPrice * (item.quantity || 1) * (item.duration || 1)
        
        const orderItemSql = `
          INSERT INTO order_items (
            order_id, media_id, media_name, quantity, 
            duration, unit_price, 0 as total_price, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `
        
        await query(orderItemSql, [
          orderId,
          item.id,
          media.name,
          item.quantity || 1,
          item.duration || 1,
          itemPrice,
          itemTotal
        ])
      }
      
      // 创建财务记录
      const financeSql = `
        INSERT INTO finance (
          order_id, user_id, amount, type, status, created_at
        ) VALUES (?, ?, ?, 'order', 'unpaid', NOW())
      `
      
      await query(financeSql, [orderId, user.userId, totalAmount])
      
      // 提交事务
      await query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: '订单创建成功',
        data: {
          orderId,
          orderNumber: `ORD${Date.now()}${orderId}`,
          totalAmount,
          itemCount: mediaItems.length,
          createdAt: new Date().toISOString()
        }
      })
      
    } catch (error) {
      // 回滚事务
      await query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    console.error('创建订单失败:', error)
    
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    
    return NextResponse.json({
      success: false,
      message: `创建订单失败: ${errorMessage}`,
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}

// 获取用户订单列表
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json(
        { success: false, message: '身份验证失败' },
        { status: 401 }
      )
    }
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const offset = (page - 1) * limit
    
    // 构建查询条件
    let whereClause = 'WHERE o.user_id = ?'
    const params: any[] = [user.userId]
    
    if (status) {
      whereClause += ' AND o.status = ?'
      params.push(status)
    }
    
    // 查询订单总数
    const countSql = `SELECT COUNT(*) as total FROM orders o ${whereClause}`
    const countResult = await query(countSql, params) as any[]
    const total = countResult[0]?.total || 0
    
    // 查询订单列表
    const ordersSql = `
      SELECT 
        o.*,
        COUNT(oi.id) as item_count,
        0 as actual_total
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const orders = await query(ordersSql, [...params, limit, offset]) as any[]
    
    // 查询每个订单的明细
    for (const order of orders) {
      const itemsSql = `
        SELECT * FROM order_items 
        WHERE order_id = ? 
        ORDER BY created_at
      `
      const items = await query(itemsSql, [order.id]) as any[]
      order.items = items
    }
    
    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('获取订单列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取订单列表失败' },
      { status: 500 }
    )
  }
}