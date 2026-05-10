// components/SuccessCases.tsx - 成功案例展示
'use client'

import { useState } from 'react'
import { CheckCircle, TrendingUp, Users, Target, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface CaseStudy {
  id: number
  title: string
  client: string
  industry: string
  challenge: string
  solution: string
  results: string[]
  metrics: {
    label: string
    value: string
    change: string
  }[]
  image: string
  featured: boolean
}

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    title: '西宁高端餐饮品牌全城曝光',
    client: '青海味道餐饮集团',
    industry: '餐饮美食',
    challenge: '新品牌知名度低，需要快速打开西宁市场',
    solution: '商圈LED大屏+社区电梯广告+本地美食公众号组合投放',
    results: [
      '品牌知名度提升300%',
      '门店客流量增加45%',
      '3个月内收回广告投资'
    ],
    metrics: [
      { label: '曝光量', value: '850万+', change: '+320%' },
      { label: '到店转化', value: '12.5%', change: '+45%' },
      { label: '投资回报', value: '1:3.8', change: '优秀' }
    ],
    image: '/cases/restaurant-case.jpg',
    featured: true
  },
  {
    id: 2,
    title: '海东房地产项目精准获客',
    client: '海东新城置业',
    industry: '房地产',
    challenge: '新楼盘开盘需要精准触达潜在购房者',
    solution: '户外大牌+公交车身+微信朋友圈精准广告',
    results: [
      '开盘首月售罄率85%',
      '获客成本降低40%',
      '品牌美誉度大幅提升'
    ],
    metrics: [
      { label: '到访量', value: '2,800+', change: '+180%' },
      { label: '成交率', value: '8.2%', change: '+65%' },
      { label: '成本节约', value: '40%', change: '显著' }
    ],
    image: '/cases/realestate-case.jpg',
    featured: true
  },
  {
    id: 3,
    title: '格尔木汽车4S店季度促销',
    client: '格尔木汽车城',
    industry: '汽车',
    challenge: '淡季销量下滑，需要刺激消费',
    solution: '交通广播+商圈活动+短视频平台本地推广',
    results: [
      '促销期间销量提升60%',
      '新增客户数据库扩大200%',
      '社交媒体互动增长350%'
    ],
    metrics: [
      { label: '销量增长', value: '60%', change: '+60%' },
      { label: '线索数量', value: '1,200+', change: '+200%' },
      { label: '互动率', value: '4.8%', change: '+350%' }
    ],
    image: '/cases/automotive-case.jpg',
    featured: false
  },
  {
    id: 4,
    title: '玉树旅游季全域营销',
    client: '玉树旅游局',
    industry: '旅游',
    challenge: '提升玉树旅游知名度，吸引省外游客',
    solution: '机场广告+旅游网站合作+短视频达人探店',
    results: [
      '旅游季游客增长55%',
      '网络搜索量提升280%',
      '合作旅行社增加30家'
    ],
    metrics: [
      { label: '游客增长', value: '55%', change: '+55%' },
      { label: '网络声量', value: '280%', change: '+280%' },
      { label: '合作伙伴', value: '30家', change: '+50%' }
    ],
    image: '/cases/tourism-case.jpg',
    featured: true
  },
  {
    id: 5,
    title: '德令哈教育机构品牌建设',
    client: '德令哈未来教育',
    industry: '教育培训',
    challenge: '新教育品牌需要建立家长信任',
    solution: '社区道闸广告+家长社群运营+教育展会参与',
    results: [
      '品牌认知度提升400%',
      '学员报名数增加75%',
      '家长满意度达95%'
    ],
    metrics: [
      { label: '品牌认知', value: '400%', change: '+400%' },
      { label: '学员增长', value: '75%', change: '+75%' },
      { label: '满意度', value: '95%', change: '优秀' }
    ],
    image: '/cases/education-case.jpg',
    featured: false
  },
  {
    id: 6,
    title: '黄南特色农产品电商推广',
    client: '黄南农牧电商',
    industry: '农业电商',
    challenge: '特色农产品销路有限，需要打开线上市场',
    solution: '本地电视台+直播带货+社区团购推广',
    results: [
      '线上销售额增长220%',
      '产品复购率提升至35%',
      '品牌成为区域标杆'
    ],
    metrics: [
      { label: '销售额', value: '220%', change: '+220%' },
      { label: '复购率', value: '35%', change: '+180%' },
      { label: '市场份额', value: '28%', change: '领先' }
    ],
    image: '/cases/agriculture-case.jpg',
    featured: false
  }
]

