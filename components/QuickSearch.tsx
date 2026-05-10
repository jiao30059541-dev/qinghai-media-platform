// components/QuickSearch.tsx
'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'

export default function QuickSearch() {
  const cities = [
    { value: 'xining', label: '西宁' },
    { value: 'haidong', label: '海东' },
    { value: 'geermu', label: '格尔木' },
    { value: 'delingha', label: '德令哈' },
    { value: 'yushu', label: '玉树' },
    { value: 'all', label: '全省' }
  ]

  const mediaTypes = [
    { value: 'led', label: 'LED大屏' },
    { value: 'billboard', label: '户外大牌' },
    { value: 'bus', label: '公交广告' },
    { value: 'elevator', label: '电梯广告' },
    { value: 'wall', label: '墙体广告' },
    { value: 'gate', label: '道闸广告' },
    { value: 'airport', label: '机场广告' },
    { value: 'all', label: '全部类型' }
  ]

  const budgets = [
    { value: '0-5', label: '5万以下' },
    { value: '5-10', label: '5-10万' },
    { value: '10-20', label: '10-20万' },
    { value: '20-50', label: '20-50万' },
    { value: '50+', label: '50万以上' }
  ]

  const handleSearch = () => {
    // 这里会实现搜索逻辑
    console.log('执行搜索')
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 max-w-5xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          像找房子一样找广告位
        </h3>
        <p className="text-gray-600">
          快速筛选全省优质广告资源
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex-1 w-full">
          <Select
            placeholder="选择城市"
            options={cities}
            className="bg-white"
          />
        </div>
        
        <div className="flex-1 w-full">
          <Select
            placeholder="媒体类型"
            options={mediaTypes}
            className="bg-white"
          />
        </div>
        
        <div className="flex-1 w-full">
          <Select
            placeholder="预算范围"
            options={budgets}
            className="bg-white"
          />
        </div>
        
        <Button 
          size="lg" 
          className="w-full md:w-auto px-8"
          onClick={handleSearch}
        >
          <Search className="w-5 h-5 mr-2" />
          搜索广告资源
        </Button>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">热门搜索：</span>
          {['西宁LED', '公交车身', '商圈大牌', '社区道闸', '机场广告', '电梯媒体'].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-primary hover:text-white transition-colors"
              onClick={() => console.log('搜索:', tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span>💡 提示：可多条件组合筛选，支持模糊搜索</span>
            <button className="text-primary hover:text-primary/80">
              高级筛选 →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}