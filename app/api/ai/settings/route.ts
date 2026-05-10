// app/api/ai/settings/route.ts - AI运营设置API
import { NextResponse } from 'next/server'
import {
  getAISettings,
  updateAISetting,
} from '@/lib/ai-db'

export async function GET() {
  try {
    const settings = await getAISettings()

    // 配置定义（标签、类型、默认值）
    const settingDefinitions = [
      { key: 'daily_content_count', label: '每日发文数量', type: 'number', defaultValue: '3' },
      { key: 'content_ratio_industry', label: '行业知识比例(%)', type: 'number', defaultValue: '50' },
      { key: 'content_ratio_local', label: '本地媒体比例(%)', type: 'number', defaultValue: '30' },
      { key: 'content_ratio_case', label: '投放案例比例(%)', type: 'number', defaultValue: '20' },
      { key: 'auto_publish', label: '自动发布', type: 'boolean', defaultValue: 'false' },
      { key: 'require_review', label: '要求人工审核', type: 'boolean', defaultValue: 'true' },
      { key: 'content_schedule_1', label: '首次发布时间', type: 'time', defaultValue: '08:00' },
      { key: 'content_schedule_2', label: '第二次发布时间', type: 'time', defaultValue: '13:00' },
      { key: 'content_schedule_3', label: '第三次发布时间', type: 'time', defaultValue: '18:00' },
      { key: 'hot_topic_enabled', label: '热点追踪', type: 'boolean', defaultValue: 'true' },
      { key: 'lead_scoring_enabled', label: '线索评分', type: 'boolean', defaultValue: 'true' },
      { key: 'keyword_auto_generate', label: '自动生成关键词选题', type: 'boolean', defaultValue: 'true' },
    ]

    // 合并当前值与定义
    const merged = settingDefinitions.map(def => ({
      ...def,
      value: settings[def.key] ?? def.defaultValue,
    }))

    return NextResponse.json({
      success: true,
      data: {
        settings: merged,
      }
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json(
      { success: false, message: '获取设置失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: '无效的设置数据' },
        { status: 400 }
      )
    }

    for (const [key, value] of Object.entries(settings)) {
      await updateAISetting(key, String(value))
    }

    return NextResponse.json({
      success: true,
      message: '设置已保存',
    })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json(
      { success: false, message: '保存设置失败' },
      { status: 500 }
    )
  }
}
