// app/media/[id]/page.tsx - 专业详情页（大视频播放器+右侧悬浮信息栏）
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Head from 'next/head'
import { 
  MapPin, Clock, Eye, Ruler, Tag, Users, CheckCircle, Share2, Heart, 
  ChevronLeft, ChevronRight, Play, Pause, Maximize2, X,
  ShoppingCart, Star, DollarSign, Target, BarChart3, Calendar, Shield, Download,
  Phone, MessageSquare, Mail, Navigation, ExternalLink, ArrowRight, Plus,
  Zap, TrendingUp, Award, Globe, Building, Car, ShoppingBag, Coffee,
  ThumbsUp, AlertCircle, Info, Clock4, Users2, Target as TargetIcon
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// 模拟数据
const mockMediaDetail = {
  id: 1,
  name: '西宁火车站LED大屏',
  city: '西宁',
  address: '西宁市城东区建国路1号火车站广场',
  category_level1: '户外广告',
  category_level2: 'LED大屏',
  description: '位于西宁火车站广场核心位置，面向日均10万+客流的高端LED大屏广告位。屏幕分辨率高，视觉效果震撼，是品牌形象展示的绝佳选择。',
  
  list_price: 35000,
  deal_price: 28000,
  discount_percent: 20,
  
  rating: 4.8,
  review_count: 128,
  views: 238,
  
  daily_exposure: 100000,
  monthly_exposure: 3000000,
  foot_traffic: 85000,
  location_score: 9.2,
  
  size: '12m × 6m',
  orientation: '面向广场主入口',
  lighting: '24小时全天候',
  resolution: '4K超高清',
  
  target_audience: ['商务人士', '游客', '通勤族', '学生'],
  peak_hours: '07:00-09:00, 17:00-19:00',
  best_season: '全年适宜，夏季最佳',
  
  features: [
    '火车站核心位置',
    '4K超高清显示',
    '24小时全天候播放',
    '远程内容更新',
    '实时播放监控',
    '专业维护团队'
  ],
  
  assets: [
    { id: 1, url: '/media/led-screen-1.jpg', type: 'image', title: '正面全景' },
    { id: 2, url: '/media/led-screen-2.jpg', type: 'image', title: '夜间效果' },
    { id: 3, url: '/media/led-screen-3.jpg', type: 'image', title: '人流实拍' },
    { id: 4, url: '/media/led-screen-video.mp4', type: 'video', title: '视频展示', thumbnail: '/media/led-screen-thumb.jpg' }
  ],
  
  points: [
    { id: 1, title: '火车站入口', description: '主入口人流最密集区域', distance: '50m' },
    { id: 2, title: '公交车站', description: '8条公交线路停靠点', distance: '100m' },
    { id: 3, title: '出租车候车区', description: '出租车排队等候区域', distance: '150m' },
    { id: 4, title: '地铁站入口', description: '未来地铁规划站点', distance: '200m' }
  ],
  
  related_media: [
    { id: 2, name: '海东商业中心高炮广告', city: '海东', category_level2: '户外大牌', deal_price: 18000, image_url: '/media/billboard.jpg', is_featured: true },
    { id: 3, name: '格尔木高速入口墙体广告', city: '格尔木', category_level2: '墙体广告', deal_price: 15000, image_url: '/media/wall-ad.jpg' },
    { id: 7, name: '玉树机场户外广告牌', city: '玉树', category_level2: '机场广告', deal_price: 38000, image_url: '/media/airport-ad.jpg', is_featured: true }
  ],
  
  contact_info: {
    phone: '0971-1234567',
    email: 'media@qinghai-ad.com',
    wechat: 'qinghai-media',
    address: '青海省西宁市城西区广告大厦18楼'
  },
  
  status: 'available',
  last_updated: '2024-04-20'
}

// 媒体画廊组件
function MediaGallery({ assets, mediaName }: { assets: any[], mediaName: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const mediaItems = assets.length > 0 
    ? assets 
    : [{ id: 0, url: '/media/default.svg', type: 'image', title: mediaName }]
  
  const currentMedia = mediaItems[currentIndex]
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length)
  }
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }
  
  return (
    <>
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
        {/* 主展示区域 */}
        <div className="relative h-[500px] md:h-[600px]">
          {currentMedia.type === 'video' ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <video 
                className="w-full h-full object-cover"
                controls
                autoPlay={isPlaying}
                poster={currentMedia.thumbnail}
              >
                <source src={currentMedia.url} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{ 
                backgroundImage: `url(${currentMedia.url})`,
                backgroundSize: 'cover'
              }}
            />
          )}
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          {/* 控制按钮 */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={prevSlide}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <span className="text-white font-medium text-lg">
                {currentIndex + 1} / {mediaItems.length}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {currentMedia.type === 'video' && (
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>
              )}
              <button 
                onClick={toggleFullscreen}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Maximize2 className="w-6 h-6 text-white" />
              </button>
              <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <Share2 className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* 当前媒体标题 */}
          <div className="absolute top-6 left-6">
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-2">
              <span className="text-white font-medium">{currentMedia.title}</span>
            </div>
          </div>
        </div>
        
        {/* 缩略图导航 */}
        <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex overflow-x-auto gap-3 pb-2">
            {mediaItems.map((item, index) => (
              <button
                key={item.id || index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all",
                  currentIndex === index 
                    ? "border-primary shadow-lg scale-105" 
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-white/30"
                )}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.url})` }}
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <span className="text-white text-xs font-medium truncate">{item.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 全屏模式 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            {currentMedia.type === 'video' ? (
              <video 
                className="w-full h-full object-contain"
                controls
                autoPlay
              >
                <source src={currentMedia.url} type="video/mp4" />
              </video>
            ) : (
              <img 
                src={currentMedia.url} 
                alt={currentMedia.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <button
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </>
  )
}

// 关键指标卡片
function MetricCard({ icon: Icon, label, value, description, color = 'primary' }: any) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700'
  }
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      )}
    </div>
  )
}

// 标签组件
function TagBadge({ children, icon: Icon, variant = 'default' }: any) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700'
  }
  
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium",
      variants[variant]
    )}>
      {Icon && <Icon className="w-3 h-3 mr-1.5" />}
      {children}
    </span>
  )
}

export default function MediaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [media, setMedia] = useState(mockMediaDetail)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isFavorite, setIsFavorite] = useState(false)
  
  const mediaId = params.id as string
  
  useEffect(() => {
    // 直接使用数据渲染，无需延迟
    setMedia(mockMediaDetail)
  }, [mediaId])
  
  const handleAddToPlan = () => {
    // 添加到投放篮 - 保存到localStorage
    const LOCALSTORAGE_KEY = 'advertising-basket'
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY)
      let items: Array<{id: number, quantity: number, duration: number}> = saved ? JSON.parse(saved) : []
      const existingIndex = items.findIndex(item => item.id === media.id)
      if (existingIndex >= 0) {
        items[existingIndex].quantity += 1
      } else {
        items.push({ id: media.id, quantity: 1, duration: 3 })
      }
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(items))
      alert('已添加到投放方案！\n您可以在投放篮中查看和管理。')
    } catch (error) {
      console.error('添加到投放篮失败:', error)
      alert('添加到投放篮失败，请重试')
    }
  }
  
  const handleContact = () => {
    // 联系客服逻辑
    console.log('联系客服:', media.contact_info.phone)
  }
  
  const handleShare = () => {
    // 分享逻辑
    console.log('分享:', window.location.href)
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <h3 className="text-xl font-bold text-gray-900">加载广告位详情...</h3>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{media.name} — 青海全媒体广告平台</title>
        <meta name="description" content="{media.name} - {media.city}{media.category_level2}，{media.description?.slice(0, 80)}" />
      </Head>
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "首页", "item": "https://www.xnmytx.com/" },
              { "@type": "ListItem", "position": 2, "name": "广告资源库", "item": "https://www.xnmytx.com/media" },
              { "@type": "ListItem", "position": 3, "name": media.name, "item": `https://www.xnmytx.com/media/${media.id}` }
            ]
          })
        }}
      />
      {/* 返回按钮 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          返回广告资源库
        </button>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧内容区域 - 2/3宽度 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 标题和基本信息 */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <TagBadge variant="primary" icon={MapPin}>
                      {media.city}
                    </TagBadge>
                    <TagBadge variant="secondary">
                      {media.category_level2}
                    </TagBadge>
                    {media.status === 'available' && (
                      <TagBadge variant="success" icon={CheckCircle}>
                        可投放
                      </TagBadge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {media.name}
                  </h1>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    {media.description}
                  </p>
                  
                  <div className="flex items-center gap-6 text-gray-500">
                    <div className="flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      <span>{media.views} 浏览</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-amber-500 fill-current" />
                      <span>{media.rating} ({media.review_count} 评价)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock4 className="w-5 h-5 mr-2" />
                      <span>更新于 {media.last_updated}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                      isFavorite 
                        ? "bg-red-50 text-red-500" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Heart className={cn("w-6 h-6", isFavorite && "fill-current")} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* 媒体画廊 */}
            <MediaGallery assets={media.assets} mediaName={media.name} />
            
            {/* 关键指标 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard 
                icon={Eye}
                label="日曝光量"
                value={media.daily_exposure >= 10000 ? `${(media.daily_exposure / 10000).toFixed(1)}万` : media.daily_exposure.toLocaleString()}
                description="日均曝光次数"
                color="primary"
              />
              <MetricCard 
                icon={Users2}
                label="人流量"
                value={media.foot_traffic >= 10000 ? `${(media.foot_traffic / 10000).toFixed(1)}万` : media.foot_traffic.toLocaleString()}
                description="日均人流量"
                color="secondary"
              />
              <MetricCard 
                icon={TargetIcon}
                label="位置评分"
                value={media.location_score}
                description="位置优越性评分"
                color="green"
              />
              <MetricCard 
                icon={TrendingUp}
                label="投资回报"
                value="1:3.8"
                description="预估投资回报率"
                color="purple"
              />
            </div>
            
            {/* 标签导航 */}
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
              <div className="flex overflow-x-auto gap-2 pb-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors",
                    activeTab === 'overview'
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  概览
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors",
                    activeTab === 'specs'
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  规格参数
                </button>
                <button
                  onClick={() => setActiveTab('location')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors",
                    activeTab === 'location'
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  位置分析
                </button>
                <button
                  onClick={() => setActiveTab('audience')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors",
                    activeTab === 'audience'
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  受众分析
                </button>
                <button
                  onClick={() => setActiveTab('cases')}
                  className={cn(
                    "px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-colors",
                    activeTab === 'cases'
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  成功案例
                </button>
              </div>
              
              {/* 标签内容 */}
              <div className="mt-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">广告位特色</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {media.features.map((feature, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">技术参数</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">屏幕尺寸</div>
                          <div className="font-bold text-gray-900">{media.size}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">分辨率</div>
                          <div className="font-bold text-gray-900">{media.resolution}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">朝向</div>
                          <div className="font-bold text-gray-900">{media.orientation}</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">照明</div>
                          <div className="font-bold text-gray-900">{media.lighting}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'specs' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">基本参数</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">广告类型</span>
                            <span className="font-medium">{media.category_level1} · {media.category_level2}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">城市区域</span>
                            <span className="font-medium">{media.city} · {media.address}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">投放状态</span>
                            <span className="font-medium text-green-600">可立即投放</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3">曝光数据</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">日曝光量</span>
                            <span className="font-medium">{media.daily_exposure.toLocaleString()} 次</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">月曝光量</span>
                            <span className="font-medium">{media.monthly_exposure.toLocaleString()} 次</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">高峰时段</span>
                            <span className="font-medium">{media.peak_hours}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'location' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">周边设施</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {media.points.map(point => (
                          <div key={point.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-bold text-gray-900 mb-1">{point.title}</div>
                                <div className="text-sm text-gray-600">{point.description}</div>
                              </div>
                              <div className="text-sm text-gray-500">{point.distance}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">位置优势</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>火车站核心位置，人流密集</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>多交通方式换乘枢纽</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>周边商业配套完善</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span>城市地标性建筑</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'audience' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-4">目标人群</h4>
                      <div className="flex flex-wrap gap-3">
                        {media.target_audience.map((audience, index) => (
                          <TagBadge key={index} variant="primary" icon={Users}>
                            {audience}
                          </TagBadge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">人群特征</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">商务人士比例</span>
                            <span className="font-bold text-gray-900">35%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">游客比例</span>
                            <span className="font-bold text-gray-900">25%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">本地居民比例</span>
                            <span className="font-bold text-gray-900">40%</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">平均停留时间</span>
                            <span className="font-bold text-gray-900">15-30分钟</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">最佳投放季节</span>
                            <span className="font-bold text-gray-900">{media.best_season}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">消费能力</span>
                            <span className="font-bold text-gray-900">中高</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 相关推荐 */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">相关推荐</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {media.related_media.map(item => (
                  <div key={item.id} className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48 overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${item.image_url})` }}
                      />
                      {item.is_featured && (
                        <div className="absolute top-3 left-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          精选推荐
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.city} · {item.category_level2}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-primary">¥{item.deal_price.toLocaleString()}</div>
                        <Link 
                          href={`/media/${item.id}`}
                          className="text-sm text-primary hover:text-blue-700 font-medium flex items-center"
                        >
                          查看详情
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 右侧信息面板 - 1/3宽度 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* 价格面板 */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    ¥{media.deal_price.toLocaleString()}
                  </div>
                  <div className="text-lg text-gray-500 line-through">
                    刊例价: ¥{media.list_price.toLocaleString()}
                  </div>
                  {media.discount_percent > 0 && (
                    <div className="inline-block mt-2 px-4 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                      立省 {media.discount_percent}%
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={handleAddToPlan}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    加入投放方案
                  </Button>
                  <Link
                    href="/plan"
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 text-lg font-bold rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 transition-all duration-300"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    查看投放篮
                  </Link>
                  
                  <Button 
                    onClick={handleContact}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    立即咨询
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/ai-chat')}
                    variant="ghost"
                    size="lg"
                    className="w-full"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    AI方案建议
                  </Button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">服务保障</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">官方认证资源</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">数据真实可查</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">专业投放指导</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">灵活投放周期</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 联系信息 */}
              <div className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl shadow-2xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">获取专属报价</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" />
                    <div>
                      <div className="text-sm opacity-80">咨询电话</div>
                      <div className="font-bold text-lg">{media.contact_info.phone}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-3" />
                    <div>
                      <div className="text-sm opacity-80">电子邮箱</div>
                      <div className="font-bold">{media.contact_info.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-3" />
                    <div>
                      <div className="text-sm opacity-80">微信咨询</div>
                      <div className="font-bold">{media.contact_info.wechat}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-sm opacity-90">
                    专业顾问将在30分钟内联系您，提供定制化投放方案
                  </p>
                </div>
              </div>
              
              {/* 快速操作 */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">快速操作</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Download className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">下载资料</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Navigation className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">实地考察</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <ExternalLink className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">街景查看</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <ThumbsUp className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">收藏对比</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}