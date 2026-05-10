// components/MediaCategoryGrid.tsx
'use client'

import MediaCategoryCard from './MediaCategoryCard'

const categories = [
  {
    title: '户外大牌',
    description: '城市地标、高速入口、商圈核心',
    count: 128,
    image: '/categories/outdoor.jpg',
    color: '#3b82f6'
  },
  {
    title: 'LED屏',
    description: '商业中心、交通枢纽、城市广场',
    count: 89,
    image: '/categories/led.jpg',
    color: '#10b981'
  },
  {
    title: '交通媒体',
    description: '公交车身、出租车、机场车站',
    count: 156,
    image: '/categories/transport.jpg',
    color: '#f59e0b'
  },
  {
    title: '室内媒体',
    description: '电梯、商场、写字楼、酒店',
    count: 203,
    image: '/categories/indoor.jpg',
    color: '#8b5cf6'
  },
  {
    title: '广播电视',
    description: '电视台、广播电台、新媒体',
    count: 47,
    image: '/categories/broadcast.jpg',
    color: '#ef4444'
  },
  {
    title: '数字新媒体',
    description: '社交媒体、信息流、程序化购买',
    count: 92,
    image: '/categories/digital.jpg',
    color: '#06b6d4'
  }
]

export default function MediaCategoryGrid() {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            六大媒体分类入口
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            覆盖青海全域各类广告媒体资源，每个分类都像杂志封面一样精心设计
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <MediaCategoryCard
              key={category.title}
              {...category}
              index={index}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors">
            查看所有分类 →
          </button>
        </div>
      </div>
    </div>
  )
}