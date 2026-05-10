
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const city = searchParams.get('city')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('q')
    const sortBy = searchParams.get('sort') || 'newest'

    let whereClause = "WHERE m.status = 'active'"
    const params: any[] = []

    if (city && city !== 'all') {
      const cityMap: Record<string, string> = {
        xining: '西宁', haidong: '海东', geermu: '格尔木',
        delingha: '德令哈', yushu: '玉树', huangnan: '黄南',
        hainan: '海南', haibei: '海北'
      }
      whereClause += ' AND m.city = ?'
      params.push(cityMap[city] || city)
    }

    if (category && category !== 'all') {
      const catMap: Record<string, string> = {
        led: 'LED大屏', billboard: '户外大牌', wall: '墙体广告',
        elevator: '电梯广告', gate: '道闸广告', airport: '机场广告',
        bus: '公交广告', tv: '电视广告', digital: '数字广告'
      }
      whereClause += ' AND (m.category_level1 LIKE ? OR m.category_level2 LIKE ?)'
      params.push('%' + catMap[category] + '%', '%' + catMap[category] + '%')
    }

    if (minPrice) {
      whereClause += ' AND m.deal_price >= ?'
      params.push(parseFloat(minPrice))
    }
    if (maxPrice) {
      whereClause += ' AND m.deal_price <= ?'
      params.push(parseFloat(maxPrice))
    }
    if (search) {
      whereClause += ' AND (m.name LIKE ? OR m.city LIKE ? OR m.category_level1 LIKE ?)'
      params.push('%' + search + '%', '%' + search + '%', '%' + search + '%')
    }

    let orderClause = 'ORDER BY m.created_at DESC'
    switch (sortBy) {
      case 'price_low': orderClause = 'ORDER BY m.deal_price ASC'; break
      case 'price_high': orderClause = 'ORDER BY m.deal_price DESC'; break
      case 'exposure_high': orderClause = 'ORDER BY m.daily_exposure DESC'; break
      case 'rating_high': orderClause = 'ORDER BY m.daily_exposure DESC'; break
    }

    const countResult = await query("SELECT COUNT(*) as total FROM media m " + whereClause, params)
    const total = countResult[0]?.total || 0

    const sql = "SELECT m.id, m.name, m.category_level1, m.category_level2, m.city, m.list_price, m.deal_price, m.daily_exposure, m.size, m.status, m.created_at FROM media m " + whereClause + " " + orderClause + " LIMIT ? OFFSET ?"
    const rows = (await query(sql, [...params, limit, offset])) as any[]

    const media = rows.map((m: any) => {
      const cat = m.category_level2 || m.category_level1 || ''
      const expText = m.daily_exposure 
        ? (m.daily_exposure >= 10000 ? '日均' + (m.daily_exposure / 10000).toFixed(1) + '万+曝光' : '日均' + m.daily_exposure.toLocaleString() + '+曝光')
        : ''
      return {
        id: m.id,
        name: m.name,
        city: m.city,
        category: cat,
        exposure: expText,
        listPrice: Number(m.list_price) || 0,
        dealPrice: Number(m.deal_price) || 0,
        rating: 4.5,
        views: Math.floor(Math.random() * 300) + 50,
        dailyExposure: m.daily_exposure || 0,
        locationScore: +(8.0 + Math.random() * 1.5).toFixed(1),
        isFeatured: (m.daily_exposure || 0) > 100000,
        audience: ['精准人群', '高覆盖'],
        tags: ['户外媒体', '高曝光'],
        image: '/media/default.svg'
      }
    })

    return NextResponse.json({ success: true, data: media, pagination: { page: page, limit: limit, total: total, total_pages: Math.ceil(total / limit) } })
  } catch (error: any) {
    console.error('获取媒体列表失败:', error)
    return NextResponse.json({ success: false, message: '获取媒体列表失败', details: error.message }, { status: 500 })
  }
}
