// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

function generateMockPlan(params: any): string {
  const { industry = '通用', budget = '5万', city = '青海', targetAudience = '大众', timeline = '3个月' } = params
  const budgetNum = parseInt(String(budget).replace(/[^0-9]/g, '')) || 5

  return `# ${industry}广告投放方案

## 一、市场分析
**${city}** 广告市场持续增长，${industry}行业竞争日趋激烈。本地消费者对精准化广告接受度较高，户外广告和社区媒体仍是核心触达渠道。

## 二、投放策略

### 核心策略
- **精准触达**：聚焦${targetAudience}群体高流量场景
- **组合投放**：多渠道协同，形成立体覆盖
- **节奏优化**：分阶段投放，动态调整

### 预算分配（总预算${budget}）
- 主力媒体（50%）：${budgetNum > 50 ? '商圈LED大屏 + 机场/高铁广告' : '社区电梯广告 + 商圈小屏'}
- 辅助媒体（30%）：本地公众号矩阵 + 朋友圈广告
- 效果补充（20%）：抖音/快手信息流 + 本地生活平台

### 投放节奏
- 第1个月（40%预算）：集中爆发，快速建立认知
- 第2-${parseInt(String(timeline).replace(/[^0-9]/g, '')) || 3}个月（50%预算）：持续曝光，强化记忆
- 最后阶段（10%预算）：收尾巩固，收集效果数据

## 三、创意建议
- 突出本地化元素，与${city}文化特色结合
- 使用简洁有力的文案，突出核心卖点
- 视觉设计采用高对比度色彩，提升辨识度
- 建议准备3-5个版本进行A/B测试

## 四、预期效果
- 日均曝光：${budgetNum > 50 ? '50万+' : budgetNum > 20 ? '20万+' : '5万+'}人次
- 目标人群覆盖率：70%以上
- 预计ROI：1:${industry === '餐饮' ? '3.5' : industry === '房地产' ? '4.0' : '2.8'}

## 五、优化建议
- 每周监测核心数据（曝光量、到店率、转化率）
- 根据数据反馈灵活调整投放策略
- 关注节假日节点，适时加大投放力度
- 准备备选创意，持续优化广告效果

---
*方案由AI智能生成，具体投放以实际资源为准，建议联系客服获取专属报价。*`
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      userId,
      mediaIds = [],
      industry,
      budget,
      city,
      targetAudience,
      campaignGoal,
      timeline
    } = data

    // Flexible validation - either userId+mediaIds OR just industry+city+budget
    const hasMinFields = (userId && Array.isArray(mediaIds) && mediaIds.length > 0) ||
                         (industry && city && budget)

    if (!hasMinFields) {
      return NextResponse.json(
        { success: false, message: '请提供投放信息（行业、预算、城市）' },
        { status: 400 }
      )
    }

    // Try DeepSeek API
    if (DEEPSEEK_API_KEY && !DEEPSEEK_API_KEY.includes('your-')) {
      try {
        const prompt = `请根据以下信息生成详细的广告投放方案：
- 行业：${industry || '未指定'}
- 预算：${budget}
- 目标城市：${city}
- 目标受众：${targetAudience || '未指定'}
- 投放目标：${campaignGoal || '品牌曝光和获客'}
- 投放周期：${timeline || '3个月'}

请包含：市场分析、投放策略、预算分配、创意建议、预期效果、优化建议。用中文撰写，保持专业易懂。`

        const response = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是一个专业的广告投放策略专家。' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        })

        if (response.ok) {
          const result = await response.json()
          const aiAnalysis = result.choices?.[0]?.message?.content || ''
          if (aiAnalysis) {
            return NextResponse.json({
              success: true,
              message: '投放方案生成成功',
              data: {
                solution: aiAnalysis,
                aiAnalysis,
                generatedAt: new Date().toISOString(),
                isMock: false,
                parameters: { industry, budget, city, targetAudience, timeline }
              }
            })
          }
        }
      } catch (apiError) {
        console.error('DeepSeek API错误:', apiError)
      }
    }

    // Fallback to intelligent mock
    const mockSolution = generateMockPlan({ industry, budget, city, targetAudience, timeline })

    return NextResponse.json({
      success: true,
      message: '投放方案生成成功',
      data: {
        solution: mockSolution,
        aiAnalysis: mockSolution,
        generatedAt: new Date().toISOString(),
        isMock: true,
        parameters: { industry, budget, city, targetAudience, timeline }
      }
    })

  } catch (error) {
    console.error('生成投放方案失败:', error)
    return NextResponse.json(
      { success: false, message: '方案生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
