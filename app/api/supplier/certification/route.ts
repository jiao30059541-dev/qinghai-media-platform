// app/api/supplier/certification/route.ts - 供应商资质上传/查询
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getUserIdFromToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })

    const suppliers = await query('SELECT id, company_name, license_url, authorization_url, status FROM suppliers WHERE user_id = ?', [userId]) as any[]
    if (!suppliers[0]) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })

    const s = suppliers[0]
    const hasLicense = !!s.license_url
    const hasAuthorization = !!s.authorization_url
    const certified = hasLicense && hasAuthorization

    return NextResponse.json({
      success: true,
      data: {
        supplier_id: s.id,
        company_name: s.company_name,
        status: s.status,
        license_url: s.license_url,
        authorization_url: s.authorization_url,
        has_license: hasLicense,
        has_authorization: hasAuthorization,
        certified,
        // 审核通过或有资质就算可以上传资源
        can_upload: s.status === 'approved' || certified
      }
    })
  } catch (error: any) {
    console.error('获取资质信息失败:', error)
    return NextResponse.json({ success: false, message: '获取失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })

    const suppliers = await query('SELECT id FROM suppliers WHERE user_id = ?', [userId]) as any[]
    if (!suppliers[0]) return NextResponse.json({ success: false, message: '非供应商账号' }, { status: 403 })
    const supplierId = suppliers[0].id

    const data = await request.json()
    const { type, image_base64 } = data // type: 'license' | 'authorization'

    if (!type || !['license', 'authorization'].includes(type)) {
      return NextResponse.json({ success: false, message: '请指定资质类型: license 或 authorization' }, { status: 400 })
    }
    if (!image_base64) {
      return NextResponse.json({ success: false, message: '请上传图片' }, { status: 400 })
    }

    // 解析base64图片
    const matches = image_base64.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json({ success: false, message: '图片格式无效' }, { status: 400 })
    }
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
    const buffer = Buffer.from(matches[2], 'base64')
    const filename = `supplier_${supplierId}_${type}_${Date.now()}.${ext}`
    const dir = join(process.cwd(), 'public', 'uploads', 'supplier')
    
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, filename), buffer)

    const url = `/uploads/supplier/${filename}`
    const field = type === 'license' ? 'license_url' : 'authorization_url'

    await query(`UPDATE suppliers SET ${field} = ? WHERE id = ?`, [url, supplierId])

    // 检查是否两个资质都上传了
    const updated = await query('SELECT license_url, authorization_url FROM suppliers WHERE id = ?', [supplierId]) as any[]
    const hasBoth = !!updated[0]?.license_url && !!updated[0]?.authorization_url

    return NextResponse.json({
      success: true,
      message: `${type === 'license' ? '营业执照' : '授权书'}上传成功`,
      data: { url, has_both: hasBoth }
    })
  } catch (error: any) {
    console.error('资质上传失败:', error)
    return NextResponse.json({ success: false, message: '上传失败: ' + (error?.message || '未知错误') }, { status: 500 })
  }
}
