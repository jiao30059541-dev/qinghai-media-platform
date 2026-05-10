// app/api/ai/init/route.ts - 初始化AI运营系统数据库
import { NextResponse } from 'next/server'
import { initAITables } from '@/lib/ai-db'

export async function POST() {
  try {
    await initAITables()
    return NextResponse.json({ success: true, message: 'AI tables initialized' })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