export default function SuccessCases() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(caseStudies[0])

  const filters = [
    { id: 'all', label: '全部案例' },
    { id: 'featured', label: '精选案例' },
    { id: 'restaurant', label: '餐饮美食' },
    { id: 'realestate', label: '房地产' },
    { id: 'automotive', label: '汽车' },
    { id: 'tourism', label: '旅游' },
    { id: 'education', label: '教育培训' }
  ]

  const filteredCases = caseStudies.filter(caseStudy => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'featured') return caseStudy.featured
    if (activeFilter === 'restaurant') return caseStudy.industry === '餐饮美食'
    if (activeFilter === 'realestate') return caseStudy.industry === '房地产'
    if (activeFilter === 'automotive') return caseStudy.industry === '汽车'
    if (activeFilter === 'tourism') return caseStudy.industry === '旅游'
    if (activeFilter === 'education') return caseStudy.industry === '教育培训'
    return true
  })

  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            成功案例展示
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            真实客户的成功故事，见证广告投放的实际效果
          </p>
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-medium transition-all",
                activeFilter === filter.id
                  ? "bg-primary text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-primary hover:text-primary"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 左侧：案例列表 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCases.map(caseStudy => (
                <Card 
                  key={caseStudy.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-xl border-2",
                    selectedCase?.id === caseStudy.id 
                      ? "border-primary shadow-lg" 
                      : "border-gray-200"
                  )}
                  onClick={() => setSelectedCase(caseStudy)}
                >
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-110"
                      style={{ backgroundImage: `url(${caseStudy.image})` }}
                    />
                    {caseStudy.featured && (
                      <div className="absolute top-3 left-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">
                        精选案例
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg line-clamp-1">
                          {caseStudy.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {caseStudy.client} · {caseStudy.industry}
                        </CardDescription>
                      </div>
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {caseStudy.challenge}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>核心成果：</span>
                      <span className="ml-2 font-medium text-primary">
                        {caseStudy.results[0]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 右侧：案例详情 */}
          <div className="lg:col-span-1">
            {selectedCase ? (
              <Card className="sticky top-24 border-2 border-primary shadow-xl">
                <div className="relative h-56 overflow-hidden rounded-t-lg">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedCase.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{selectedCase.title}</h3>
                    <p className="text-sm opacity-90">{selectedCase.client} · {selectedCase.industry}</p>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">案例详情</CardTitle>
                    {selectedCase.featured && (
                      <span className="px-3 py-1 bg-secondary text-white text-sm rounded-full">
                        精选案例
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      面临的挑战
                    </h4>
                    <p className="text-gray-600">{selectedCase.challenge}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">解决方案</h4>
                    <p className="text-gray-600">{selectedCase.solution}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      取得成果
                    </h4>
                    <ul className="space-y-2">
                      {selectedCase.results.map((result, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
                          <span className="text-gray-700">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      关键数据
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedCase.metrics.map((metric, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                          <div className="text-xs text-gray-600 mt-1">{metric.label}</div>
                          <div className="text-xs font-medium text-green-600 mt-1">
                            {metric.change}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" size="lg">
                    <Users className="w-5 h-5 mr-2" />
                    获取类似方案
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>选择案例查看详情</CardTitle>
                  <CardDescription>
                    点击左侧案例卡片查看详细信息和数据
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600">
                    选择一个成功案例，查看客户的具体挑战、解决方案和取得的成果
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex flex-col items-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              您的品牌也可以成为下一个成功案例
            </h3>
            <p className="text-gray-600 mb-6">
              无论您属于哪个行业，我们都能为您量身定制高效的广告投放方案
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="px-8">
                立即咨询
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                查看所有案例
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}