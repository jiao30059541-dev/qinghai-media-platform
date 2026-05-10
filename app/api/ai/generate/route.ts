// app/api/ai/generate/route.ts - AI内容生成API
// POST: 接收 {content_type, keyword, title?} 调用DeepSeek生成内容
// 存入 ai_content_tasks，记录日志到 ai_content_logs

import { NextRequest, NextResponse } from 'next/server'
import { DeepSeekService } from '@/lib/ai-deepseek'
import { buildContentPrompt } from '@/lib/ai-prompt'
import { createContentTask, updateContentTask, logContentAction } from '@/lib/ai-db'

// 内容类型映射
const CONTENT_TYPE_MAP: Record<string, 'industry' | 'local' | 'case'> = {
  industry: 'industry',
  local: 'local',
  case: 'case',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content_type, keyword, title } = body as {
      content_type: string
      keyword: string
      title?: string
    }

    // 验证必填字段
    if (!keyword?.trim()) {
      return NextResponse.json(
        { success: false, error: '关键词（keyword）不能为空' },
        { status: 400 }
      )
    }

    if (!content_type || !CONTENT_TYPE_MAP[content_type]) {
      return NextResponse.json(
        { success: false, error: '内容类型（content_type）必须为 industry、local 或 case' },
        { status: 400 }
      )
    }

    // 构建提示词
    const prompt = buildContentPrompt({
      keyword: keyword.trim(),
      title: title?.trim(),
      contentType: CONTENT_TYPE_MAP[content_type],
    })

    const messages = [
      { role: 'system' as const, content: prompt.system },
      { role: 'user' as const, content: prompt.user },
    ]

    // 调用 DeepSeek API
    const deepseek = new DeepSeekService()
    const result = await deepseek.chat({ messages, max_tokens: 4096 })

    if (!result.success) {
      // API失败时，依然创建任务但标记为失败状态
      const fallbackContent = `# ${title || keyword}\n\n## 内容生成失败\n\nAI内容生成服务暂时不可用，请稍后重试。\n\n关键词：${keyword}\n类型：${content_type}\n错误：${result.error || '未知错误'}`

      const taskId = await createContentTask({
        title: title || keyword,
        content_type: CONTENT_TYPE_MAP[content_type],
        keyword: keyword.trim(),
      })

      await updateContentTask(taskId, {
        content: fallbackContent,
        status: 'failed',
        ai_model: 'deepseek-chat',
        token_used: 0,
      })

      await logContentAction(
        taskId,
        'generate_failed',
        `内容生成失败: ${result.error || 'API调用失败'}`,
        { keyword, content_type, error: result.error }
      )

      return NextResponse.json({
        success: false,
        error: result.error || '内容生成失败',
        data: {
          task_id: taskId,
          title: title || keyword,
          content_type,
          keyword: keyword.trim(),
          status: 'failed',
        },
      }, { status: 502 })
    }

    // 成功 - 创建内容任务
    const generatedTitle = title || keyword
    const taskId = await createContentTask({
      title: generatedTitle,
      content_type: CONTENT_TYPE_MAP[content_type],
      keyword: keyword.trim(),
    })

    // 提取标题和摘要
    const content = result.content || ''
    const firstLine = content.split('\n').find(line => line.trim().startsWith('# '))
    const finalTitle = firstLine
      ? firstLine.replace(/^#+\s*/, '').trim()
      : generatedTitle
    const summary = content
      .replace(/^#+\s*.*$/gm, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 200)

    await updateContentTask(taskId, {
      title: finalTitle,
      content,
      summary: summary || undefined,
      status: 'draft',
      ai_model: 'deepseek-chat',
      token_used: result.usage?.total_tokens || 0,
    })

    await logContentAction(
      taskId,
      'generated',
      `内容生成成功，token消耗: ${result.usage?.total_tokens || '未知'}`,
      {
        keyword,
        content_type,
        token_used: result.usage?.total_tokens,
        prompt_tokens: result.usage?.prompt_tokens,
        completion_tokens: result.usage?.completion_tokens,
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        title: finalTitle,
        content,
        summary,
        content_type,
        keyword: keyword.trim(),
        status: 'draft',
        token_used: result.usage?.total_tokens || 0,
        usage: result.usage,
      },
    })
  } catch (error: any) {
    console.error('AI内容生成错误:', error)

    return NextResponse.json(
      {
        success: false,
        error: `内容生成服务异常: ${error.message || '未知错误'}`,
      },
      { status: 500 }
    )
  }
}
