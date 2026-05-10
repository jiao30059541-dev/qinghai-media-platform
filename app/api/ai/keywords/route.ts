// app/api/ai/keywords/route.ts - 关键词运营API
// GET: 获取关键词列表
// POST: 添加关键词
// PUT: 更新关键词优先级
// DELETE: 删除关键词

import { NextRequest, NextResponse } from 'next/server'
import { getKeywords, addKeyword, updateContentTask } from '@/lib/ai-db'
import { query } from '@/lib/db'

// ============= GET - 获取关键词列表 =============
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const priority = searchParams.get('priority') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')

    const keywords = await getKeywords({
      status: status && ['active', 'paused', 'used'].includes(status) ? status : undefined,
      priority: priority && ['high', 'medium', 'low'].includes(priority) ? priority : undefined,
      limit: Math.min(Math.max(limit, 1), 500),
    })

    return NextResponse.json({
      success: true,
      data: {
        keywords,
        total: Array.isArray(keywords) ? keywords.length : 0,
      },
    })
  } catch (error: any) {
    console.error('获取关键词列表失败:', error)
    return NextResponse.json(
      { success: false, error: `获取关键词列表失败: ${error.message || '未知错误'}` },
      { status: 500 }
    )
  }
}

// ============= POST - 添加关键词 =============
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, search_intent, priority, category } = body as {
      keyword: string
      search_intent?: string
      priority?: string
      category?: string
    }

    // 验证
    if (!keyword?.trim()) {
      return NextResponse.json(
        { success: false, error: '关键词（keyword）不能为空' },
        { status: 400 }
      )
    }

    const validIntents = ['commercial', 'knowledge', 'comparison', 'local']
    if (search_intent && !validIntents.includes(search_intent)) {
      return NextResponse.json(
        { success: false, error: `搜索意图必须为: ${validIntents.join(', ')}` },
        { status: 400 }
      )
    }

    const validPriorities = ['high', 'medium', 'low']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: `优先级必须为: ${validPriorities.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await addKeyword({
      keyword: keyword.trim(),
      search_intent: search_intent || 'knowledge',
      priority: priority || 'medium',
      category: category?.trim() || undefined,
      source: 'manual',
    })

    if (result === null) {
      return NextResponse.json(
        { success: false, error: '添加关键词失败，可能已存在' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '关键词添加成功',
      data: {
        keyword: keyword.trim(),
        search_intent: search_intent || 'knowledge',
        priority: priority || 'medium',
        category: category || null,
      },
    })
  } catch (error: any) {
    console.error('添加关键词失败:', error)
    return NextResponse.json(
      { success: false, error: `添加关键词失败: ${error.message || '未知错误'}` },
      { status: 500 }
    )
  }
}

// ============= PUT - 更新关键词优先级 =============
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, priority } = body as {
      id: number
      priority: string
    }

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { success: false, error: '关键词ID（id）不能为空且必须为数字' },
        { status: 400 }
      )
    }

    const validPriorities = ['high', 'medium', 'low']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: `优先级必须为: ${validPriorities.join(', ')}` },
        { status: 400 }
      )
    }

    await query('UPDATE keyword_bank SET priority = ? WHERE id = ?', [priority, id])

    return NextResponse.json({
      success: true,
      message: '关键词优先级更新成功',
      data: { id, priority },
    })
  } catch (error: any) {
    console.error('更新关键词失败:', error)
    return NextResponse.json(
      { success: false, error: `更新关键词失败: ${error.message || '未知错误'}` },
      { status: 500 }
    )
  }
}

// ============= DELETE - 删除关键词 =============
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idStr = searchParams.get('id')

    if (!idStr) {
      return NextResponse.json(
        { success: false, error: '请提供要删除的关键词ID（?id=xxx）' },
        { status: 400 }
      )
    }

    const id = parseInt(idStr)
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { success: false, error: '无效的关键词ID' },
        { status: 400 }
      )
    }

    await query('DELETE FROM keyword_bank WHERE id = ?', [id])

    return NextResponse.json({
      success: true,
      message: '关键词已删除',
      data: { id },
    })
  } catch (error: any) {
    console.error('删除关键词失败:', error)
    return NextResponse.json(
      { success: false, error: `删除关键词失败: ${error.message || '未知错误'}` },
      { status: 500 }
    )
  }
}
