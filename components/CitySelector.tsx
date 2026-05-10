'use client'

import { useState } from 'react'
import Link from 'next/link'

const cities = [
  { id: 1, name: '西宁', districts: ['城西区', '城东区', '城中区', '城北区'] },
  { id: 2, name: '海东', districts: ['乐都区', '平安区', '互助县', '民和县'] },
  { id: 3, name: '格尔木', districts: ['格尔木市区'] },
  { id: 4, name: '德令哈', districts: ['德令哈市区'] },
  { id: 5, name: '玉树', districts: ['玉树市'] },
  { id: 6, name: '海南州', districts: ['共和县', '贵德县'] },
  { id: 7, name: '海北州', districts: ['门源县', '祁连县'] },
  { id: 8, name: '黄南州', districts: ['同仁县', '尖扎县'] },
]

export default function CitySelector() {
  const [selectedCity, setSelectedCity] = useState('西宁')
  const [selectedDistrict, setSelectedDistrict] = useState('')

  const currentCity = cities.find(city => city.name === selectedCity)

  return (
    <div className="space-y-6">
      {/* 城市选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          选择城市
        </label>
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setSelectedCity(city.name)
                setSelectedDistrict('')
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCity === city.name
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* 区县选择 */}
      {currentCity && currentCity.districts.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            选择区县
          </label>
          <div className="flex flex-wrap gap-2">
            {currentCity.districts.map((district, index) => (
              <button
                key={index}
                onClick={() => setSelectedDistrict(district)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedDistrict === district
                    ? 'bg-secondary text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 查看资源按钮 */}
      <div className="pt-4">
        <Link
          href={`/media?city=${selectedCity}${selectedDistrict ? '&district=' + selectedDistrict : ''}`}
          className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
        >
          📍 查看 {selectedCity}
          {selectedDistrict ? `·${selectedDistrict}` : ''} 广告资源
        </Link>
      </div>

      {/* 热门推荐 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">热门城市推荐:</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/media?city=西宁"
            className="text-sm text-primary hover:text-blue-700 hover:underline"
          >
            西宁市区
          </Link>
          <Link
            href="/media?city=海东"
            className="text-sm text-primary hover:text-blue-700 hover:underline"
          >
            海东市区
          </Link>
          <Link
            href="/media?city=格尔木"
            className="text-sm text-primary hover:text-blue-700 hover:underline"
          >
            格尔木
          </Link>
          <Link
            href="/media?category=户外广告"
            className="text-sm text-primary hover:text-blue-700 hover:underline"
          >
            户外广告
          </Link>
        </div>
      </div>
    </div>
  )
}
