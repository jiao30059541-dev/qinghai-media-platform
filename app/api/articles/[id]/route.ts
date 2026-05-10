// app/api/articles/[id]/route.ts - 文章详情 API
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, message: '无效的文章ID' }, { status: 400 })
    }

    // Get article detail
    const articleSql = `
      SELECT id, title, content_type, keyword, content, summary,
             seo_keywords, cover_image, published_at, created_at, updated_at
      FROM ai_content_tasks
      WHERE id = ? AND status = 'published'
    `
    const rows = await query(articleSql, [id]) as any[]
    const article = rows[0]

    if (!article) {
      return NextResponse.json({ success: false, message: '文章不存在' }, { status: 404 })
    }

    // Get related articles (same content_type, exclude current)
    const relatedSql = `
      SELECT id, title, content_type, keyword, summary, seo_keywords,
             cover_image, published_at
      FROM ai_content_tasks
      WHERE status = 'published' AND content_type = ? AND id != ?
      ORDER BY published_at DESC
      LIMIT 4
    `
    const related = await query(relatedSql, [article.content_type, id]) as any[]

    return NextResponse.json({
      success: true,
      data: {
        article,
        related: related || []
      }
    })
  } catch (error: any) {
    console.error('获取文章详情失败:', error)
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 })
  }
}
