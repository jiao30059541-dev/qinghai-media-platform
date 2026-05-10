'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MapPin, Clock, Eye, Ruler, Tag, Users, CheckCircle, Share2, Heart, Loader2, AlertCircle } from 'lucide-react'
import ImageGallery from './components/ImageGallery'

function RelatedMediaCard({ item }: { item: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <div className="text-4xl">{'🏙️'}</div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{item.city} {'·'} {item.category_level2}</p>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-lg font-bold text-primary">¥{item.deal_price?.toLocaleString()}</div>
            <div className="text-xs text-gray-500 line-through">¥{item.list_price?.toLocaleString()}</div>
          </div>
          <a href={`/media/${item.id}`} className="text-sm text-primary hover:underline">查看详情</a>
        </div>
      </div>
    </div>
  )
}

export default function MediaDetailPage() {
  const params = useParams()
  const id = params.id as string
  
  const [media, setMedia] = useState<any>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [points, setPoints] = useState<any[]>([])
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddedToPlan, setIsAddedToPlan] = useState(false)
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/media/${id}`)
        const json = await res.json()
        if (!json.success) throw new Error(json.message || '获取数据失败')
        setMedia(json.data)
        setAssets(json.data.assets || [])
        setPoints(json.data.points || [])
      } catch (err: any) {
        setError(err.message || '加载失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-600">加载中...</span>
      </div>
    )
  }
  
  if (error || !media) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <span className="ml-3 text-gray-600">{error || '广告位不存在'}</span>
      </div>
    )
  }
  
  const discount = media.list_price > 0
    ? Math.round((1 - media.deal_price / media.list_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-80 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                <div className="text-8xl opacity-60">{'🏙️'}</div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{media.name}</h1>
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-lg">约{discount}折</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600"><MapPin className="w-5 h-5 mr-2 text-primary" />{media.city} · {media.address}</div>
                  <div className="flex items-center text-gray-600"><Tag className="w-5 h-5 mr-2 text-primary" />{media.category_level1} · {media.category_level2}</div>
                  <div className="flex items-center text-gray-600"><Ruler className="w-5 h-5 mr-2 text-primary" />{media.size || '标准尺寸'}</div>
                  <div className="flex items-center text-gray-600"><Eye className="w-5 h-5 mr-2 text-primary" />日曝光 {media.daily_exposure?.toLocaleString()} 次</div>
                </div>
              </div>
            </div>

            {points.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">点位信息</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b"><th className="text-left py-3 px-4 text-gray-600 font-medium">点位名称</th><th className="text-right py-3 px-4 text-gray-600 font-medium">数量</th><th className="text-right py-3 px-4 text-gray-600 font-medium">单价</th></tr></thead>
                    <tbody>{points.map((p: any) => (<tr key={p.id} className="border-b last:border-0 hover:bg-gray-50"><td className="py-3 px-4">{p.point_name}</td><td className="text-right py-3 px-4">{p.quantity}</td><td className="text-right py-3 px-4 font-medium">¥{p.unit_price?.toLocaleString()}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">价格信息</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b"><span className="text-gray-600">刊例价</span><span className="text-gray-500 line-through text-lg">¥{media.list_price?.toLocaleString()}</span></div>
                <div className="flex justify-between items-center pb-4 border-b"><span className="text-gray-600">成交价</span><span className="text-2xl font-bold text-primary">¥{media.deal_price?.toLocaleString()}</span></div>
                <div className="flex justify-between items-center text-sm text-gray-500"><span>折扣</span><span className="text-green-600 font-medium">约{discount}折</span></div>
              </div>
              <button onClick={() => { setIsAddedToPlan(true); alert('已添加到投放方案！'); }} className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${isAddedToPlan ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-blue-700'}`}>{isAddedToPlan ? '✅ 已添加到方案' : '加入投放方案'}</button>
              <p className="text-xs text-gray-400 text-center mt-3">点击后可在"投放方案"页面查看</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}