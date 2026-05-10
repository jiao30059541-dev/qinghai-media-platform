// app/api/supplier/media/ai-parse/route.js - AI智能识别广告资源册子
// 流程：上传图片/PDF → Python OCR/PDF提取 → DeepSeek文本分析 → 结构化JSON
import { NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth'
import { DeepSeekService } from '@/lib/ai-deepseek'
import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import os from 'os'

const AI_SYSTEM_PROMPT = `你是一个专业的广告资源信息提取助手。请根据用户提供的广告资源描述文本，提取结构化JSON信息。

规则：
1. 只返回合法的JSON，不要任何其他文字说明
2. 不确定的字段设为空字符串或0
3. 分析文本中提及的广告位信息，提取最完整的一条
4. 价格注意单位，统一按"元/天"输出

输出格式：
{
  "name": "资源名称",
  "city": "所在城市",
  "address": "详细地址",
  "category_level2": "媒体类型，从以下选择：LED大屏|户外大牌|墙体广告|电梯广告|道闸广告|公交广告|机场广告|电视广告|数字广告|社区广告",
  "size": "尺寸",
  "resolution": "分辨率",
  "daily_exposure": 日均曝光量（数字）,
  "list_price": 挂牌价（数字，元/天）,
  "deal_price": 成交价（数字，元/天）,
  "description": "资源描述（50字以内）",
  "images_found": 1
}`

async function runOcr(tempFilePath, fileType) {
  try {
    const script = join(process.cwd(), 'scripts', 'ocr-service.py')
    const cmd = `python3 "${script}" "${tempFilePath}" --type=${fileType}`
    const output = execSync(cmd, { timeout: 30000, encoding: 'utf-8' })
    const result = JSON.parse(output.trim())
    return result
  } catch (e) {
    console.error('OCR failed:', e.message)
    return { success: false, error: e.message }
  }
}

export async function POST(request) {
  let tempFilePath = null

  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) {
      return NextResponse.json({ success: false, message: '请上传文件' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: '仅支持 JPG/PNG/WebP/GIF/PDF 格式' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, message: '文件不能超过10MB' }, { status: 400 })
    }

    // Save uploaded file to temp
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.type === 'application/pdf' ? '.pdf' : '.jpg'
    tempFilePath = join(os.tmpdir(), `ai_parse_${Date.now()}${ext}`)
    writeFileSync(tempFilePath, buffer)

    // Run OCR/PDF extraction
    const fileType = file.type === 'application/pdf' ? 'pdf' : 'image'
    const ocrResult = await runOcr(tempFilePath, fileType)

    if (!ocrResult.success || !ocrResult.text) {
      return NextResponse.json({
        success: false,
        message: '无法提取文字内容，请确认文件清晰可读',
      }, { status: 400 })
    }

    // Call DeepSeek to analyze the extracted text
    const ai = new DeepSeekService()
    if (!ai.isConfigured()) {
      return NextResponse.json({
        success: true,
        data: getMockParseResult(),
        isMock: true,
        message: 'AI服务未配置，返回模拟数据',
      })
    }

    const promptText = `以下是从广告资源文件（${fileType === 'pdf' ? 'PDF册子' : '图片'}）中提取的文字内容，请分析并提取广告资源的结构化信息：\n\n${ocrResult.text}`

    const result = await ai.chat({
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: promptText },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    })

    if (!result.success || !result.content) {
      return NextResponse.json({
        success: false,
        message: result.error || 'AI识别失败',
      }, { status: 500 })
    }

    // Parse AI response JSON
    try {
      let jsonStr = result.content.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```(?:json)?\n?/g, '').trim()
      }
      const parsed = JSON.parse(jsonStr)

      return NextResponse.json({
        success: true,
        data: {
          name: parsed.name || '',
          city: parsed.city || '',
          address: parsed.address || '',
          category_level2: parsed.category_level2 || '',
          size: parsed.size || '',
          resolution: parsed.resolution || '',
          daily_exposure: typeof parsed.daily_exposure === 'number' ? parsed.daily_exposure : 0,
          list_price: typeof parsed.list_price === 'number' ? parsed.list_price : 0,
          deal_price: typeof parsed.deal_price === 'number' ? parsed.deal_price : 0,
          description: parsed.description || '',
          lighting: parsed.lighting || '',
          orientation: parsed.orientation || '',
          images_found: typeof parsed.images_found === 'number' ? parsed.images_found : 1,
        },
        ocr_text: ocrResult.text.slice(0, 200),
        usage: result.usage,
      })
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'AI返回格式异常，请重试',
        raw: result.content,
      }, { status: 422 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '解析失败: ' + (error?.message || '未知错误'),
    }, { status: 500 })
  } finally {
    // Cleanup temp file
    if (tempFilePath) {
      try { unlinkSync(tempFilePath) } catch {}
    }
  }
}

function getMockParseResult() {
  const mockNames = ['西宁火车站LED大屏', '海东商业中心户外大牌', '格尔木昆仑路墙体广告', '西宁万达广场室内LED', '海东社区道闸广告位']
  const mockCities = ['西宁', '海东', '格尔木', '德令哈']
  const mockTypes = ['LED大屏', '户外大牌', '墙体广告', '电梯广告', '道闸广告', '公交广告']
  const name = mockNames[Math.floor(Math.random() * mockNames.length)]
  return {
    name,
    city: mockCities[Math.floor(Math.random() * mockCities.length)],
    address: name.includes('火车站') ? '城东区建国路1号火车站广场' : '',
    category_level2: mockTypes[Math.floor(Math.random() * mockTypes.length)],
    size: `${Math.floor(Math.random() * 20 + 4)}m x ${Math.floor(Math.random() * 10 + 3)}m`,
    resolution: Math.random() > 0.5 ? 'P10全彩' : '4K超高清',
    daily_exposure: Math.floor(Math.random() * 150000 + 30000),
    list_price: Math.floor(Math.random() * 40000 + 8000),
    deal_price: Math.floor(Math.random() * 30000 + 6000),
    description: `位于${name.includes('火车站') ? '火车站核心位置' : '商圈核心位置'}，日均覆盖大量人流，是品牌展示的绝佳选择。`,
    lighting: '24小时全天候',
    orientation: '面向主入口',
    images_found: 3,
  }
}
