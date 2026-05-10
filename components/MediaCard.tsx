// components/MediaCard.tsx - 更新版本（支持更多字段）
'use client'

import { motion } from 'framer-motion'
import { MapPin, Eye, Star, Plus, Users, Target, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface MediaCardProps {
  media: {
    id: number
    name: string
    city: string
    category: string
    exposure: string
    listPrice: number
    dealPrice: number
    image: string
    isFeatured?: boolean
    rating?: number
    views?: number
    // 新增字段
    dailyExposure?: number
    locationScore?: number
    audience?: string[]
    tags?: string[]
  }
  index: number
}

export default function MediaCard({ media, index }: MediaCardProps) {
  const discount = Math.round((1 - media.dealPrice / media.listPrice) * 100)
  
  // 格式化曝光量
  const formatExposure = (exposure?: number) => {
    if (!exposure) return media.exposure
    if (exposure >= 10000) return `${(exposure / 10000).toFixed(1)}万+曝光`
    return `${exposure.toLocaleString()}+曝光`
  }
  
  // 格式化位置评分
  const formatLocationScore = (score?: number) => {
    if (!score) return null
    return `${score.toFixed(1)}`
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-white"
    >
      {/* 主视觉图占70% */}
      <div className="relative h-64 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${media.image})` }}
        />
        
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* 特色标签 */}
        {media.isFeatured && (
          <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
            精选推荐
          </div>
        )}
        
        {/* 折扣标签 */}
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
        
        {/* 位置评分 */}
        {media.locationScore && media.locationScore >= 8.5 && (
          <div className="absolute bottom-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
            <Target className="w-3 h-3 mr-1" />
            {formatLocationScore(media.locationScore)}
          </div>
        )}
        
        {/* 悬停操作 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="primary" className="transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <Plus className="w-4 h-4 mr-2" />
            加入方案
          </Button>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1">
              {media.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{media.city}</span>
              <span className="mx-2 flex-shrink-0">•</span>
              <span className="truncate">{media.category}</span>
            </div>
          </div>
          
          <div className="flex items-center text-amber-500 flex-shrink-0 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm">{media.rating || 4.8}</span>
          </div>
        </div>
        
        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
            {formatExposure(media.dailyExposure)}
          </span>
          
          {media.tags && media.tags.slice(0, 2).map((tag, i) => (
            <span 
              key={i}
              className={cn(
                "px-2 py-1 text-xs rounded-lg",
                i === 0 ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
              )}
            >
              {tag}
            </span>
          ))}
          
          {media.audience && media.audience.length > 0 && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-lg flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {media.audience[0]}
            </span>
          )}
        </div>
        
        {/* 数据指标 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              ¥{(media.dealPrice / 10000).toFixed(1)}万
            </div>
            <div className="text-xs text-gray-500">成交价</div>
          </div>
          
          <div className="text-center border-x border-gray-200">
            <div className="text-lg font-bold text-gray-900">
              {media.dailyExposure ? 
                media.dailyExposure >= 10000 ? 
                  `${(media.dailyExposure / 10000).toFixed(1)}万` : 
                  (media.dailyExposure / 1000).toFixed(1) + '千'
                : '--'
              }
            </div>
            <div className="text-xs text-gray-500">日曝光</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatLocationScore(media.locationScore) || '--'}
            </div>
            <div className="text-xs text-gray-500">位置分</div>
          </div>
        </div>
        
        {/* 价格信息 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ¥{media.dealPrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 line-through">
              刊例价: ¥{media.listPrice.toLocaleString()}
            </div>
          </div>
          
          <div className="flex items-center text-gray-500 text-sm">
            <Eye className="w-4 h-4 mr-1" />
            {media.views || 238} 浏览
          </div>
        </div>
      </div>
    </motion.div>
  )
}