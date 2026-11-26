import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyNewLead } from '@/lib/notify'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function clean(value: unknown, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request.headers)
    const limit = checkRateLimit(`lead:${ip}`, 5, 10 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: '提交过于频繁，请稍后再试或直接致电咨询。' },
        { status: 429 }
      )
    }

    const body = (await request.json()) as Record<string, unknown>
    if (clean(body.website)) {
      return NextResponse.json({ ok: true })
    }

    const name = clean(body.name, 40)
    const phone = clean(body.phone, 20).replace(/\s+/g, '')
    const company = clean(body.company, 120)
    const screenInterest = clean(body.screenInterest, 40)
    const campaignDate = clean(body.campaignDate, 30)
    const budget = clean(body.budget, 80)
    const message = clean(body.message, 1500)
    const source = clean(body.source, 80) || 'website'

    if (name.length < 2) {
      return NextResponse.json({ error: '请填写姓名。' }, { status: 400 })
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: '请填写有效的手机号码。' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        company: company || null,
        screenInterest: screenInterest || null,
        campaignDate: campaignDate || null,
        budget: budget || null,
        message: message || null,
        source,
      },
    })

    let notificationStatus = 'not_configured'
    try {
      notificationStatus = await notifyNewLead(lead)
    } catch (error) {
      console.error('Lead notification failed', error)
      notificationStatus = 'failed'
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: { notificationStatus },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error('Lead submission failed', error)
    return NextResponse.json(
      { error: '暂时无法提交，请直接拨打电话联系。' },
      { status: 500 }
    )
  }
}
