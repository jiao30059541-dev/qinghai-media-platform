// app/api/articles/route.ts - 投放研究文章列表 API
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')))
    const contentType = searchParams.get('contentType') || ''
    const keyword = searchParams.get('keyword') || ''

    const offset = (page - 1) * pageSize

    // Build WHERE clause
    const conditions: string[] = ["status = 'published'"]
    const params: any[] = []

    if (contentType && ['industry', 'local', 'case'].includes(contentType)) {
      conditions.push('content_type = ?')
      params.push(contentType)
    }

    if (keyword) {
      conditions.push('(title LIKE ? OR summary LIKE ? OR seo_keywords LIKE ?)')
      const like = `%${keyword}%`
      params.push(like, like, like)
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM ai_content_tasks ${where}`
    const countResult = await query(countSql, params) as any[]
    const total = countResult[0]?.total || 0

    // Get articles
    const sql = `
      SELECT id, title, content_type, keyword, summary, seo_keywords,
             cover_image, published_at, created_at
      FROM ai_content_tasks
      ${where}
      ORDER BY published_at DESC, created_at DESC
      LIMIT ? OFFSET ?
    `
    const articles = await query(sql, [...params, pageSize, offset]) as any[]

    return NextResponse.json({
      success: true,
      data: {
        articles: articles || [],
        total,
        page,
        pageSize
      }
    })
  } catch (error: any) {
    console.error('获取文章列表失败:', error)
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 })
  }
}
