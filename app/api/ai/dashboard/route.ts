// app/api/ai/dashboard/route.ts - AI运营Dashboard数据API
import { NextResponse } from 'next/server'
import {
  getAIDashboardStats,
  getHighValueLeads,
  getContentTasks,
  getKeywords,
  getTopics,
} from '@/lib/ai-db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'today'

    const [
      stats,
      highValueLeads,
      contentTasks,
      keywords,
      topics,
    ] = await Promise.all([
      getAIDashboardStats(),
      getHighValueLeads(),
      getContentTasks(),
      getKeywords(),
      getTopics(10),
    ])

    // 按状态统计文章
    const publishedCount = (contentTasks as any[]).filter(t => t.status === 'published').length
    const pendingCount = (contentTasks as any[]).filter(t => t.status === 'pending_review').length
    const draftCount = (contentTasks as any[]).filter(t => t.status === 'draft').length

    // 获取最近发布的任务
    const recentTasks = (contentTasks as any[]).slice(0, 10)

    // 按优先级统计关键词
    const highPriorityKeywords = (keywords as any[]).filter(k => k.priority === 'high').length
    const activeKeywordCount = (keywords as any[]).filter(k => k.status === 'active').length

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        published_count: publishedCount,
        pending_review_count: pendingCount,
        draft_count: draftCount,
        high_priority_keywords: highPriorityKeywords,
        active_keyword_count: activeKeywordCount,
        keyword_coverage: activeKeywordCount,
        recent_tasks: recentTasks,
        high_value_leads_list: highValueLeads,
        topics: topics,
        // 按内容类型统计
        content_by_type: (contentTasks as any[]).reduce((acc: any, t: any) => {
          acc[t.content_type] = (acc[t.content_type] || 0) + 1
          return acc
        }, {}),
        // SEO流量趋势（模拟每日数据趋势）
        seo_trend: generateTrendData(timeframe),
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, message: '获取Dashboard数据失败' },
      { status: 500 }
    )
  }
}

// 生成趋势数据（后续可从真实SEO统计表获取）
function generateTrendData(timeframe: string) {
  const points = timeframe === 'today' ? 24 : timeframe === 'week' ? 7 : 30
  const now = new Date()
  const data: any[] = []

  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now)
    if (timeframe === 'today') {
      date.setHours(date.getHours() - i)
      data.push({
        label: `${date.getHours()}:00`,
        views: Math.floor(Math.random() * 200) + 50,
        clicks: Math.floor(Math.random() * 30) + 5,
      })
    } else {
      date.setDate(date.getDate() - i)
      data.push({
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        views: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 60) + 10,
      })
    }
  }
  return data
}
