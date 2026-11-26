import Link from 'next/link'
import { Phone, Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { updateLeadStatus } from '../actions'
import { SectionHeading, StatusBadge } from '../_components/Fields'

export const dynamic = 'force-dynamic'

const statusOptions = [
  { value: 'new', label: '新询盘' },
  { value: 'contacted', label: '已联系' },
  { value: 'quoted', label: '已报价' },
  { value: 'won', label: '已成交' },
  { value: 'lost', label: '未成交' },
]

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  await requireAdminPage()
  const query = await searchParams
  const keyword = query.q?.trim() || ''
  const status = query.status || ''

  const leads = await prisma.lead.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(keyword
        ? {
            OR: [
              { name: { contains: keyword } },
              { phone: { contains: keyword } },
              { company: { contains: keyword } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })

  return (
    <div>
      <SectionHeading
        eyebrow="LEADS / CUSTOMER INBOX"
        title="客户询盘"
        description="询盘数据只保存在后台。请及时联系客户并更新跟进状态；网站不会公开客户联系方式。"
      />

      <form className="mb-6 grid gap-3 border border-black/10 bg-white p-4 md:grid-cols-[1fr_180px_auto]">
        <label className="flex min-h-11 items-center gap-2 border border-black/15 px-3">
          <Search className="h-4 w-4 text-black/35" />
          <input name="q" defaultValue={keyword} className="min-w-0 flex-1 outline-none" placeholder="搜索姓名、电话或公司" />
        </label>
        <select name="status" defaultValue={status} className="min-h-11 border border-black/15 bg-white px-3">
          <option value="">全部状态</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <button className="min-h-11 bg-[#16191d] px-6 text-sm font-black text-white hover:bg-signal">筛选</button>
      </form>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <article key={lead.id} className="border border-black/10 bg-white">
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black">{lead.name}</h2>
                  <StatusBadge status={lead.status} />
                  <StatusBadge status={lead.notificationStatus} />
                </div>
                <a href={`tel:${lead.phone}`} className="mt-3 inline-flex items-center gap-2 font-mono text-sm font-bold text-signal">
                  <Phone className="h-4 w-4" />
                  {lead.phone}
                </a>
                <p className="mt-2 text-xs text-black/40">{lead.company || '未填写公司'}</p>
              </div>
              <dl className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div><dt className="text-black/35">意向屏幕</dt><dd className="mt-1 font-bold">{lead.screenInterest || '待确认'}</dd></div>
                <div><dt className="text-black/35">计划时间</dt><dd className="mt-1 font-bold">{lead.campaignDate || '待确认'}</dd></div>
                <div><dt className="text-black/35">来源</dt><dd className="mt-1 font-bold">{lead.source}</dd></div>
                <div><dt className="text-black/35">提交时间</dt><dd className="mt-1 font-bold">{lead.createdAt.toLocaleString('zh-CN', { hour12: false })}</dd></div>
              </dl>
              <form action={updateLeadStatus} className="flex min-w-[210px] gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <select name="status" defaultValue={lead.status} className="min-h-10 min-w-0 flex-1 border border-black/15 bg-white px-2 text-xs">
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button className="min-h-10 bg-[#16191d] px-3 text-xs font-black text-white hover:bg-signal">更新</button>
              </form>
            </div>
            {lead.message && (
              <div className="border-t border-black/[0.07] bg-black/[0.018] px-5 py-4">
                <span className="text-[10px] font-bold text-black/35">客户需求</span>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-black/65">{lead.message}</p>
              </div>
            )}
          </article>
        ))}
        {!leads.length && (
          <div className="border border-dashed border-black/20 bg-white px-6 py-20 text-center">
            <p className="text-sm text-black/45">没有符合条件的询盘。</p>
            {keyword || status ? <Link href="/admin/leads" className="mt-3 inline-block text-sm font-black text-signal">清除筛选</Link> : null}
          </div>
        )}
      </div>
    </div>
  )
}
