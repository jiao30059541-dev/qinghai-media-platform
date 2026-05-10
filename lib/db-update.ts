// 更新数据库函数 - 添加缺失的功能

import { query } from './db'

// 获取用户信息
export async function getUserById(id: number) {
  const sql = 'SELECT * FROM users WHERE id = ?'
  const results = await query(sql, [id]) as any[]
  return results[0] || null
}

// 获取用户通过手机号
export async function getUserByPhone(phone: string) {
  const sql = 'SELECT * FROM users WHERE phone = ?'
  const results = await query(sql, [phone]) as any[]
  return results[0] || null
}

// 创建订单（增强版）
export async function createEnhancedOrder(data: {
  user_id: number
  media_ids: number[]
  industry?: string
  budget?: number
  city?: string
  ai_analysis?: string
}) {
  try {
    // 开始事务
    await query('START TRANSACTION')
    
    // 计算总价
    const mediaSql = 'SELECT id, deal_price, floor_price FROM media WHERE id IN (?)'
    const mediaList = await query(mediaSql, [data.media_ids]) as any[]
    
    const totalDealPrice = mediaList.reduce((sum, media) => sum + (media.deal_price || 0), 0)
    const totalFloorPrice = mediaList.reduce((sum, media) => sum + (media.floor_price || 0), 0)
    
    // 创建订单
    const orderSql =  ''
    const orderResult: any = await query(orderSql, [
      data.user_id,
      totalDealPrice,
      data.ai_analysis || null,
      data.industry || null,
      data.budget || null,
      data.city || null
    ])
    
    const orderId = orderResult.insertId
    
    // 创建订单明细
    for (const media of mediaList) {
      const itemSql =  ''
      await query(itemSql, [
        orderId,
        media.id,
        media.deal_price,
        media.floor_price // 初始结算价设为底价
      ])
    }
    
    // 创建财务记录
    const financeSql =  ''
    // 客户支付金额 = 成交价 * 1.1（含10%服务费）
    const clientAmount = totalDealPrice * 1.1
    const supplierAmount = totalFloorPrice
    const profit = clientAmount - supplierAmount
    
    await query(financeSql, [orderId, clientAmount, supplierAmount, profit])
    
    // 提交事务
    await query('COMMIT')
    
    return { 
      success: true, 
      order_id: orderId, 
      total_deal_price: totalDealPrice,
      total_floor_price: totalFloorPrice,
      client_amount: clientAmount,
      supplier_amount: supplierAmount,
      profit: profit
    }
  } catch (error) {
    await query('ROLLBACK')
    throw error
  }
}

// 获取用户订单
export async function getUserOrders(userId: number) {
  const sql =  ''
  return query(sql, [userId])
}

// 获取订单详情
export async function getOrderDetails(orderId: number) {
  const orderSql = 'SELECT * FROM orders WHERE id = ?'
  const itemsSql =  ''
  const financeSql = 'SELECT * FROM finance WHERE order_id = ?'
  
  const [order, items, finance] = await Promise.all([
    query(orderSql, [orderId]) as Promise<any[]>,
    query(itemsSql, [orderId]) as Promise<any[]>,
    query(financeSql, [orderId]) as Promise<any[]>
  ])
  
  return {
    order: order[0] || null,
    items: items || [],
    finance: finance[0] || null
  }
}

// 更新线索状态（AI判断后）
export async function updateLeadStatus(leadId: number, aiTag: 'high' | 'medium' | 'low', status: 'new' | 'processed') {
  const sql =  ''
  await query(sql, [aiTag, status, leadId])
  return { success: true }
}

// 获取统计数据
export async function getDashboardStats() {
  const statsSql =  ''
  
  const recentOrdersSql =  ''
  
  const [stats, recentOrders] = await Promise.all([
    query(statsSql) as Promise<any[]>,
    query(recentOrdersSql) as Promise<any[]>
  ])
  
  return {
    stats: stats[0] || {},
    recent_orders: recentOrders || []
  }
}

// 搜索广告位（支持关键词搜索）
export async function searchMedia(keyword: string, filters: {
  city?: string
  category?: string
  minPrice?: number
  maxPrice?: number
} = {}) {
  let sql = ''
  const params: any[] = []
  
  if (filters.city) {
    sql += ' AND m.city = ?'
    params.push(filters.city)
  }
  
  if (filters.category) {
    sql += ' AND (m.category_level1 = ? OR m.category_level2 = ? OR m.category_level3 = ?)'
    params.push(filters.category, filters.category, filters.category)
  }
  
  if (filters.minPrice !== undefined) {
    sql += ' AND m.deal_price >= ?'
    params.push(filters.minPrice)
  }
  
  if (filters.maxPrice !== undefined) {
    sql += ' AND m.deal_price <= ?'
    params.push(filters.maxPrice)
  }
  
  sql += ' GROUP BY m.id ORDER BY m.created_at DESC LIMIT 50'
  
  return query(sql, params)
}
