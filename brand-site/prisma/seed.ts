import { PrismaClient } from '@prisma/client'
import {
  seedArticles,
  seedCases,
  seedPartners,
  seedPricingPlans,
  seedScreens,
} from '../lib/content'

const prisma = new PrismaClient()

async function main() {
  for (const screen of seedScreens) {
    await prisma.screen.upsert({
      where: { slug: screen.slug },
      update: screen,
      create: screen,
    })
  }

  for (const [code, screenSlug, name, duration, frequency, period, description] of seedPricingPlans) {
    await prisma.pricingPlan.upsert({
      where: { code },
      update: {
        screenSlug,
        name,
        duration,
        frequency,
        period,
        description,
        priceLabel: '询价',
        status: 'published',
      },
      create: {
        code,
        screenSlug,
        name,
        duration,
        frequency,
        period,
        description,
        priceLabel: '询价',
        status: 'published',
        sortOrder: seedPricingPlans.findIndex((plan) => plan[0] === code) + 1,
      },
    })
  }

  for (const item of seedCases) {
    await prisma.caseStudy.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    })
  }

  for (const article of seedArticles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        ...article,
        status: 'published',
        publishedAt: new Date(),
      },
      create: {
        ...article,
        status: 'published',
        publishedAt: new Date(),
      },
    })
  }

  for (const [name, category] of seedPartners) {
    const existing = await prisma.partner.findFirst({ where: { name, category } })
    if (!existing) {
      await prisma.partner.create({
        data: {
          name,
          category,
          status: 'published',
          sortOrder: seedPartners.findIndex((item) => item[0] === name) + 1,
        },
      })
    }
  }

  const seoPages = [
    {
      path: '/',
      title: '西宁户外LED大屏广告｜国贸大厦屏与恒润大厦屏｜名扬天下传媒',
      description:
        '西宁名扬天下文化传媒有限公司运营国贸大厦LED屏与恒润大厦LED屏，提供点位咨询、档期确认、画面制作与上屏执行服务。',
      keywords: '西宁户外广告,西宁LED大屏,国贸大厦LED屏,恒润大厦LED屏,西宁广告公司',
    },
    {
      path: '/screens/guomao',
      title: '国贸大厦LED屏｜西宁城市级户外LED大屏｜名扬天下传媒',
      description:
        '国贸大厦LED屏位于西宁海晏路口，260㎡城市级大画面，适合品牌发布、城市事件与高识别度内容投放。',
      keywords: '国贸大厦LED屏,国贸大厦广告,西宁LED大屏,西宁户外广告',
    },
    {
      path: '/screens/hengrun',
      title: '恒润大厦LED屏｜湟光十字核心路口大屏｜名扬天下传媒',
      description:
        '恒润大厦LED屏位于湟光十字东北角，72㎡路口画面，适合区域活动、门店信息与本地品牌传播。',
      keywords: '恒润大厦LED屏,湟光十字广告,西宁路口LED屏,西宁户外广告',
    },
  ]

  for (const page of seoPages) {
    await prisma.pageSeo.upsert({
      where: { path: page.path },
      update: page,
      create: page,
    })
  }

  const settings = [
    ['company_name', '西宁名扬天下文化传媒有限公司'],
    ['service_phone', '13997187771'],
    ['company_address', '青海省西宁市海晏路2号国贸大厦'],
    ['quote_notice', '正式价格与当前档期请电话咨询，我们会在确认屏幕、时间与播放需求后提供对应报价。'],
  ]

  for (const [key, value] of settings) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
