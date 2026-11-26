import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type ScreenView = Prisma.ScreenGetPayload<{
  include: { pricingPlans: true }
}>

export type CaseView = Prisma.CaseStudyGetPayload<{
  include: { screen: true }
}>

export const seedScreens = [
  {
    slug: 'guomao',
    name: '国贸大厦 LED 屏',
    shortName: '国贸大厦屏',
    role: '城市级主屏',
    location: '西宁海晏路口国贸大厦',
    area: '260 ㎡',
    displaySize: '26.88 × 8.96 m',
    resolution: '5376 × 1792',
    pixelPitch: 'P5.0',
    brightness: '待现场复核',
    operatingHours: '以实际排期为准',
    dailyPlays: '按档位确认',
    description:
      '城市地标型大画面，适合品牌主视觉、城市事件与高识别度内容。以 3:1 横向比例承载品牌发布和城市传播。',
    highlights: '3:1 城市尺度画面\n适合品牌主视觉\n支持单屏投放与双屏联动',
    heroImage: '/images/guomao-night-hero.jpg',
    galleryImages:
      '/images/guomao-night-crossing.jpg\n/images/guomao-day.jpg\n/images/guomao-screen.jpg',
    sortOrder: 1,
    status: 'published',
  },
  {
    slug: 'hengrun',
    name: '恒润大厦 LED 屏',
    shortName: '恒润大厦屏',
    role: '核心路口屏',
    location: '湟光十字东北角恒润大厦',
    area: '72 ㎡',
    displaySize: '12 × 6 m',
    resolution: '1920 × 960',
    pixelPitch: 'P6',
    brightness: '待现场复核',
    operatingHours: '以实际排期为准',
    dailyPlays: '按档位确认',
    description:
      '核心路口补充触达点位，适合区域活动、门店信息、日常品牌提醒和更直接的路口识别。可单屏投放，也可与国贸屏项目联动。',
    highlights: '2:1 路口画面\n适合区域与门店传播\n可单屏投放',
    heroImage: '/images/hengrun-night.jpg',
    galleryImages: '/images/hengrun-night.jpg\n/images/hengrun-screen.jpg',
    sortOrder: 2,
    status: 'published',
  },
] as const

export const seedPricingPlans = [
  ['G01', 'guomao', '城市亮相', '15 秒', '轻频', '按月', '适合品牌首次进入城市视野'],
  ['G02', 'guomao', '城市封面', '15 秒', '中频', '按月', '主推标准曝光档位'],
  ['G03', 'guomao', '城市高频', '15 秒', '高频', '按月', '适合高强度记忆占位'],
  ['G04', 'guomao', '长版叙事', '30 秒', '中频', '按月', '适合完整品牌内容表达'],
  ['GX', 'guomao', '专案定制', '5-60 秒', '专案', '按项目', '按传播任务与周期单独核价'],
  ['H01', 'hengrun', '区域试投', '15 秒', '轻频', '按月', '适合小预算区域首次尝试'],
  ['H02', 'hengrun', '路口标准', '15 秒', '中频', '按月', '适合区域品牌覆盖'],
  ['H03', 'hengrun', '路口高频', '15 秒', '高频', '按月', '适合强化本地记忆'],
  ['H04', 'hengrun', '长版触达', '30 秒', '中频', '按月', '适合区域完整内容表达'],
  ['HX', 'hengrun', '专案定制', '5-60 秒', '专案', '按项目', '按传播任务与周期单独核价'],
] as const

export const seedCases = [
  {
    slug: 'city-after-dark',
    title: '城市夜经济传播样片',
    category: '创意样片',
    summary: '为户外夜景环境重新组织亮度、字级和观看距离，验证品牌主画面在街头环境中的识别效率。',
    challenge: '夜间环境光复杂，常规海报直接放大后容易失去层次。',
    solution: '使用强对比标题、克制信息层级和适合远距离观看的大字结构。',
    result: '完成白昼与夜景两套观看条件下的画面节奏测试。',
    coverImage: '/images/guomao-night-crossing.jpg',
    mediaSlug: 'guomao',
    featured: true,
    sortOrder: 1,
  },
  {
    slug: 'city-new-arrival',
    title: '城市新品发布样片',
    category: '创意样片',
    summary: '用简洁的主视觉和硬朗色彩建立城市级发布感，适合新品、节点活动与品牌升级内容。',
    challenge: '短时间播放需要让核心信息在远距离被快速识别。',
    solution: '压缩文字层级，将品牌名、主标题和视觉锚点放在明确阅读顺序中。',
    result: '形成适合国贸屏 3:1 比例的首屏创意模板。',
    coverImage: '/images/guomao-day.jpg',
    mediaSlug: 'guomao',
    featured: true,
    sortOrder: 2,
  },
  {
    slug: 'street-event',
    title: '城市活动传播样片',
    category: '创意样片',
    summary: '面向核心路口和近距离观看场景，突出活动时间、地点与单一行动信息。',
    challenge: '路口观看时间短，信息必须一眼完成识别。',
    solution: '用高对比大标题配合少量辅助信息，减少远距离不可读的小字。',
    result: '形成适合恒润屏 2:1 比例的活动信息模板。',
    coverImage: '/images/hengrun-night.jpg',
    mediaSlug: 'hengrun',
    featured: true,
    sortOrder: 3,
  },
] as const

