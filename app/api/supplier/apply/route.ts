// app/api/supplier/apply/route.ts - 供应商入驻申请 + AI智能初审 + 自动创建账号
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// AI智能评分函数 - 基于企业信息自动评估
function aiEvaluate(data: {
  company_name: string
  contact_name: string
  phone: string
  email: string
  city: string
  media_type: string
  description: string
}): { score: number; analysis: string; decision: 'recommend_approve' | 'recommend_reject' | 'uncertain' } {
  let score = 50 // 基础分50
  const reasons: string[] = []
  const warnings: string[] = []

  // 1. 企业名称分析
  if (data.company_name) {
    const nameLen = data.company_name.length
    if (nameLen >= 4 && nameLen <= 30) {
      score += 10
      reasons.push('企业名称规范')
    } else if (nameLen < 4) {
      score -= 10
      warnings.push('企业名称过短，建议填写完整企业全称')
    }
    // 检查是否含"有限公司"等正规后缀
    if (/有限公司|集团|股份|传媒|广告|文化/.test(data.company_name)) {
      score += 10
      reasons.push('企业名称含正规经营标识')
    }
  }

  // 2. 联系方式完整度
  if (data.phone) {
    if (/^1[3-9]\d{9}$/.test(data.phone)) {
      score += 10
      reasons.push('手机号格式正确')
    } else {
      score -= 5
      warnings.push('手机号格式异常，请核实')
    }
  }
  if (data.email) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      score += 5
      reasons.push('邮箱格式有效')
    } else {
      score -= 3
    }
  }

  // 3. 城市信息
  if (data.city) {
    const knownCities = ['西宁', '海东', '海西', '海南', '海北', '黄南', '果洛', '玉树', '格尔木', '西安', '兰州', '成都']
    if (knownCities.some(c => data.city.includes(c))) {
      score += 5
      reasons.push(`所在城市(${data.city})为已知覆盖区域`)
    } else {
      score += 2
      reasons.push('所在城市已记录')
    }
  }

  // 4. 媒体资源类型
  if (data.media_type) {
    const knownMediaTypes = ['LED', '户外', '电梯', '公交', '大牌', '灯箱', '电视', '广播', '报纸', '新媒体', '短视频', '朋友圈', '抖音', '小红书', '公众号', '信息流']
    const matchedTypes = knownMediaTypes.filter(t => data.media_type.includes(t))
    if (matchedTypes.length > 0) {
      score += Math.min(matchedTypes.length * 5, 15)
      reasons.push(`媒体资源类型丰富: ${matchedTypes.join('、')}`)
    } else {
      score -= 5
      warnings.push('媒体资源类型未识别，建议详细描述')
    }
  }

  // 5. 资源描述分析
  if (data.description) {
    const descLen = data.description.length
    if (descLen >= 50) {
      score += 10
      reasons.push('资源描述详细')
    } else if (descLen >= 20) {
      score += 5
      reasons.push('资源描述基本完整')
    } else {
      warnings.push('资源描述过于简短，建议补充详细资源信息')
    }

    // 关键信息检查
    const keyTerms = ['位置', '数量', '面积', '覆盖', '人流', '曝光', '受众', '商圈', '主干道', '高速', '广场', '社区', '学校']
    const matchedTerms = keyTerms.filter(t => data.description.includes(t))
    if (matchedTerms.length >= 3) {
      score += 10
      reasons.push(`描述中包含关键信息: ${matchedTerms.join('、')}`)
    }
  }

  // 综合评分限制在0-100
  score = Math.max(0, Math.min(100, score))

  // AI决策
  let decision: 'recommend_approve' | 'recommend_reject' | 'uncertain'
  if (score >= 70) {
    decision = 'recommend_approve'
  } else if (score <= 30) {
    decision = 'recommend_reject'
  } else {
    decision = 'uncertain'
  }

  // 生成分析报告
  let analysis = `【AI初审报告】\n`
  analysis += `综合评分: ${score}/100\n\n`
  if (reasons.length > 0) {
    analysis += `✅ 优势项:\n${reasons.map(r => `  - ${r}`).join('\n')}\n\n`
  }
  if (warnings.length > 0) {
    analysis += `⚠️ 待确认项:\n${warnings.map(w => `  - ${w}`).join('\n')}\n\n`
  }
  analysis += `AI建议: ${decision === 'recommend_approve' ? '建议通过' : decision === 'recommend_reject' ? '建议拒绝' : '需人工审核'}`

  return { score, analysis, decision }
}

