// components/MediaGrid.tsx
'use client'

import MediaCard from './MediaCard'

const sampleMedia = [
  {
    id: 1,
    name: '西宁火车站LED大屏',
    city: '西宁',
    category: 'LED大屏',
    exposure: '日均10万+曝光',
    listPrice: 35000,
    dealPrice: 28000,
    image: '/media/led-screen.jpg',
    isFeatured: true,
    rating: 4.8,
    views: 238
  },
  {
    id: 2,
    name: '海东商业中心高炮广告',
    city: '海东',
    category: '户外大牌',
    exposure: '商圈核心位置',
    listPrice: 22000,
    dealPrice: 18000,
    image: '/media/billboard.jpg',
    rating: 4.6,
    views: 156
  },
  {
    id: 3,
    name: '格尔木高速入口墙体广告',
    city: '格尔木',
    category: '墙体广告',
    exposure: '车流密集',
    listPrice: 18000,
    dealPrice: 15000,
    image: '/media/wall-ad.jpg',
    isFeatured: true,
    rating: 4.7,
    views: 189
  },
  {
    id: 4,
    name: '西宁高端小区电梯广告',
    city: '西宁',
    category: '电梯广告',
    exposure: '高端人群覆盖',
    listPrice: 8000,
    dealPrice: 6500,
    image: '/media/elevator-ad.jpg',
    rating: 4.5,
    views: 124
  },
  {
    id: 5,
    name: '海东社区道闸广告',
    city: '海东',
    category: '道闸广告',
    exposure: '精准社区营销',
    listPrice: 3000,
    dealPrice: 2333,
    image: '/media/gate-ad.jpg',
    rating: 4.4,
    views: 98
  },
  {
    id: 6,
    name: '德令哈商业广场LED',
    city: '德令哈',
    category: 'LED大屏',
    exposure: '商圈地标',
    listPrice: 28000,
    dealPrice: 22500,
    image: '/media/led-screen-2.jpg',
    rating: 4.7,
    views: 167
  }
]

export default function MediaGrid() {
  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            推荐广告资源
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            精选全省优质广告位，大图瀑布流展示，直观感受媒体价值
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleMedia.map((media, index) => (
            <MediaCard
              key={media.id}
              media={media}
              index={index}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-lg">
            浏览所有广告资源 →
          </button>
        </div>
      </div>
    </div>
  )
}