// app/api/basket/items/route.ts - 投放篮数据API
// 根据传入的媒体ID列表，从数据库返回真实媒体数据（价格、名称等）
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        success: false,
        message: '请提供媒体ID列表',
        data: []
      })
    }

    // 将ID转为数字并去重
    const mediaIds = [...new Set(ids.map((id: any) => parseInt(id)))].filter(id => !isNaN(id))

    if (mediaIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: '无效的媒体ID',
        data: []
      })
    }

    // 查询媒体数据
    const placeholders = mediaIds.map(() => '?').join(',')
    const sql = `
      SELECT m.id, m.name, m.category_level1, m.category_level2, m.category_level3,
             m.city, m.list_price, m.deal_price, m.floor_price,
             m.daily_exposure, m.size, m.address,
             m.latitude, m.longitude
      FROM media m
      WHERE m.id IN (${placeholders}) AND m.status = 'active'
    `

    const rows = await query(sql, mediaIds) as any[]

    // 格式化返回数据
    const items = rows.map((m: any) => {
      const category = m.category_level2 || m.category_level1 || '其他'
      const exposureText = m.daily_exposure
        ? (m.daily_exposure >= 10000
          ? `${(m.daily_exposure / 10000).toFixed(1)}万`
          : m.daily_exposure.toLocaleString())
        : '暂无数据'

      return {
        id: m.id,
        name: m.name,
        city: m.city,
        category,
        image: '/images/default-media.svg',
        listPrice: Number(m.list_price) || 0,
        dealPrice: Number(m.deal_price) || 0,
        floorPrice: Number(m.floor_price) || 0,
        dailyExposure: Number(m.daily_exposure) || 0,
        exposureText: `日均${exposureText}+曝光`,
        locationScore: 8.5,
        features: ['热门资源'],
        address: m.address || '',
        size: m.size || '',
        maxQuantity: 5
      }
    })

    return NextResponse.json({
      success: true,
      data: items
    })

  } catch (error) {
    console.error('获取投放篮媒体数据失败:', error)
    return NextResponse.json({
      success: false,
      message: '获取媒体数据失败',
      error: error instanceof Error ? error.message : '未知错误',
      data: []
    }, { status: 500 })
  }
}
