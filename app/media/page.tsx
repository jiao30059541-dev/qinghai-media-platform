// app/media/page.tsx - 重构版本（左筛选右卡片专业布局）
'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  Filter, Search, MapPin, Tag, DollarSign, Eye, Star, 
  ChevronDown, ChevronUp, Sliders, Grid, List, X,
  Check, Calendar, Users, Target, Zap
} from 'lucide-react'
import Head from 'next/head'
import MediaCard from '@/components/MediaCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'


// API基础路径
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

interface MediaItem {
  id: number; name: string; city: string; category: string; exposure: string;
  listPrice: number; dealPrice: number; image: string;
  isFeatured?: boolean; rating?: number; views?: number;
  dailyExposure?: number; locationScore?: number;
  audience?: string[]; tags?: string[]
}







interface FilterState {
  city: string
  category: string
  priceRange: string
  exposureLevel: string
  minPrice: string
  maxPrice: string
  searchQuery: string
  sortBy: string
  viewMode: 'grid' | 'list'
  showAdvanced: boolean
}


const cities = [
  { value: 'all', label: '全部城市' },
  { value: 'xining', label: '西宁' },
  { value: 'haidong', label: '海东' },
  { value: 'geermu', label: '格尔木' },
  { value: 'delingha', label: '德令哈' },
  { value: 'yushu', label: '玉树' },
  { value: 'huangnan', label: '黄南' },
  { value: 'hainan', label: '海南' },
  { value: 'haibei', label: '海北' },
]

const categories = [
  { value: 'all', label: '全部类型' },
  { value: 'led', label: 'LED大屏' },
  { value: 'billboard', label: '户外大牌' },
  { value: 'wall', label: '墙体广告' },
  { value: 'elevator', label: '电梯广告' },
  { value: 'gate', label: '道闸广告' },
  { value: 'airport', label: '机场广告' },
  { value: 'bus', label: '公交广告' },
  { value: 'tv', label: '电视广告' },
  { value: 'digital', label: '数字广告' },
]

const priceRanges = [
  { value: 'all', label: '全部价格' },
  { value: '0-5000', label: '5千以下' },
  { value: '5000-10000', label: '5千-1万' },
  { value: '10000-20000', label: '1万-2万' },
  { value: '20000-50000', label: '2万-5万' },
  { value: '50000+', label: '5万以上' },
]

const exposureLevels = [
  { value: 'all', label: '全部曝光' },
  { value: 'high', label: '高曝光 (5万+)' },
  { value: 'medium', label: '中曝光 (1万-5万)' },
  { value: 'low', label: '低曝光 (1万以下)' },
]

