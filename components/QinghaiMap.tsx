// components/QinghaiMap.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CityMarker from './CityMarker'
import { cn } from '@/lib/utils'

const cities = [
  { id: 'xining', name: '西宁', x: 50, y: 40, resources: 128, color: '#3b82f6' },
  { id: 'haidong', name: '海东', x: 60, y: 50, resources: 89, color: '#10b981' },
  { id: 'geermu', name: '格尔木', x: 20, y: 70, resources: 56, color: '#f59e0b' },
  { id: 'delingha', name: '德令哈', x: 30, y: 60, resources: 42, color: '#8b5cf6' },
  { id: 'yushu', name: '玉树', x: 40, y: 80, resources: 31, color: '#ef4444' },
  { id: 'huangnan', name: '黄南', x: 55, y: 55, resources: 28, color: '#06b6d4' },
  { id: 'hainan', name: '海南', x: 45, y: 60, resources: 35, color: '#84cc16' },
  { id: 'haibei', name: '海北', x: 45, y: 35, resources: 41, color: '#f97316' }
]

export default function QinghaiMap() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  const selectedCityData = selectedCity ? cities.find(c => c.id === selectedCity) : null

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            地图资源可视化
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            点击地图上的城市，直接查看该地区的广告资源分布
          </p>
        </div>
        
        <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12 shadow-xl">
          {/* 地图容器 */}
          <div className="relative h-[500px] md:h-[600px]">
            {/* 青海地图轮廓（简化版） */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full opacity-20"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* 青海省简化轮廓 */}
              <path
                d="M30,20 L60,25 L75,40 L80,60 L70,80 L40,85 L20,70 L15,50 L25,30 Z"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
              />
            </svg>
            
            {/* 城市标记 */}
            <div className="absolute inset-0">
              {cities.map((city) => (
                <CityMarker
                  key={city.id}
                  city={city}
                  isHovered={hoveredCity === city.id}
                  isSelected={selectedCity === city.id}
                  onHover={setHoveredCity}
                  onClick={setSelectedCity}
                />
              ))}
            </div>
            
            {/* 交互提示 */}
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>点击城市查看资源</span>
              </div>
            </div>
          </div>
          
          {/* 城市信息面板 */}
          {selectedCityData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedCityData.name} 广告资源
                </h3>
                <button
                  onClick={() => setSelectedCity(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  关闭
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['LED大屏', '户外大牌', '公交广告', '社区广告'].map((type) => (
                  <div key={type} className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">{type}</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.floor(Math.random() * 20) + 5}
                    </div>
                    <div className="text-xs text-gray-500">个资源位</div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                查看 {selectedCityData.name} 所有资源
              </button>
            </motion.div>
          )}
        </div>
        
        {/* 城市资源统计 */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {cities.slice(0, 4).map((city) => (
            <div key={city.id} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-3">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: city.color }}
                />
                <h4 className="font-semibold text-gray-900">{city.name}</h4>
              </div>
              <div className="text-3xl font-bold text-gray-900">{city.resources}</div>
              <div className="text-sm text-gray-600">个广告资源</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}