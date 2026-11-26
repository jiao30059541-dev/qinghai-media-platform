'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

function text(formData: FormData, key: string, max = 5000) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function optionalText(formData: FormData, key: string, max = 5000) {
  return text(formData, key, max) || null
}

function integer(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key))
  return Number.isFinite(value) ? Math.trunc(value) : fallback
}

function optionalInteger(formData: FormData, key: string) {
  const value = text(formData, key, 30)
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

function boolean(formData: FormData, key: string) {
  return formData.get(key) === 'true'
}

function revalidatePublic(paths: string[]) {
  for (const path of ['/', ...paths]) revalidatePath(path)
  revalidatePath('/sitemap.xml')
}

export async function saveScreen(formData: FormData) {
  await requireAdmin()
  const id = optionalInteger(formData, 'id')
  const data = {
    slug: text(formData, 'slug', 80),
    name: text(formData, 'name', 120),
    shortName: text(formData, 'shortName', 80),
    role: text(formData, 'role', 80),
    location: text(formData, 'location', 200),
    area: text(formData, 'area', 50),
    displaySize: text(formData, 'displaySize', 80),
    resolution: text(formData, 'resolution', 80),
    pixelPitch: text(formData, 'pixelPitch', 50),
    brightness: optionalText(formData, 'brightness', 100),
    operatingHours: optionalText(formData, 'operatingHours', 100),
    dailyPlays: optionalText(formData, 'dailyPlays', 100),
    description: text(formData, 'description', 2000),
    highlights: text(formData, 'highlights', 2000),
    heroImage: text(formData, 'heroImage', 500),
    galleryImages: text(formData, 'galleryImages', 3000),
    mapUrl: optionalText(formData, 'mapUrl', 1000),
    sortOrder: integer(formData, 'sortOrder'),
    status: text(formData, 'status', 30) || 'published',
  }

  if (id) {
    await prisma.screen.update({ where: { id }, data })
  } else {
    await prisma.screen.create({ data })
  }
  revalidatePublic(['/screens', `/screens/${data.slug}`, '/quote'])
}

export async function savePricingPlan(formData: FormData) {
  await requireAdmin()
  const id = optionalInteger(formData, 'id')
  const data = {
    code: text(formData, 'code', 50),
    screenSlug: text(formData, 'screenSlug', 80),
    name: text(formData, 'name', 100),
    duration: text(formData, 'duration', 50),
    frequency: text(formData, 'frequency', 50),
    period: text(formData, 'period', 50),
    price: optionalInteger(formData, 'price'),
    priceLabel: text(formData, 'priceLabel', 50) || '询价',
    description: optionalText(formData, 'description', 500),
    sortOrder: integer(formData, 'sortOrder'),
    status: text(formData, 'status', 30) || 'published',
  }

  if (id) {
    await prisma.pricingPlan.update({ where: { id }, data })
  } else {
    await prisma.pricingPlan.create({ data })
  }
  revalidatePublic(['/screens', `/screens/${data.screenSlug}`, '/quote'])
}

export async function saveCaseStudy(formData: FormData) {
  await requireAdmin()
  const id = optionalInteger(formData, 'id')
  const publishedAt = text(formData, 'publishedAt', 40)
  const status = text(formData, 'status', 30) || 'draft'
  const data = {
    slug: text(formData, 'slug', 100),
    title: text(formData, 'title', 160),
    client: optionalText(formData, 'client', 120),
    category: text(formData, 'category', 80),
    summary: text(formData, 'summary', 1000),
    challenge: text(formData, 'challenge', 2000),
    solution: text(formData, 'solution', 2000),
    result: text(formData, 'result', 2000),
    coverImage: text(formData, 'coverImage', 500),
    mediaSlug: optionalText(formData, 'mediaSlug', 80),
    featured: boolean(formData, 'featured'),
    status,
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    sortOrder: integer(formData, 'sortOrder'),
  }

  if (id) {
    await prisma.caseStudy.update({ where: { id }, data })
  } else {
    await prisma.caseStudy.create({ data })
  }
  revalidatePublic(['/cases', `/cases/${data.slug}`])
}

export async function saveArticle(formData: FormData) {
  await requireAdmin()
  const id = optionalInteger(formData, 'id')
  const publishedAt = text(formData, 'publishedAt', 40)
  const status = text(formData, 'status', 30) || 'draft'
  const data = {
    slug: text(formData, 'slug', 120),
    title: text(formData, 'title', 200),
    excerpt: text(formData, 'excerpt', 1000),
    content: text(formData, 'content', 30000),
    category: text(formData, 'category', 80),
    coverImage: optionalText(formData, 'coverImage', 500),
    status,
    seoTitle: optionalText(formData, 'seoTitle', 200),
    seoDescription: optionalText(formData, 'seoDescription', 400),
    publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
  }

  if (id) {
    await prisma.article.update({ where: { id }, data })
  } else {
    await prisma.article.create({ data })
  }
  revalidatePublic(['/insights', `/insights/${data.slug}`])
}

export async function savePartner(formData: FormData) {
  await requireAdmin()
  const id = optionalInteger(formData, 'id')
  const data = {
    name: text(formData, 'name', 120),
    category: text(formData, 'category', 80),
    website: optionalText(formData, 'website', 500),
    logo: optionalText(formData, 'logo', 500),
    authorized: boolean(formData, 'authorized'),
    sortOrder: integer(formData, 'sortOrder'),
    status: text(formData, 'status', 30) || 'published',
  }

  if (id) {
    await prisma.partner.update({ where: { id }, data })
  } else {
    await prisma.partner.create({ data })
  }
  revalidatePublic(['/about'])
}

export async function saveSeoPage(formData: FormData) {
  await requireAdmin()
  const id = optionalInteger(formData, 'id')
  const path = text(formData, 'path', 200)
  const data = {
    path,
    title: text(formData, 'title', 200),
    description: text(formData, 'description', 400),
    keywords: text(formData, 'keywords', 500),
    ogImage: optionalText(formData, 'ogImage', 500),
    noindex: boolean(formData, 'noindex'),
  }

  if (id) {
    await prisma.pageSeo.update({ where: { id }, data })
  } else {
    await prisma.pageSeo.create({ data })
  }
  revalidatePublic([path])
}

export async function saveSetting(formData: FormData) {
  await requireAdmin()
  const key = text(formData, 'key', 100)
  const value = text(formData, 'value', 3000)
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  revalidatePublic(['/', '/contact'])
}

export async function saveAvailabilityDay(formData: FormData) {
  await requireAdmin()
  const id = optionalInteger(formData, 'id')
  const date = text(formData, 'date', 10)
  const data = {
    date,
    guomaoStatus: text(formData, 'guomaoStatus', 30) || 'ask',
    hengrunStatus: text(formData, 'hengrunStatus', 30) || 'ask',
    note: optionalText(formData, 'note', 500),
    status: text(formData, 'status', 30) || 'published',
  }

  if (id) {
    await prisma.availabilityDay.update({ where: { id }, data })
  } else {
    await prisma.availabilityDay.upsert({
      where: { date },
      update: data,
      create: data,
    })
  }
  revalidatePublic(['/availability'])
}

export async function updateLeadStatus(formData: FormData) {
  await requireAdmin()
  const id = integer(formData, 'id')
  const status = text(formData, 'status', 30) || 'new'
  await prisma.lead.update({ where: { id }, data: { status } })
  revalidatePath('/admin')
  revalidatePath('/admin/leads')
}
