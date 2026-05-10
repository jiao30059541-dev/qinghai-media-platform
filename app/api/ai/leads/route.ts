// app/api/ai/leads/route.ts - 线索评分API
// POST: 触发线索评分

import { NextRequest, NextResponse } from 'next/server'
import { DeepSeekService } from '@/lib/ai-deepseek'
import { buildLeadScoringPrompt } from '@/lib/ai-prompt'
import { upsertLeadScore, getHighValueLeads, markLeadNotified, logContentAction } from '@/lib/ai-db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, behaviors, consultation_content, user_info } = body as {
      user_id: number
      behaviors?: Array<{ type: string; detail?: string; timestamp?: string }>
      consultation_content?: string
      user_info?: {
        industry?: string
        budget?: number | string
        city?: string
        name?: string
        company?: string
        phone?: string
      }
    }

    // 验证
    if (!user_id || typeof user_id !== 'number') {
      return NextResponse.json(
        { success: false, error: '用户ID（user_id）不能为空且必须为数字' },
        { status: 400 }
      )
    }

    // 构建评分提示词
    const prompt = buildLeadScoringPrompt({
      userInfo: {
        userId: user_id,
        ...(user_info || {}),
      },
      behaviors: behaviors || [],
      consultationContent: consultation_content || '',
    })

    const messages = [
      { role: 'system' as const, content: prompt.system },
      { role: 'user' as const, content: prompt.user },
    ]

    // 调用 DeepSeek API
    const deepseek = new DeepSeekService()
    const result = await deepseek.chat({ messages, max_tokens: 1024, temperature: 0.3 })

    if (!result.success) {
      // API失败，使用规则引擎做基础评分
      const fallbackScore = calculateFallbackScore({
        user_info: user_info || {},
        behaviors: behaviors || [],
      })

      await upsertLeadScore({
        user_id,
        score_level: fallbackScore.level,
        score: fallbackScore.score,
        behaviors: { behaviors, consultation_content, user_info, scoring_method: 'rule_fallback' },
        ai_reason: `规则引擎评分（API不可用）: ${fallbackScore.reason}`,
      })

      await logContentAction(
        null,
        'lead_scored_fallback',
        `用户 ${user_id} 线索评分完成（规则引擎降级）: ${fallbackScore.level}`,
        { user_id, score: fallbackScore, error: result.error }
      )

      return NextResponse.json({
        success: true,
        data: {
          user_id,
          score_level: fallbackScore.level,
          score: fallbackScore.score,
          reason: fallbackScore.reason,
          isMock: true,
        },
      })
    }

    // 解析AI返回的JSON
    let scoreData: { score_level: string; score: number; reason: string; suggested_action?: string }
    try {
      const content = result.content || ''

      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        scoreData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('未找到JSON格式的评分结果')
      }

      // 验证评分结果
      const validLevels = ['high', 'medium', 'low']
      if (!validLevels.includes(scoreData.score_level)) {
        throw new Error(`无效的评分等级: ${scoreData.score_level}`)
      }

      if (typeof scoreData.score !== 'number' || scoreData.score < 0 || scoreData.score > 100) {
        throw new Error(`无效的评分分数: ${scoreData.score}`)
      }
    } catch (parseError) {
      // JSON解析失败，使用规则引擎
      const fallbackScore = calculateFallbackScore({
        user_info: user_info || {},
        behaviors: behaviors || [],
      })

      await upsertLeadScore({
        user_id,
        score_level: fallbackScore.level,
        score: fallbackScore.score,
        behaviors: { behaviors, consultation_content, user_info, raw_ai_response: result.content },
        ai_reason: `规则引擎评分（AI返回格式异常）: ${fallbackScore.reason}`,
      })

      return NextResponse.json({
        success: true,
        data: {
          user_id,
          score_level: fallbackScore.level,
          score: fallbackScore.score,
          reason: fallbackScore.reason,
          isMock: true,
          parseError: 'AI返回格式异常，已使用规则引擎降级',
        },
      })
    }

    // 保存评分结果
    await upsertLeadScore({
      user_id,
      score_level: scoreData.score_level as 'high' | 'medium' | 'low',
      score: scoreData.score,
      behaviors: { behaviors, consultation_content, user_info, ai_raw_response: result.content },
      ai_reason: scoreData.reason,
    })

    await logContentAction(
      null,
      'lead_scored',
      `用户 ${user_id} 线索评分完成: ${scoreData.score_level} (${scoreData.score}分)`,
      {
        user_id,
        score_level: scoreData.score_level,
        score: scoreData.score,
        token_used: result.usage?.total_tokens,
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        user_id,
        score_level: scoreData.score_level,
        score: scoreData.score,
        reason: scoreData.reason,
        suggested_action: scoreData.suggested_action || null,
        usage: result.usage,
      },
    })
  } catch (error: any) {
    console.error('线索评分错误:', error)
    return NextResponse.json(
      { success: false, error: `线索评分异常: ${error.message || '未知错误'}` },
      { status: 500 }
    )
  }
}