export async function POST(request: NextRequest) {
  try {
    // 用请求体原始字节，手动过滤控制字符
    const buffer = await request.arrayBuffer()
    const decoder = new TextDecoder('utf-8', { fatal: false })
    const rawText = decoder.decode(buffer)
    // 调试日志
    console.log('[supplier/apply] body length:', buffer.byteLength, 'preview:', rawText.substring(0, 120))
    // 过滤掉JSON中的非法控制字符（保留换行符\n、制表符\t、回车\r）
    const cleaned = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    const data = JSON.parse(cleaned)
    const { company_name, contact_name, phone, email, city, media_type, description } = data

    // 验证必填字段
    if (!company_name || !contact_name || !phone) {
      return NextResponse.json(
        { success: false, message: '请填写企业名称、联系人和联系电话' },
        { status: 400 }
      )
    }

    // 检查手机号是否已被注册
    const existingUser = await query('SELECT id FROM users WHERE phone = ?', [phone]) as any[]
    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: '该手机号已注册，请直接登录' },
        { status: 400 }
      )
    }

    // AI智能初审
    const aiResult = aiEvaluate({ company_name, contact_name, phone, email, city, media_type, description })

    // 使用事务：创建用户 + 供应商记录 + 申请记录
    await query('START TRANSACTION')

    try {
      // 1. 创建用户（默认密码为手机号后6位）
      const defaultPassword = phone.slice(-6)
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)
      const insertUserSql = `INSERT INTO users (phone, name, password, user_type, role, status, created_at) 
        VALUES (?, ?, ?, 'supplier', 'supplier', 'active', NOW())`
      const userResult = await query(insertUserSql, [phone, contact_name, hashedPassword]) as any
      const newUserId = userResult.insertId

      // 2. 创建供应商记录（suppliers表只有: id, user_id, company_name, status, created_at）
      const insertSupplierSql = `INSERT INTO suppliers (user_id, company_name, status, created_at) 
        VALUES (?, ?, 'pending', NOW())`
      const supplierResult = await query(insertSupplierSql, [
        newUserId, company_name
      ]) as any
      const newSupplierId = supplierResult.insertId

      // 3. 创建申请记录（supplier_applications表没有user_id字段）
      const insertAppSql = `INSERT INTO supplier_applications 
        (company_name, contact_name, phone, email, city, media_type, description, 
         status, ai_score, ai_analysis, ai_decision)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
      await query(insertAppSql, [
        company_name, contact_name, phone, email || null, 
        city || null, media_type || null, description || null,
        aiResult.score, aiResult.analysis, aiResult.decision
      ])

      await query('COMMIT')

      // 生成JWT token
      const token = jwt.sign(
        { userId: newUserId, phone, userType: 'supplier', role: 'supplier' },
        process.env.JWT_SECRET || 'development-secret-key',
        { expiresIn: '7d' }
      )

      return NextResponse.json({
        success: true,
        message: '入驻申请提交成功！默认密码为手机号后6位，请尽快修改密码',
        token,
        data: {
          id: newSupplierId,
          user_id: newUserId,
          status: 'pending',
          ai_score: aiResult.score,
          ai_decision: aiResult.decision,
          ai_analysis: aiResult.analysis,
          company_name,
          contact_name,
          phone,
          default_password: defaultPassword
        }
      })

    } catch (txError) {
      await query('ROLLBACK')
      throw txError
    }

  } catch (error) {
    console.error('供应商申请失败:', error)
    return NextResponse.json(
      { success: false, message: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}
