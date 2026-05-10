'use client'

import { useState } from 'react'
import { Sparkles, Target, Calendar, DollarSign, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface SolutionConfig {
  budget: string
  targetAudience: string
  duration: string
  cities: string[]
  industry: string
  goals: string[]
}

const industries = [
  { value: 'restaurant', label: '餐饮美食' },
  { value: 'realestate', label: '房地产' },
  { value: 'automotive', label: '汽车' },
  { value: 'education', label: '教育培训' },
  { value: 'healthcare', label: '医疗健康' },
  { value: 'retail', label: '零售百货' },
  { value: 'tourism', label: '旅游酒店' },
  { value: 'finance', label: '金融保险' },
  { value: 'other', label: '其他行业' }
]

const targetAudiences = [
  { value: 'young', label: '年轻人 (18-30岁)' },
  { value: 'family', label: '家庭人群' },
  { value: 'business', label: '商务人士' },
  { value: 'elderly', label: '中老年人' },
  { value: 'all', label: '大众群体' }
]

const durations = [
  { value: '1', label: '1个月' },
  { value: '3', label: '3个月' },
  { value: '6', label: '半年' },
  { value: '12', label: '1年' }
]

const goals = [
  { value: 'brand', label: '品牌曝光' },
  { value: 'sales', label: '销售转化' },
  { value: 'awareness', label: '认知提升' },
  { value: 'launch', label: '新品上市' },
  { value: 'promotion', label: '促销活动' }
]

export default function AISolutionGenerator() {
  const [config, setConfig] = useState<SolutionConfig>({
    budget: '',
    targetAudience: '',
    duration: '',
    cities: [],
    industry: '',
    goals: []
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSolution, setGeneratedSolution] = useState<string | null>(null)

  const handleInputChange = (field: keyof SolutionConfig, value: string | string[]) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    if (!config.budget || !config.industry || !config.cities.length) {
      alert('请填写预算、行业和城市信息')
      return
    }

    setIsGenerating(true)
    setGeneratedSolution(null)
    
    try {
      const response = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: config.budget + '万',
          industry: industries.find(i => i.value === config.industry)?.label || config.industry,
          city: config.cities[0],
          targetAudience: targetAudiences.find(t => t.value === config.targetAudience)?.label || undefined,
          duration: durations.find(d => d.value === config.duration)?.label || undefined,
          goals: config.goals.map(g => goals.find(gl => gl.value === g)?.label || g),
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedSolution(data.data.solution)
      } else {
        // Fallback to local generation
        const solution = generateLocalSolution(config)
        setGeneratedSolution(solution)
      }
    } catch (error) {
      console.error('方案生成失败:', error)
      // Fallback to local generation
      const solution = generateLocalSolution(config)
      setGeneratedSolution(solution)
    } finally {
      setIsGenerating(false)
    }
  }
  
  const generateLocalSolution = (cfg: SolutionConfig): string => {
    const industry = industries.find(i => i.value === cfg.industry)?.label || cfg.industry
    const audience = targetAudiences.find(t => t.value === cfg.targetAudience)?.label || '大众群体'
    const duration = durations.find(d => d.value === cfg.duration)?.label || '3个月'
    const budget = parseInt(cfg.budget) || 5
    const cities = cfg.cities.join('、')
    
    return `# AI智能投放方案

## 📊 方案概览
- **预算**: ${budget}万元
- **行业**: ${industry}
- **目标人群**: ${audience}
- **投放周期**: ${duration}
- **覆盖城市**: ${cities || '西宁'}

## 🎯 推荐策略

### 1. 媒体组合建议
${budget > 50
  ? '**高端组合**: 商圈LED大屏 + 机场广告 + 高端社区电梯 + 数字精准投放'
  : budget > 20
  ? '**均衡组合**: 户外大牌 + 公交车身 + 社区道闸 + 社交媒体广告'
  : '**精准组合**: 社区电梯广告 + 本地公众号 + 商圈小屏广告'}

### 2. 投放节奏
- **第1个月**: 品牌曝光期（60%预算）
- **第2-${duration === '1个月' ? '1' : '3'}个月**: 转化提升期（30%预算）
- **最后阶段**: 效果巩固期（10%预算）

### 3. 预期效果
- 日均曝光: ${budget > 50 ? '50万+' : '10万+'}人次
- 目标人群覆盖: ${cfg.targetAudience === 'young' ? '80%' : '70%'}以上
- ROI预估: 1:${cfg.industry === 'restaurant' ? '3.5' : '2.8'}

## 💡 优化建议
1. 结合节假日进行促销活动
2. 使用A/B测试优化广告创意
3. 定期监测投放效果并调整策略

## 🚀 下一步行动
1. 查看推荐的广告资源详情
2. 将选中的资源加入投放方案
3. 联系客服获取专属报价`
  }

  const handleReset = () => {
    setConfig({
      budget: '',
      targetAudience: '',
      duration: '',
      cities: [],
      industry: '',
      goals: []
    })
    setGeneratedSolution(null)
  }

  const toggleGoal = (goal: string) => {
    setConfig(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }))
  }

  const toggleCity = (city: string) => {
    setConfig(prev => ({
      ...prev,
      cities: prev.cities.includes(city)
        ? prev.cities.filter(c => c !== city)
        : [...prev.cities, city]
    }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI智能投放方案生成器
        </h2>
        <p className="text-xl text-gray-600">
          输入您的需求，AI将为您量身定制广告投放方案
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 配置面板 */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Target className="w-6 h-6 mr-2 text-primary" />
              投放需求配置
            </CardTitle>
            <CardDescription>
              填写以下信息，AI将为您生成专属方案
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                预算范围（万元）
              </label>
              <Input
                type="number"
                placeholder="例如: 10"
                value={config.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                目标人群
              </label>
              <Select
                value={config.targetAudience}
                onChange={(value) => handleInputChange('targetAudience', value)}
                options={targetAudiences}
                placeholder="选择目标人群"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                投放周期
              </label>
              <Select
                value={config.duration}
                onChange={(value) => handleInputChange('duration', value)}
                options={durations}
                placeholder="选择投放周期"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                行业类型
              </label>
              <Select
                value={config.industry}
                onChange={(value) => handleInputChange('industry', value)}
                options={industries}
                placeholder="选择行业"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                投放目标
              </label>
              <div className="flex flex-wrap gap-2">
                {goals.map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    className={cn(
                      "px-3 py-1 rounded-full border transition-colors text-sm",
                      config.goals.includes(goal.value)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                    )}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                投放城市
              </label>
              <div className="flex flex-wrap gap-2">
                {['西宁', '海东', '格尔木', '德令哈', '全省'].map(city => (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={cn(
                      "px-4 py-2 rounded-lg border transition-colors",
                      config.cities.includes(city)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleGenerate}
                loading={isGenerating}
                className="flex-1"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isGenerating ? 'AI生成中...' : '生成智能方案'}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 结果面板 */}
        <Card className="border-2 border-gray-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-primary" />
              AI生成方案
            </CardTitle>
            <CardDescription>
              {generatedSolution ? '您的专属投放方案已生成' : '填写左侧配置后生成方案'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedSolution ? (
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-line text-gray-700">
                  {generatedSolution}
                </div>
                <div className="mt-8 flex gap-4">
                  <Button variant="primary" className="flex-1">
                    查看推荐资源
                  </Button>
                  <Button variant="outline" className="flex-1">
                    导出方案PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-primary/50" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  等待配置方案
                </h3>
                <p className="text-gray-600 mb-8">
                  填写左侧的投放需求，AI将为您生成专业的广告投放方案
                </p>
                <div className="space-y-3 text-sm text-gray-500 text-left max-w-md mx-auto">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>基于大数据分析推荐最佳媒体组合</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>考虑行业特性和目标人群偏好</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>优化投放节奏和预算分配</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-6">
          也可以直接 <a href="/ai-chat" className="text-primary font-semibold hover:underline">与AI顾问对话</a> 获取更个性化的建议
        </p>
      </div>
    </div>
  )
}
