import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const allowedTypes: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: '请选择图片文件。' }, { status: 400 })
    }
    const extension = allowedTypes[file.type]
    if (!extension) {
      return NextResponse.json({ error: '仅支持 JPG、PNG 或 WebP 图片。' }, { status: 400 })
    }
    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json({ error: '图片不能超过 3MB。' }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const directory = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(directory, { recursive: true })
    const filename = `${Date.now()}-${randomUUID()}.${extension}`
    await writeFile(path.join(directory, filename), bytes)
    return NextResponse.json({ ok: true, url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Image upload failed', error)
    return NextResponse.json({ error: '图片上传失败。' }, { status: 500 })
  }
}