const sortOptions = [
  { value: 'newest', label: '最新上架' },
  { value: 'price_low', label: '价格从低到高' },
  { value: 'price_high', label: '价格从高到低' },
  { value: 'exposure_high', label: '曝光量从高到低' },
  { value: 'rating_high', label: '评分从高到低' },
  { value: 'location_score', label: '位置评分从高到低' },
]
function MediaPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<FilterState>({
    city: searchParams.get('city') || 'all',
    category: searchParams.get('category') || 'all',
    priceRange: searchParams.get('priceRange') || 'all',
    exposureLevel: searchParams.get('exposureLevel') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    searchQuery: searchParams.get('q') || '',
    sortBy: searchParams.get('sort') || 'newest',
    viewMode: 'grid',
    showAdvanced: false
  })

  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // 应用筛选
  // 从API获取媒体列表
  useEffect(() => {
    fetchMedia()
  }, [filters])

  async function fetchMedia() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.city !== 'all') params.set('city', filters.city)
      if (filters.category !== 'all') params.set('category', filters.category)
      if (filters.priceRange !== 'all') {
        const [min, max] = filters.priceRange.split('-').map(Number)
        if (min) params.set('minPrice', String(min))
        if (max && !isNaN(max)) params.set('maxPrice', String(max))
      }
      if (filters.searchQuery) params.set('q', filters.searchQuery)
      if (filters.sortBy) params.set('sort', filters.sortBy)
      params.set('limit', '50')

      const res = await fetch(API_BASE + '/api/media?' + params.toString())
      const json = await res.json()
      if (json.success) {
        setFilteredMedia(json.data || [])
      }
    } catch (err) {
      console.error('获取媒体列表失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // 更新URL参数
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/media?${params.toString()}`)
  }

  const handleResetFilters = () => {
    setFilters({
      city: 'all',
      category: 'all',
      priceRange: 'all',
      exposureLevel: 'all',
      minPrice: '',
      maxPrice: '',
      searchQuery: '',
      sortBy: 'newest',
      viewMode: 'grid',
      showAdvanced: false
    })
    router.push('/media')
  }

  const FilterSection = ({ title, icon: Icon, children }: { 
    title: string, 
    icon: any, 
    children: React.ReactNode 
  }) => (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <Icon className="w-4 h-4 mr-2 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>广告资源库 — 青海全媒体广告平台</title>
        <meta name="description" content="浏览青海全域户外广告资源，包括西宁LED大屏、户外大牌、电梯广告、公交广告等。按城市、类型、价格筛选，像找房子一样找广告位。" />
      </Head>
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            广告资源库
          </h1>
          <p className="text-xl opacity-90 max-w-3xl">
            像找房子一样找广告位，专业筛选找到最适合的投放位置
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 移动端筛选按钮 */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full"
            size="lg"
          >
            <Filter className="w-5 h-5 mr-2" />
            筛选广告资源
            <span className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">
              {filteredMedia.length} 个结果
            </span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧筛选面板 - 桌面端 */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Sliders className="w-5 h-5 mr-2 text-primary" />
                  筛选条件
                </h2>
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-primary hover:text-blue-700 font-medium"
                >
                  重置
                </button>
              </div>

              {/* 搜索框 */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="搜索广告位名称、城市、标签..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              {/* 城市筛选 */}
              <FilterSection title="城市" icon={MapPin}>
                <div className="space-y-2">
                  {cities.map(city => (
                    <button
                      key={city.value}
                      onClick={() => handleFilterChange('city', city.value)}
                      className={cn(
                        "block w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors",
                        filters.city === city.value
                          ? "bg-primary text-white font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{city.label}</span>
                        {filters.city === city.value && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* 广告类型 */}
              <FilterSection title="广告类型" icon={Tag}>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => handleFilterChange('category', category.value)}
                      className={cn(
                        "block w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors",
                        filters.category === category.value
                          ? "bg-primary text-white font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.label}</span>
                        {filters.category === category.value && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* 价格范围 */}
              <FilterSection title="价格范围" icon={DollarSign}>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <button
                      key={range.value}
                      onClick={() => handleFilterChange('priceRange', range.value)}
                      className={cn(
                        "block w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors",
                        filters.priceRange === range.value
                          ? "bg-primary text-white font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{range.label}</span>
                        {filters.priceRange === range.value && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* 自定义价格范围 */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-3">自定义价格</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">最低价</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">最高价</label>
                      <Input
                        type="number"
                        placeholder="不限"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* 曝光量 */}
              <FilterSection title="曝光量级" icon={Eye}>
                <div className="space-y-2">
                  {exposureLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => handleFilterChange('exposureLevel', level.value)}
                      className={cn(
                        "block w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors",
                        filters.exposureLevel === level.value
                          ? "bg-primary text-white font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{level.label}</span>
                        {filters.exposureLevel === level.value && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* 高级筛选 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-primary"
                >
                  <span className="font-medium">高级筛选</span>
                  {filters.showAdvanced ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                {filters.showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        目标人群
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['商务人士', '家庭人群', '年轻人', '游客', '车主', '学生'].map(audience => (
                          <button
                            key={audience}
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-primary hover:text-white transition-colors"
                          >
                            {audience}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        位置评分
                      </label>
                      <div className="flex items-center space-x-2">
                        {[7, 8, 9].map(score => (
                          <button
                            key={score}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors"
                          >
                            {score}+
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="lg:w-3/4">
            {/* 顶部工具栏 */}
            <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    找到 <span className="text-primary">{filteredMedia.length}</span> 个广告位
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    根据您的筛选条件匹配的结果
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* 排序选择 */}
                  <div className="flex items-center">
                    <span className="text-gray-700 text-sm mr-3">排序：</span>
                    <Select
                      options={sortOptions}
                      value={filters.sortBy}
                      onChange={(value) => handleFilterChange('sortBy', value)}
                      className="w-40"
                    />
                  </div>
                  
                  {/* 视图切换 */}
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
                      className={cn(
                        "p-2.5 transition-colors",
                        filters.viewMode === 'grid' 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
                      className={cn(
                        "p-2.5 transition-colors border-l border-gray-300",
                        filters.viewMode === 'list' 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 活跃筛选标签 */}
              <div className="mt-6 flex flex-wrap gap-2">
                {filters.city !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    {cities.find(c => c.value === filters.city)?.label}
                    <button
                      onClick={() => handleFilterChange('city', 'all')}
                      className="ml-2 hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.category !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    {categories.find(c => c.value === filters.category)?.label}
                    <button
                      onClick={() => handleFilterChange('category', 'all')}
                      className="ml-2 hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.priceRange !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    {priceRanges.find(p => p.value === filters.priceRange)?.label}
                    <button
                      onClick={() => handleFilterChange('priceRange', 'all')}
                      className="ml-2 hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    价格: {filters.minPrice || '0'} - {filters.maxPrice || '不限'} 元
                    <button
                      onClick={() => {
                        handleFilterChange('minPrice', '')
                        handleFilterChange('maxPrice', '')
                      }}
                      className="ml-2 hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.searchQuery && (
                  <span className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
                    搜索: {filters.searchQuery}
                    <button
                      onClick={() => handleFilterChange('searchQuery', '')}
                      className="ml-2 hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>

            {/* 加载状态 */}
            {isLoading ? (
              <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  正在筛选广告资源...
                </h3>
                <p className="text-gray-600">
                  请稍等，我们正在为您匹配最合适的广告位
                </p>
              </div>
            ) : filteredMedia.length > 0 ? (
              // 广告位列表
              <div className={cn(
                "grid gap-6",
                filters.viewMode === 'grid' 
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              )}>
                {filteredMedia.map((media, index) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              // 无结果
              <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-200">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  未找到匹配的广告位
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  当前筛选条件下没有找到合适的广告资源，请尝试调整筛选条件或选择其他城市。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleResetFilters}
                    variant="primary"
                    size="lg"
                  >
                    重置筛选条件
                  </Button>
                  <Button
                    onClick={() => router.push('/ai-chat')}
                    variant="outline"
                    size="lg"
                  >
                    咨询AI助手
                  </Button>
                </div>
              </div>
            )}

            {/* 分页 - 简单版本 */}
            {filteredMedia.length > 0 && !isLoading && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="lg">
                    上一页
                  </Button>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(page => (
                      <Button
                        key={page}
                        variant={page === 1 ? "primary" : "outline"}
                        size="lg"
                        className="min-w-[44px]"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" size="lg">
                    下一页
                  </Button>
                </div>
              </div>
            )}

            {/* 底部提示 */}
            <div className="mt-12 bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-3xl p-8">
              <h4 className="font-bold text-primary mb-4 text-lg flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                使用建议
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">点击广告位卡片可查看详细信息和更多图片</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">在详情页点击"加入投放方案"可将广告位添加到投放篮</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">支持多选，创建完整的广告投放组合</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
                    <span className="text-gray-700">完成后可在投放方案页面生成AI投放策略</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端筛选面板 */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">筛选条件</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 移动端筛选内容 */}
              <div className="space-y-6">
                <FilterSection title="城市" icon={MapPin}>
                  <div className="space-y-2">
                    {cities.map(city => (
                      <button
                        key={city.value}
                        onClick={() => {
                          handleFilterChange('city', city.value)
                          setMobileFiltersOpen(false)
                        }}
                        className={cn(
                          "block w-full text-left px-3 py-2.5 rounded-xl text-sm",
                          filters.city === city.value
                            ? "bg-primary text-white font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {city.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>
                
                <FilterSection title="广告类型" icon={Tag}>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <button
                        key={category.value}
                        onClick={() => {
                          handleFilterChange('category', category.value)
                          setMobileFiltersOpen(false)
                        }}
                        className={cn(
                          "block w-full text-left px-3 py-2.5 rounded-xl text-sm",
                          filters.category === category.value
                            ? "bg-primary text-white font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>
                
                <FilterSection title="价格范围" icon={DollarSign}>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <button
                        key={range.value}
                        onClick={() => {
                          handleFilterChange('priceRange', range.value)
                          setMobileFiltersOpen(false)
                        }}
                        className={cn(
                          "block w-full text-left px-3 py-2.5 rounded-xl text-sm",
                          filters.priceRange === range.value
                            ? "bg-primary text-white font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="w-full mb-4"
                >
                  重置所有筛选
                </Button>
                <Button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full"
                >
                  查看 {filteredMedia.length} 个结果
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrapped in Suspense to fix: useSearchParams() should be wrapped in a suspense boundary
export default function MediaPage() {
  return <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}><MediaPageContent /></React.Suspense>
}
