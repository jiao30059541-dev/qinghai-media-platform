// components/MediaCategoryCard.tsx
'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaCategoryCardProps {
  title: string
  description: string
  count: number
  image: string
  color: string
  index: number
}

export default function MediaCategoryCard({
  title,
  description,
  count,
  image,
  color,
  index
}: MediaCategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* 颜色装饰 */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ backgroundColor: color }}
      />
      
      {/* 内容 */}
      <div className="relative z-10 p-8 h-64 flex flex-col justify-end">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-white rounded-full mb-2"
                style={{ backgroundColor: color }}>
            {count}+ 资源
          </span>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/80 text-sm mb-4">{description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <button className="text-white text-sm font-medium hover:underline flex items-center">
            查看详情
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
          <div className="text-white/60 text-sm">
            点击探索 →
          </div>
        </div>
      </div>
    </motion.div>
  )
}