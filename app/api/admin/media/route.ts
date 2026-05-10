// app/api/admin/media/route.ts - 管理员媒体资源管理API
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

// 获取所有媒体资源（管理员权限）
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
    const city = searchParams.get('city')
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplierId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit
    
    // 构建查询条件
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    if (type && type !== 'all') {
      whereClause += ' AND category_level1 = ?'
      params.push(type)
    }
    
    if (city && city !== 'all') {
      whereClause += ' AND city = ?'
      params.push(city)
    }
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?'
      params.push(status)
    }
    
    if (supplierId && supplierId !== 'all') {
      whereClause += ' AND supplier_id = ?'
      params.push(supplierId)
    }
    
    if (minPrice) {
      whereClause += ' AND deal_price >= ?'
      params.push(parseFloat(minPrice))
    }
    
    if (maxPrice) {
      whereClause += ' AND deal_price <= ?'
      params.push(parseFloat(maxPrice))
    }
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR address LIKE ? OR description LIKE ?)'
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }
    
    // 查询媒体资源总数
    const countSql = `SELECT COUNT(*) as total FROM media ${whereClause}`
    const countResult = await query(countSql, params) as any[]
    const total = countResult[0]?.total || 0
    
    // 查询媒体资源列表（包含供应商信息）
    const mediaSql = `
      SELECT 
        m.*,
        m.category_level1 as type,
        m.address as location,
        NULL as supplier_name,
        NULL as supplier_contact,
        NULL as supplier_phone,
        COUNT(ma.id) as asset_count,
        COUNT(mp.id) as point_count
      FROM media m
      LEFT JOIN media_assets ma ON m.id = ma.media_id
      LEFT JOIN media_points mp ON m.id = mp.media_id
      ${whereClause}
      GROUP BY m.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `
    
    const mediaList = await query(mediaSql, [...params, limit, offset]) as any[]
    
    // 获取媒体资源统计信息
    const statsSql = `
      SELECT 
        COUNT(*) as total_media,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_media,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_media,
        NULL as media_types,
        NULL as cities_covered,
        0 as avg_price,
        0 as total_value
      FROM media
      ${whereClause}
    `
    
    const statsResult = await query(statsSql, params.filter(p => typeof p !== 'string' || !p.includes('%'))) as any[]
    const stats = statsResult[0] || {}
    
    return NextResponse.json({
      success: true,
      data: {
        suppliers: [],
        media: mediaList,
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
    console.error('获取媒体资源列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取媒体资源列表失败' },
      { status: 500 }
    )
  }
}

// 创建媒体资源（管理员权限）
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
      name,
      type,
      location,
      city,
      description,
      dealPrice,
      floorPrice,
      supplierId,
      status = 'active',
      dimensions,
      dailyExposure,
      targetAudience,
      features,
      restrictions,
      assets = [],
      points = []
    } = data
    
    // 验证必填字段
    if (!name || !type || !location || !city || !dealPrice || !supplierId) {
      return NextResponse.json(
        { success: false, message: '名称、类型、位置、城市、成交价和供应商不能为空' },
        { status: 400 }
      )
    }
    
    // 检查供应商是否存在
    const supplierCheckSql = 'SELECT id FROM suppliers WHERE id = ?'
    const supplierCheck = await query(supplierCheckSql, [supplierId]) as any[]
    
    if (supplierCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '供应商不存在' },
        { status: 400 }
      )
    }
    
    // 开始事务
    await query('START TRANSACTION')
    
    try {
      // 创建媒体资源
      const insertMediaSql = `
        INSERT INTO media (
          name, type, location, city, description,
          deal_price, floor_price, supplier_id, status,
          dimensions, daily_exposure, target_audience,
          features, restrictions, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `
      
      const mediaResult = await query(insertMediaSql, [
        name,
        type,
        location,
        city,
        description || null,
        parseFloat(dealPrice),
        floorPrice ? parseFloat(floorPrice) : null,
        supplierId,
        status,
        dimensions || null,
        dailyExposure || null,
        targetAudience || null,
        features ? JSON.stringify(features) : null,
        restrictions ? JSON.stringify(restrictions) : null
      ]) as any
      
      const mediaId = mediaResult.insertId
      
      // 创建媒体资产（图片等）
      if (Array.isArray(assets) && assets.length > 0) {
        for (const asset of assets) {
          const assetSql = `
            INSERT INTO media_assets (
              media_id, asset_type, asset_url, description, created_at
            ) VALUES (?, ?, ?, ?, NOW())
          `
          
          await query(assetSql, [
            mediaId,
            asset.type || 'image',
            asset.url,
            asset.description || null
          ])
        }
      }
      
      // 创建媒体点位
      if (Array.isArray(points) && points.length > 0) {
        for (const point of points) {
          const pointSql = `
            INSERT INTO media_points (
              media_id, point_name, latitude, longitude,
              description, created_at
            ) VALUES (?, ?, ?, ?, ?, NOW())
          `
          
          await query(pointSql, [
            mediaId,
            point.name,
            point.latitude,
            point.longitude,
            point.description || null
          ])
        }
      }
      
      // 记录操作日志
      const logSql = `
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
        VALUES (?, 'create_media', 'media', ?, ?, NOW())
      `
      
      await query(logSql, [
        admin.userId,
        mediaId,
        JSON.stringify({ name, type, city, dealPrice, supplierId })
      ])
      
      // 提交事务
      await query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: '媒体资源创建成功',
        data: { mediaId }
      })
      
    } catch (error) {
      // 回滚事务
      await query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    console.error('创建媒体资源失败:', error)
    return NextResponse.json(
      { success: false, message: '创建媒体资源失败' },
      { status: 500 }
    )
  }
}

