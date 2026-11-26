import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Phone } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { pageMetadata } from '@/lib/seo'
import { getSiteConfig } from '@/lib/site'

export const dynamic = 'force-dynamic'

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const statusMap: Record<string, { label: string; className: string }> = {
  available: { label: '可预约', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  limited: { label: '少量', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  full: { label: '满档', className: 'bg-red-50 text-red-700 border-red-200' },
  closed: { label: '停投', className: 'bg-black/5 text-black/40 border-black/10' },
  ask: { label: '咨询', className: 'bg-white text-black/45 border-black/10' },
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(year: number, month: number, offset: number) {
  const value = new Date(Date.UTC(year, month - 1 + offset, 1))
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const query = await searchParams
  return pageMetadata({
    path: query.month ? `/availability?month=${query.month}` : '/availability',
    title: '国贸大厦与恒润大厦LED屏档期查询｜名扬天下传媒',
    description:
      '按月查看国贸大厦LED屏与恒润大厦LED屏的可预约状态。档期会随确认单更新，最终可投放时间以正式沟通为准。',
  })
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const query = await searchParams
  const now = new Date()
  const requested = /^\d{4}-\d{2}$/.test(query.month || '') ? query.month! : monthKey(now)
  const [yearText, monthText] = requested.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const safeYear = year >= 2024 && year <= 2100 ? year : now.getUTCFullYear()
  const safeMonth = month >= 1 && month <= 12 ? month : now.getUTCMonth() + 1
  const monthStart = new Date(Date.UTC(safeYear, safeMonth - 1, 1))
  const monthEnd = new Date(Date.UTC(safeYear, safeMonth, 0))
  const startDate = monthStart.toISOString().slice(0, 10)
  const endDate = monthEnd.toISOString().slice(0, 10)

  const records = await prisma.availabilityDay.findMany({
    where: {
      status: 'published',
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  })
  const byDate = new Map(records.map((record) => [record.date, record]))
  const config = await getSiteConfig()

  const startOffset = monthStart.getUTCDay()
  const daysInMonth = monthEnd.getUTCDate()
  const cells = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <>
      <section className="bg-[#101419] py-16 text-white lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1.18fr_.82fr] lg:items-end">
          <div>
            <span className="eyebrow">AVAILABILITY / SCREEN CALENDAR</span>
            <h1 className="display-title mt-7">
              先看档期，
              <br />
              <span className="text-signal">再安排投放。</span>
            </h1>
          </div>
          <div>
            <p className="text-[16px] leading-8 text-white/55">
              日历展示已维护的档期状态。未标记日期默认需要咨询确认；正式档期以双方确认单为准。
            </p>
            <a href={`tel:${config.phone}`} className="mono mt-6 inline-flex items-center gap-3 text-lg font-black">
              <Phone className="h-5 w-5 text-signal" />
              {config.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container-site">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-signal" />
              <h2 className="text-2xl font-black">
                {safeYear} 年 {safeMonth} 月
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/availability?month=${shiftMonth(safeYear, safeMonth, -1)}`}
                className="grid h-10 w-10 place-items-center border border-black/15 hover:border-signal hover:text-signal"
                aria-label="上一个月"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/availability" className="flex min-h-10 items-center border border-black/15 px-4 text-xs font-black hover:border-signal">
                本月
              </Link>
              <Link
                href={`/availability?month=${shiftMonth(safeYear, safeMonth, 1)}`}
                className="grid h-10 w-10 place-items-center border border-black/15 hover:border-signal hover:text-signal"
                aria-label="下一个月"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden border border-black/10 bg-white">
            <div className="grid grid-cols-7 border-b border-black/10 bg-black/[0.035]">
              {weekDays.map((day) => (
                <div key={day} className="px-2 py-3 text-center text-[10px] font-black text-black/45">
                  周{day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="min-h-[130px] border-b border-r border-black/[0.07] bg-black/[0.018]" />
                const date = `${safeYear}-${String(safeMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const record = byDate.get(date)
                const guomao = statusMap[record?.guomaoStatus || 'ask']
                const hengrun = statusMap[record?.hengrunStatus || 'ask']
                const isToday = date === now.toISOString().slice(0, 10)
                return (
                  <div key={date} className={`min-h-[130px] border-b border-r border-black/[0.07] p-2 sm:p-3 ${isToday ? 'bg-signal/[0.045]' : ''}`}>
                    <div className="flex items-center justify-between">
                      <strong className={`grid h-7 w-7 place-items-center text-xs ${isToday ? 'bg-signal text-white' : ''}`}>
                        {day}
                      </strong>
                      {record?.note && <span title={record.note} className="h-1.5 w-1.5 bg-signal" />}
                    </div>
                    <div className="mt-3 grid gap-1.5">
                      <span className={`border px-1.5 py-1 text-[9px] font-bold sm:text-[10px] ${guomao.className}`}>
                        国贸 · {guomao.label}
                      </span>
                      <span className={`border px-1.5 py-1 text-[9px] font-bold sm:text-[10px] ${hengrun.className}`}>
                        恒润 · {hengrun.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 border border-black/10 bg-white p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-3 text-[11px] text-black/45">
              {['available', 'limited', 'full', 'ask'].map((key) => (
                <span key={key} className={`border px-2 py-1 font-bold ${statusMap[key].className}`}>
                  {statusMap[key].label}
                </span>
              ))}
            </div>
            <p className="text-xs text-black/40">点击具体日期前，请先与销售确认播放时段和素材审核时间。</p>
            <Link href="/quote" className="btn-primary shrink-0">提交投放需求</Link>
          </div>
        </div>
      </section>
    </>
  )
}
