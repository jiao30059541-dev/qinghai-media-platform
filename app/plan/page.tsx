// app/plan/page.tsx - 专业投放篮页面（购物车风格）
'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, Trash2, Plus, Minus, MessageSquare, FileText, Calculator, Target,
  Zap, CreditCard, Package, Shield, Truck, CheckCircle, ArrowRight, X,
  Star, Eye, MapPin, Tag, Users, Clock, TrendingUp, Award, Download,
  Heart, Share2, Filter, Search, ChevronRight, ChevronLeft, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// localStorage存储的投放篮项目接口
interface BasketLocalItem {
  id: number
  quantity: number
  duration: number
}

// API返回的媒体详情接口
interface MediaDetailItem {
  id: number
  name: string
  city: string
  category: string
  image: string
  listPrice: number
  dealPrice: number
  floorPrice: number
  dailyExposure: number
  exposureText: string
  locationScore: number
  features: string[]
  address: string
  size: string
  maxQuantity: number
}

// 合并后的投放篮项目
interface BasketMergedItem extends MediaDetailItem {
  quantity: number
  duration: number
}

const LOCALSTORAGE_KEY = 'advertising-basket'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

const industries = [
  { value: 'restaurant', label: '餐饮美食' },
  { value: 'realestate', label: '房地产' },
  { value: 'automotive', label: '汽车' },
  { value: 'education', label: '教育培训' },
  { value: 'healthcare', label: '医疗健康' },
  { value: 'retail', label: '零售百货' },
  { value: 'tourism', label: '旅游酒店' },
  { value: 'finance', label: '金融保险' }
]

const campaignDurations = [
  { value: '7', label: '7天' },
  { value: '15', label: '15天' },
  { value: '30', label: '30天' },
  { value: '60', label: '60天' },
  { value: '90', label: '90天' },
  { value: 'custom', label: '自定义' }
]