// ============= GET - 获取高价值线索列表 =============
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'high-value') {
      const leads = await getHighValueLeads()
      return NextResponse.json({
        success: true,
        data: {
          leads,
          total: Array.isArray(leads) ? leads.length : 0,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: '不支持的 action 参数，仅支持 high-value' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('获取高价值线索失败:', error)
    return NextResponse.json(
      { success: false, error: `获取高价值线索失败: ${error.message || '未知错误'}` },
      { status: 500 }
    )
  }
}

// ============= PUT - 标记线索已通知 =============
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id } = body as { user_id: number }

    if (!user_id || typeof user_id !== 'number') {
      return NextResponse.json(
        { success: false, error: '用户ID（user_id）不能为空' },
        { status: 400 }
      )
    }

    await markLeadNotified(user_id)

    return NextResponse.json({
      success: true,
      message: '线索已标记为已通知',
      data: { user_id },
    })
  } catch (error: any) {
    console.error('标记线索通知失败:', error)
    return NextResponse.json(
      { success: false, error: `标记线索通知失败: ${error.message || '未知错误'}` },
      { status: 500 }
    )
  }
}

// ============= 规则引擎降级评分（API不可用时使用） =============
function calculateFallbackScore(params: {
  user_info: { industry?: string; budget?: number | string; city?: string; name?: string; company?: string; phone?: string }
  behaviors: Array<{ type: string; detail?: string; timestamp?: string }>
}): { level: 'high' | 'medium' | 'low'; score: number; reason: string } {
  const { user_info, behaviors } = params
  let score = 0
  const reasons: string[] = []

  // 预算评分 (0-30)
  const budgetNum = typeof user_info.budget === 'number'
    ? user_info.budget
    : parseInt(String(user_info.budget || '0').replace(/[^0-9]/g, '')) || 0

  if (budgetNum >= 100000) {
    score += 30
    reasons.push('预算≥10万')
  } else if (budgetNum >= 50000) {
    score += 25
    reasons.push('预算5-10万')
  } else if (budgetNum >= 10000) {
    score += 15
    reasons.push('预算1-5万')
  } else if (budgetNum > 0) {
    score += 5
    reasons.push('预算<1万')
  }

  // 行业评分 (0-20)
  if (user_info.industry) {
    score += 15
    reasons.push('有明确行业')
  }

  // 城市评分 (0-15)
  if (user_info.city) {
    score += 10
    reasons.push('有目标城市')
  }

  // 信息完整度评分 (0-15)
  let infoScore = 0
  if (user_info.name) infoScore += 5
  if (user_info.company) infoScore += 5
  if (user_info.phone) infoScore += 5
  score += infoScore
  if (infoScore >= 10) reasons.push('信息完整度高')

  // 行为深度评分 (0-20)
  const behaviorTypes = behaviors.map(b => b.type)
  if (behaviorTypes.includes('view_detail') || behaviorTypes.includes('consultation')) {
    score += 10
    reasons.push('有深度互动')
  }
  if (behaviorTypes.includes('price_inquiry') || behaviorTypes.includes('create_plan')) {
    score += 10
    reasons.push('有明确意向')
  }
  if (behaviorTypes.includes('register') || behaviorTypes.includes('login')) {
    score += 3
  }

  // 确定等级
  let level: 'high' | 'medium' | 'low'
  if (score >= 60) {
    level = 'high'
  } else if (score >= 30) {
    level = 'medium'
  } else {
    level = 'low'
  }

  return {
    level,
    score: Math.min(score, 100),
    reason: reasons.length > 0
      ? `规则评分(${score}分): ${reasons.join('; ')}`
      : '信息不足，无法判断',
  }
}
