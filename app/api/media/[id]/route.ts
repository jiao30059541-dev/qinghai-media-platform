import { NextRequest, NextResponse } from 'next/server'
import { getMediaById, getMediaAssets, getMediaPoints } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: '无效的广告位ID' },
        { status: 400 }
      )
    }
    const media = await getMediaById(id)
    if (!media) {
      return NextResponse.json(
        { success: false, message: '广告位不存在' },
        { status: 404 }
      )
    }
    const [assets, points] = await Promise.all([
      getMediaAssets(id),
      getMediaPoints(id)
    ])
    return NextResponse.json({
      success: true,
      data: { ...media, assets: assets || [], points: points || [] }
    })
  } catch (error) {
    console.error('获取媒体详情失败:', error)
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    )
  }
}