// 更新媒体资源（管理员权限）
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
    const { mediaId, updates } = data
    
    if (!mediaId || !updates || typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, message: '媒体ID和更新数据不能为空' },
        { status: 400 }
      )
    }
    
    // 检查媒体资源是否存在
    const mediaCheckSql = 'SELECT id, name FROM media WHERE id = ?'
    const mediaCheck = await query(mediaCheckSql, [mediaId]) as any[]
    
    if (mediaCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: '媒体资源不存在' },
        { status: 404 }
      )
    }
    
    // 构建更新字段
    const allowedFields = [
      'name', 'type', 'location', 'city', 'description',
      'deal_price', 'floor_price', 'supplier_id', 'status',
      'dimensions', 'daily_exposure', 'target_audience',
      'features', 'restrictions'
    ]
    
    const updateFields: string[] = []
    const updateValues: any[] = []
    
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      if (allowedFields.includes(dbKey) && value !== undefined) {
        updateFields.push(`${dbKey} = ?`)
        
        // 特殊处理JSON字段
        if (dbKey === 'features' || dbKey === 'restrictions') {
          updateValues.push(JSON.stringify(value))
        } else if (dbKey === 'deal_price' || dbKey === 'floor_price') {
          updateValues.push(parseFloat(value as string))
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
    
    // 添加更新时间
    updateFields.push('updated_at = NOW()')
    
    // 执行更新
    const updateSql = `UPDATE media SET ${updateFields.join(', ')} WHERE id = ?`
    await query(updateSql, [...updateValues, mediaId])
    
    // 记录操作日志
    const logSql = `
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, created_at)
      VALUES (?, 'update_media', 'media', ?, ?, NOW())
    `
    
    await query(logSql, [
      admin.userId,
      mediaId,
      JSON.stringify({ updates, previousData: mediaCheck[0] })
    ])
    
    return NextResponse.json({
      success: true,
      message: '媒体资源更新成功',
      data: { mediaId }
    })
    
  } catch (error) {
    console.error('更新媒体资源失败:', error)
    return NextResponse.json(
      { success: false, message: '更新媒体资源失败' },
      { status: 500 }
    )
  }
}

// 批量更新媒体资源状态
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
    const { mediaIds, status } = data
    
    if (!Array.isArray(mediaIds) || mediaIds.length === 0 || !status) {
      return NextResponse.json(
        { success: false, message: '媒体ID列表和状态不能为空' },
        { status: 400 }
      )
    }
    
    // 验证状态值
    const allowedStatuses = ['active', 'inactive', 'pending', 'sold']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: '不支持的状态值' },
        { status: 400 }
      )
    }
    
    // 开始事务
    await query('START TRANSACTION')
    
    try {
      // 批量更新状态
      const placeholders = mediaIds.map(() => '?').join(',')
      const updateSql = `UPDATE media SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`
      
      await query(updateSql, [status, ...mediaIds])
      
      // 记录批量操作日志
      const logSql = `
        INSERT INTO admin_logs (admin_id, action, target_type, details, created_at)
        VALUES (?, 'batch_update_media_status', 'media', ?, NOW())
      `
      
      await query(logSql, [
        admin.userId,
        JSON.stringify({ mediaIds, status, count: mediaIds.length })
      ])
      
      // 提交事务
      await query('COMMIT')
      
      return NextResponse.json({
        success: true,
        message: `成功更新 ${mediaIds.length} 个媒体资源状态`,
        data: { count: mediaIds.length, status }
      })
      
    } catch (error) {
      // 回滚事务
      await query('ROLLBACK')
      throw error
    }
    
  } catch (error) {
    console.error('批量更新媒体资源状态失败:', error)
    return NextResponse.json(
      { success: false, message: '批量更新媒体资源状态失败' },
      { status: 500 }
    )
  }
}