export default function BasketPage() {
  const router = useRouter()
  const [basketItems, setBasketItems] = useState<BasketMergedItem[]>([])
  const [loadingBasket, setLoadingBasket] = useState(true)
  const [industry, setIndustry] = useState('')
  const [campaignDuration, setCampaignDuration] = useState('30')
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  
  // 从localStorage加载投放篮数据+API获取真实媒体信息
  useEffect(() => {
    const loadBasket = async () => {
      setLoadingBasket(true)
      try {
        const saved = localStorage.getItem(LOCALSTORAGE_KEY)
        if (!saved) {
          setBasketItems([])
          setLoadingBasket(false)
          return
        }
        const localItems: BasketLocalItem[] = JSON.parse(saved)
        if (localItems.length === 0) {
          setBasketItems([])
          setLoadingBasket(false)
          return
        }
        const ids = localItems.map(item => item.id)
        const res = await fetch(API_BASE + '/api/basket/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids })
        })
        if (!res.ok) {
          setBasketItems([])
          setLoadingBasket(false)
          return
        }
        const json = await res.json()
        if (!json.success || !json.data) {
          setBasketItems([])
          setLoadingBasket(false)
          return
        }
        const merged: BasketMergedItem[] = json.data.map((media: MediaDetailItem) => {
          const local = localItems.find(l => l.id === media.id)
          return {
            ...media,
            quantity: local?.quantity || 1,
            duration: local?.duration || 30
          }
        })
        setBasketItems(merged)
        // 同步回localStorage
        const syncData: BasketLocalItem[] = merged.map(item => ({
          id: item.id, quantity: item.quantity, duration: item.duration
        }))
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(syncData))
      } catch (error) {
        console.error('加载投放篮失败:', error)
        setBasketItems([])
      } finally {
        setLoadingBasket(false)
      }
    }
    loadBasket()
  }, [])
  
  // 保存投放篮数据到localStorage
  const saveBasketToLocal = (items: BasketMergedItem[]) => {
    const localData: BasketLocalItem[] = items.map(item => ({
      id: item.id, quantity: item.quantity, duration: item.duration
    }))
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(localData))
  }
  
  // 计算总价
  const subtotal = basketItems.reduce((sum, item) => sum + (item.dealPrice * item.quantity), 0)
  const discountAmount = subtotal * (discount / 100)
  const total = subtotal - discountAmount
  
  // 计算总曝光量
  const totalExposure = basketItems.reduce((sum, item) => sum + (item.dailyExposure * item.quantity * item.duration), 0)
  
  // 计算平均位置评分
  const avgLocationScore = basketItems.length > 0 
    ? (basketItems.reduce((sum, item) => sum + item.locationScore, 0) / basketItems.length).toFixed(1)
    : '0.0'
  
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setBasketItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const maxQty = item.maxQuantity || 10
          return { ...item, quantity: Math.min(newQuantity, maxQty) }
        }
        return item
      })
      saveBasketToLocal(updated)
      return updated
    })
  }
  
  const removeItem = (id: number) => {
    setBasketItems(prev => {
      const updated = prev.filter(item => item.id !== id)
      saveBasketToLocal(updated)
      return updated
    })
  }
  
  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'QINGHAI10') {
      setDiscount(10)
      alert('优惠券已应用：立享9折优惠！')
    } else if (couponCode.toUpperCase() === 'FIRST20') {
      setDiscount(20)
      alert('优惠券已应用：首单立减20%！')
    } else {
      alert('优惠券无效，请检查代码')
    }
  }
  
  const generateAIPlan = async () => {
    if (basketItems.length === 0) {
      alert('请先添加广告位到投放篮')
      return
    }
    
    setIsGeneratingAI(true)
    setShowAIPanel(true)
    
    try {
      // 调用真实的AI方案API
      const res = await fetch(API_BASE + '/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: basketItems.map(item => ({
            id: item.id,
            name: item.name,
            city: item.city,
            category: item.category,
            dealPrice: item.dealPrice,
            dailyExposure: item.dailyExposure,
            quantity: item.quantity,
            duration: item.duration
          })),
          totalBudget: total,
          industry,
          campaignDuration
        })
      })
      
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data?.analysis) {
          setAiResult(json.data.analysis)
        } else {
          setAiResult(generateFallbackAIPlan())
        }
      } else {
        setAiResult(generateFallbackAIPlan())
      }
    } catch (error) {
      console.error('AI方案生成失败，使用本地方案:', error)
      setAiResult(generateFallbackAIPlan())
    } finally {
      setIsGeneratingAI(false)
    }
  }
  
  // 本地备选AI方案生成（当API不可用时）
  const generateFallbackAIPlan = () => {
    const itemDetails = basketItems.map(item => 
      `  - **${item.name}** (${item.city}): ¥${(item.dealPrice * item.quantity * item.duration).toLocaleString()}`
    ).join('\n')
    
    return `# AI智能投放方案分析

## 📊 方案概览
- **广告位数量**: ${basketItems.length} 个
- **总预算**: ¥${total.toLocaleString()}
- **投放周期**: ${campaignDuration} 天
- **行业类型**: ${industries.find(i => i.value === industry)?.label || '未指定'}

## 📋 媒体组合
${itemDetails}

## 🎯 投放策略建议
${basketItems.length >= 3 ? '**优秀组合**: 您的选择覆盖了多个场景，建议保持当前组合以最大化覆盖面。' : '**建议补充**: 建议再添加1-2个不同类型的广告位以扩大覆盖面。'}

### 投放节奏建议
- **预热期** (第1-7天): 集中投放建立品牌认知
- **爆发期** (第8-21天): 重点投放核心广告位提升转化
- **巩固期** (第22-30天): 选择性投放维持品牌曝光

### 预期效果
- **总曝光量**: ${(totalExposure / 10000).toFixed(1)} 万次
- **日均曝光**: ${(totalExposure / parseInt(campaignDuration) / 10000).toFixed(1)} 万次/天

## 💡 优化建议
1. 考虑在不同时段分配差异化投放频次
2. 针对不同广告位设计匹配的创意内容
3. 设置A/B测试持续优化广告效果

## 🚀 下一步行动
1. 确认投放细节并提交需求
2. 联系客服获取专属报价
3. 准备广告创意素材`
  }
  
  const submitRequirement = async () => {
    if (basketItems.length === 0) {
      alert('请先添加广告位到投放篮')
      return
    }
    
    try {
      const mediaItems = basketItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        duration: item.duration,
        price: item.dealPrice
      }))
      
      const payload = {
        mediaItems,
        totalAmount: total,
        industry: industry || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        city: basketItems[0]?.city || undefined,
        notes: notes || undefined
      }
      
      const res = await fetch(API_BASE + '/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || '提交失败')
      }
      
      const json = await res.json()
      
      if (json.success) {
        // 清空投放篮
        localStorage.removeItem(LOCALSTORAGE_KEY)
        setBasketItems([])
        
        alert(`投放需求提交成功！\n\n订单号: ${json.data?.orderNumber || '待确认'}\n• 广告位数量: ${basketItems.length} 个\n• 总金额: ¥${total.toLocaleString()}\n\n我们的专业顾问将在24小时内联系您确认细节。`)
      } else {
        alert('提交失败: ' + (json.message || '未知错误'))
      }
    } catch (error) {
      console.error('提交投放需求失败:', error)
      alert('提交失败，请稍后重试。错误: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }
  
  const clearBasket = () => {
    if (confirm('确定清空投放篮吗？所有已选广告位将被移除。')) {
      setBasketItems([])
      localStorage.removeItem(LOCALSTORAGE_KEY)
    }
  }
  
  const continueShopping = () => {
    router.push('/media')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>投放方案 — 青海全媒体广告平台</title>
        <meta name="description" content="管理您的广告投放方案，查看已选广告位、调整投放时间和预算，一键提交获取精准报价" />
      </Head>
      {/* 顶部导航 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center">
            <ShoppingCart className="w-10 h-10 mr-4" />
            投放篮
          </h1>
          <p className="text-xl opacity-90 max-w-3xl">
            管理您的广告投放组合，一键生成AI智能方案，轻松完成投放需求
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧内容区域 - 2/3宽度 */}
          <div className="lg:col-span-2">
            {/* 投放篮头部 */}
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    已选广告位 <span className="text-primary">({basketItems.length})</span>
                  </h2>
                  <p className="text-gray-600 mt-1">
                    像购物车一样管理您的广告投放组合
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    onClick={clearBasket}
                    variant="outline"
                    disabled={basketItems.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空投放篮
                  </Button>
                  <Button
                    onClick={continueShopping}
                    variant="primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    继续添加
                  </Button>
                </div>
              </div>
            </div>
            
            {/* 投放篮内容 */}
            {basketItems.length > 0 ? (
              <div className="space-y-6">
                {basketItems.map(item => (
                  <div key={item.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* 图片 */}
                        <div className="md:w-1/4">
                          <div className="relative h-48 md:h-40 rounded-2xl overflow-hidden">
                            <div 
                              className="absolute inset-0 bg-cover bg-center"
                              style={{ backgroundImage: `url(${item.image})` }}
                            />
                            <div className="absolute top-3 left-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {item.category}
                            </div>
                          </div>
                        </div>
                        
                        {/* 信息 */}
                        <div className="md:w-2/4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {item.name}
                              </h3>
                              <div className="flex items-center text-gray-600 text-sm mb-3">
                                <MapPin className="w-4 h-4 mr-1" />
                                {item.city}
                                <span className="mx-2">•</span>
                                <Eye className="w-4 h-4 mr-1" />
                                {item.dailyExposure >= 10000 ? `${(item.dailyExposure / 10000).toFixed(1)}万` : item.dailyExposure.toLocaleString()}/日
                                <span className="mx-2">•</span>
                                <Star className="w-4 h-4 mr-1 text-amber-500 fill-current" />
                                {item.locationScore}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {/* 特色标签 */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.features.slice(0, 3).map((feature, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                                {feature}
                              </span>
                            ))}
                          </div>
                          
                          {/* 投放周期 */}
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>投放周期: {item.duration} 天</span>
                          </div>
                        </div>
                        
                        {/* 价格和数量控制 */}
                        <div className="md:w-1/4">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                              ¥{(item.dealPrice * item.quantity).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 line-through mb-4">
                              原价: ¥{(item.listPrice * item.quantity).toLocaleString()}
                            </div>
                            
                            {/* 数量控制 */}
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-lg font-bold min-w-[40px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                disabled={item.quantity >= item.maxQuantity}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 mt-2 text-right">
                              最多可订 {item.maxQuantity} 个
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 底部操作栏 */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          单价: ¥{item.dealPrice.toLocaleString()} × {item.quantity} 个 × {item.duration} 天
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="text-sm text-primary hover:text-blue-700 font-medium">
                            <Heart className="w-4 h-4 inline mr-1" />
                            收藏
                          </button>
                          <button className="text-sm text-primary hover:text-blue-700 font-medium">
                            <Share2 className="w-4 h-4 inline mr-1" />
                            分享
                          </button>
                          <Link 
                            href={`/media/${item.id}`}
                            className="text-sm text-primary hover:text-blue-700 font-medium"
                          >
                            查看详情
                            <ChevronRight className="w-4 h-4 inline ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // 空投放篮状态
              <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-200">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  投放篮是空的
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  您还没有添加任何广告位到投放篮，快去挑选心仪的广告位吧！
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={continueShopping}
                    variant="primary"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    浏览广告资源
                  </Button>
                  <Button
                    onClick={() => router.push('/ai-chat')}
                    variant="outline"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    咨询AI助手
                  </Button>
                </div>
              </div>
            )}
            
            {/* 数据统计 */}
            {basketItems.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{basketItems.length}</div>
                  <div className="text-sm text-gray-500">广告位数量</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{(totalExposure / 10000).toFixed(1)}万</div>
                  <div className="text-sm text-gray-500">总曝光量</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{avgLocationScore}</div>
                  <div className="text-sm text-gray-500">平均位置分</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{basketItems.length * 2}</div>
                  <div className="text-sm text-gray-500">覆盖城市</div>
                </div>
              </div>
            )}
            
            {/* AI方案生成面板 */}
            {showAIPanel && (
              <div className="mt-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-primary" />
                    AI智能投放方案
                  </h2>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {isGeneratingAI ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      AI正在生成投放方案...
                    </h3>
                    <p className="text-gray-600">
                      正在分析您的广告组合，优化投放策略
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-line text-gray-700">
                      {aiResult}
                    </div>
                    <div className="mt-8 flex gap-4">
                      <Button variant="primary" className="flex-1">
                        <Download className="w-5 h-5 mr-2" />
                        导出方案PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <FileText className="w-5 h-5 mr-2" />
                        保存到我的方案
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 右侧结算面板 - 1/3宽度 */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* 订单摘要 */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">订单摘要</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">小计</span>
                    <span className="font-medium">¥{subtotal.toLocaleString()}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">优惠折扣</span>
                      <span className="font-medium text-green-600">-¥{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">服务费</span>
                    <span className="font-medium">¥0</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>总计</span>
                      <span className="text-primary">¥{total.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      含税，最终价格以客服确认为准
                    </div>
                  </div>
                </div>
                
                {/* 优惠券 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入优惠券代码"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={applyCoupon}
                      variant="outline"
                    >
                      应用
                    </Button>
                  </div>
                  {discount > 0 && (
                    <div className="mt-3 text-sm text-green-600">
                      ✅ 已应用 {discount}% 折扣
                    </div>
                  )}
                </div>
                
                {/* 主要操作按钮 */}
                <div className="mt-8 space-y-3">
                  <Button
                    onClick={submitRequirement}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={basketItems.length === 0}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    提交投放需求
                  </Button>
                  
                  <Button
                    onClick={generateAIPlan}
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={basketItems.length === 0}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    {isGeneratingAI ? '生成中...' : 'AI智能方案'}
                  </Button>
                </div>
              </div>
              
              {/* 投放配置 */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">投放配置</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      行业类型
                    </label>
                    <Select
                      placeholder="选择行业"
                      options={industries}
                      value={industry}
                      onChange={setIndustry}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      投放周期
                    </label>
                    <Select
                      placeholder="选择周期"
                      options={campaignDurations}
                      value={campaignDuration}
                      onChange={setCampaignDuration}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      预算范围（可选）
                    </label>
                    <Input
                      type="number"
                      placeholder="例如：50000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      备注要求（可选）
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      placeholder="请描述您的具体投放需求..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* 服务保障 */}
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 rounded-3xl shadow-xl p-6 border border-primary/20">
                <h3 className="font-bold text-primary mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  服务保障
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">官方认证资源，数据真实可查</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">专业投放指导，优化投放效果</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">7×24小时客服支持</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm text-gray-700">不满意可调整，灵活变更</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <p className="text-sm text-gray-600">
                    提交需求后，专业顾问将在24小时内联系您确认细节并提供专属报价。
                  </p>
                </div>
              </div>
              
              {/* 快捷操作 */}
              <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">快捷操作</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <FileText className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">方案模板</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Calculator className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">ROI计算</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <MessageSquare className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">在线咨询</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Download className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">导出清单</span>
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