export const seedArticles = [
  {
    slug: 'how-to-choose-outdoor-led-screen',
    title: '西宁户外 LED 大屏怎么选：先看传播任务，再看屏幕',
    excerpt: '国贸大厦屏和恒润大厦屏承担不同传播任务。本文从画面尺度、观看距离和内容类型三个维度说明如何选屏。',
    category: '投放指南',
    content:
      '选择户外 LED 大屏时，先明确品牌需要在城市尺度建立第一眼，还是在核心路口完成近距离提醒。\n\n国贸大厦 LED 屏适合品牌主画面、城市事件与高识别度内容；恒润大厦 LED 屏适合区域活动、门店信息和路口触达。两块屏分别报价，也可以按同一个传播任务进行组合。\n\n正式投放前，需要确认画面比例、播放时长、频次、档期和素材审核要求。',
  },
  {
    slug: 'outdoor-led-creative-checklist',
    title: '户外 LED 广告画面制作前，需要确认的 6 件事',
    excerpt: '从画面比例、远距离识别、信息层级、亮度、安全边距到最终输出，整理户外大屏创意的制作检查清单。',
    category: '创意制作',
    content:
      '户外大屏不是把平面海报简单放大。制作前应确认画面比例、有效安全区、观看距离、播放时长、环境亮度和审核要求。\n\n主标题应当能在远距离快速识别，核心信息不宜过多。需要展示二维码、活动细则或长段文字时，应重新评估媒介组合，而不是把全部内容压进一块屏。',
  },
  {
    slug: 'xining-city-media-brief',
    title: '西宁城市户外传播简报：单屏、双屏与内容节奏',
    excerpt: '解释国贸大厦屏与恒润大厦屏的单屏价值、双屏组合方式以及不同传播周期下的内容节奏。',
    category: '城市传播',
    content:
      '城市户外传播需要同时考虑屏幕位置、观看距离和内容停留时间。国贸大厦屏提供城市级主画面，恒润大厦屏补充核心路口触达。\n\n单屏适合目标明确的投放任务；双屏适合需要城市尺度和路口重复提醒的项目。具体档期、价格与播放频次以当期确认单为准。',
  },
] as const

export const seedPartners = [
  ['品牌客户', 'BRAND'],
  ['文旅项目', 'CULTURE'],
  ['城市活动', 'EVENT'],
  ['内容机构', 'CREATIVE'],
  ['商业综合体', 'RETAIL'],
  ['媒体渠道', 'MEDIA'],
] as const

export const fallbackScreens: ScreenView[] = seedScreens.map((screen, index) => ({
  ...screen,
  id: index + 1,
  mapUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  pricingPlans: seedPricingPlans
    .filter((plan) => plan[1] === screen.slug)
    .map((plan, planIndex) => ({
      id: index * 10 + planIndex + 1,
      code: plan[0],
      screenSlug: plan[1],
      name: plan[2],
      duration: plan[3],
      frequency: plan[4],
      period: plan[5],
      price: null,
      priceLabel: '询价',
      description: plan[6],
      sortOrder: planIndex + 1,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
}))

export const fallbackCases: CaseView[] = seedCases.map((item, index) => {
  const screen = fallbackScreens.find((entry) => entry.slug === item.mediaSlug)
  return {
    ...item,
    id: index + 1,
    client: null,
    mediaSlug: item.mediaSlug,
    status: 'published',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    screen: screen ?? null,
  }
})

export async function getScreens(): Promise<ScreenView[]> {
  try {
    const screens = await prisma.screen.findMany({
      where: { status: 'published' },
      include: {
        pricingPlans: {
          where: { status: 'published' },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })
    return screens.length ? screens : fallbackScreens
  } catch {
    return fallbackScreens
  }
}

export async function getScreen(slug: string): Promise<ScreenView | null> {
  const screens = await getScreens()
  return screens.find((screen) => screen.slug === slug) ?? null
}

export async function getCases(): Promise<CaseView[]> {
  try {
    const cases = await prisma.caseStudy.findMany({
      where: { status: 'published' },
      include: { screen: true },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
    })
    return cases.length ? cases : fallbackCases
  } catch {
    return fallbackCases
  }
}

export async function getCase(slug: string): Promise<CaseView | null> {
  const cases = await getCases()
  return cases.find((item) => item.slug === slug) ?? null
}

export async function getArticles() {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
    })
    return articles.length
      ? articles
      : seedArticles.map((article, index) => ({
          ...article,
          id: index + 1,
          coverImage: null,
          status: 'published',
          seoTitle: null,
          seoDescription: null,
          publishedAt: new Date(Date.now() - index * 86400000),
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
  } catch {
    return seedArticles.map((article, index) => ({
      ...article,
      id: index + 1,
      coverImage: null,
      status: 'published',
      seoTitle: null,
      seoDescription: null,
      publishedAt: new Date(Date.now() - index * 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  }
}

export async function getArticle(slug: string) {
  const articles = await getArticles()
  return articles.find((article) => article.slug === slug) ?? null
}

export async function getPartners() {
  try {
    const partners = await prisma.partner.findMany({
      where: { status: 'published' },
      orderBy: { sortOrder: 'asc' },
    })
    return partners.length
      ? partners
      : seedPartners.map(([name, category], index) => ({
          id: index + 1,
          name,
          category,
          website: null,
          logo: null,
          authorized: false,
          sortOrder: index + 1,
          status: 'published',
        }))
  } catch {
    return seedPartners.map(([name, category], index) => ({
      id: index + 1,
      name,
      category,
      website: null,
      logo: null,
      authorized: false,
      sortOrder: index + 1,
      status: 'published',
    }))
  }
}

export async function getSeoPage(path: string) {
  try {
    return await prisma.pageSeo.findUnique({ where: { path } })
  } catch {
    return null
  }
}

export function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}
