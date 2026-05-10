// app/about/page.tsx - 关于青海全媒体广告平台
'use client'

import Head from 'next/head'
import { motion } from 'framer-motion'
import { Shield, Target, BarChart3, Globe, Users, Zap, CheckCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const stats = [
  { label: '媒体资源', value: '5000+' },
  { label: '合作品牌', value: '800+' },
  { label: '覆盖城市', value: '30+' },
  { label: '年曝光量', value: '50亿+' },
]

const values = [
  {
    icon: Target,
    title: '精准投放',
    desc: '基于AI算法的智能匹配系统，确保每一分广告预算都花在刀刃上'
  },
  {
    icon: BarChart3,
    title: '数据驱动',
    desc: '实时数据监控与效果分析，让广告投放效果看得见、可衡量'
  },
  {
    icon: Shield,
    title: '品质保障',
    desc: '严格审核每一家供应商和媒体资源，确保广告投放品质'
  },
  {
    icon: Users,
    title: '专业服务',
    desc: '从策划到执行的全流程服务，资深广告团队一对一支持'
  },
]

const timeline = [
  { year: '2018', title: '公司成立', desc: '扎根青海，深耕西部广告市场' },
  { year: '2019', title: '平台上线', desc: '青海首个全媒体广告资源平台上线' },
  { year: '2021', title: 'AI赋能', desc: '引入AI智能推荐系统，投放效率提升300%' },
  { year: '2023', title: '辐射全国', desc: '媒体资源覆盖全国30+城市，服务品牌突破500家' },
  { year: '2024', title: '生态升级', desc: '发布全新智能投放平台，开启全域营销新纪元' },
]

const team = [
  { name: '张明远', role: '创始人 & CEO', desc: '15年广告行业经验，前省广集团高管' },
  { name: '李思源', role: 'CTO', desc: '前阿里巴巴技术专家，专注AI与大数据' },
  { name: '王雪梅', role: '运营总监', desc: '10年数字营销经验，服务过百家知名品牌' },
  { name: '赵一鸣', role: '市场总监', desc: '资深媒体人，深谙西北市场洞察' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>关于我们 — 青海全媒体广告平台</title>
        <meta name="description" content="西宁名扬天下文化传媒有限公司 — 西北领先的全媒体广告资源交易平台，以AI技术驱动广告投放智能化，覆盖青海全域户外广告资源" />
      </Head>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <motion.div className="text-center max-w-4xl mx-auto" {...fadeInUp}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              青海全媒体广告平台
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-12">
              西北领先的全媒体广告资源交易平台，以AI技术驱动广告投放智能化，
              让每一分预算都创造最大价值
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg">
                了解平台 <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-2xl text-lg">
                联系我们
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Stats */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <motion.div key={stat.label} className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-500 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 平台优势 */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">核心优势</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">从资源到技术，从数据到服务，全方位赋能广告投放</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, idx) => (
              <motion.div key={v.title} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <v.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 发展历程 */}
      <section className="bg-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">发展历程</h2>
            <p className="text-xl text-gray-500">从青海出发，服务全国</p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />
            {timeline.map((item, idx) => (
              <motion.div key={item.year} className={`relative flex items-start gap-8 mb-12 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`} initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <div className="hidden md:flex flex-1 justify-end">
                  {idx % 2 === 0 && (
                    <div className="text-right pr-8">
                      <div className="text-3xl font-bold text-blue-600">{item.year}</div>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow shrink-0 mt-1.5" />
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-all">
                    <div className="md:hidden text-xl font-bold text-blue-600 mb-2">{item.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-500">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 团队 */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">核心团队</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">汇聚广告、技术、运营领域顶尖人才</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((m, idx) => (
              <motion.div key={m.name} className="bg-white p-6 rounded-3xl shadow-sm text-center hover:shadow-xl transition-all" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {m.name[0]}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{m.name}</h3>
                <p className="text-blue-600 text-sm mb-3">{m.role}</p>
                <p className="text-gray-500 text-sm">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">准备好提升广告效果了吗？</h2>
          <p className="text-xl text-blue-100 mb-10">立即注册，获取专属广告投放方案</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" className="bg-white text-blue-700 hover:bg-gray-100 px-10 py-4 rounded-2xl text-lg font-semibold">
              免费注册
            </Button>
            <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 px-10 py-4 rounded-2xl text-lg">
              预约演示
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
