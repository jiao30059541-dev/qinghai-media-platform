// app/page.tsx - 完整首页（包含所有组件）
import { Metadata } from 'next'
import HeroVideo from '@/components/HeroVideo'
import QuickSearch from '@/components/QuickSearch'
import MediaCategoryGrid from '@/components/MediaCategoryGrid'
import QinghaiMap from '@/components/QinghaiMap'
import AISolutionGenerator from '@/components/AISolutionGenerator'
import SuccessCases from '@/components/SuccessCases'
import ResearchSection from '@/components/ResearchSection'
import MediaGridFixed2 from '@/components/MediaGridFixed2'
import RecommendationSection from '@/components/RecommendationSection'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: '青海全媒体广告智能投放平台',
  description: '西宁名扬天下文化传媒旗下AI驱动的广告投放平台。覆盖西宁LED大屏、户外大牌、电梯广告、公交广告等全域资源，AI智能方案生成，在线比价组合投放。',
  openGraph: {
    title: '青海全媒体广告智能投放平台 — 像找房子一样找广告位',
    description: '一站式查询、组合、策划全省广告资源，AI智能推荐青海户外广告位',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - 全屏视频背景 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroVideo />
        
        {/* 内容区域 */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            青海全媒体广告
            <span className="block text-4xl md:text-6xl mt-4">
              投放平台
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            一站式查询、组合、策划全省广告资源
            <br />
            像找房子一样找广告位
          </p>
          
          {/* CTA按钮 */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <a href="/media">
              <Button size="lg" variant="primary" className="px-12 py-6 text-lg">
                查广告资源
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="/ai-chat">
              <Button size="lg" variant="outline" className="px-12 py-6 text-lg border-white text-white hover:bg-white/10">
                AI智能出方案
              </Button>
            </a>
          </div>
          
          {/* 快速搜索条 */}
          <div className="mt-8">
            <QuickSearch />
          </div>
        </div>
        
        {/* 滚动提示 */}
        <div className="absolute bottom-8 left-0 right-0 text-center animate-bounce">
          <div className="inline-flex flex-col items-center text-white/80">
            <span className="text-sm mb-2">探索更多</span>
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
      
      {/* 六大媒体分类入口 */}
      <MediaCategoryGrid />
      
      {/* 青海地图可视化 */}
      <QinghaiMap />
      
      {/* AI方案生成器入口 */}
      <AISolutionGenerator />
      
      {/* 成功案例展示 */}
      <SuccessCases />
      
      {/* 投放研究 - AI运营内容 */}
      <ResearchSection />
      
      {/* 推荐广告资源 */}
      <MediaGridFixed2 />
      
      {/* 智能推荐系统 */}
      <div className="container mx-auto px-4">
        <RecommendationSection 
          title="智能推荐 · 发现更多优质广告位"
          type="all"
          limit={6}
          showTitle={true}
          className="mt-16"
        />
      </div>
    </div>
  )
}