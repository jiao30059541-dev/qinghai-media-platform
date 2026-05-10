// app/api/cities/route.ts - 城市列表API
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const cities = await query("SELECT DISTINCT city FROM media WHERE status = 'active' AND city IS NOT NULL ORDER BY city")
    // Also provide a fallback list
    const fallbackCities = ['西宁', '海东', '格尔木', '德令哈', '玉树', '黄南', '海南', '海北']
    
    return NextResponse.json({
      success: true,
      data: cities || fallbackCities.map(c => ({ city: c })),
      cities: cities || fallbackCities
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '获取城市列表失败',
      cities: ['西宁', '海东', '格尔木', '德令哈', '玉树', '黄南', '海南', '海北']
    })
  }
}
