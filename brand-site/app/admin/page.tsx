import Link from 'next/link'
import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  MessageSquareText,
  Monitor,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { StatusBadge } from './_components/Fields'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  await requireAdminPage()
  const [newLeads, totalLeads, screens, cases, articles, availability, latestLeads] =
    await Promise.all([
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.lead.count(),
      prisma.screen.count(),
      prisma.caseStudy.count(),
      prisma.article.count(),
      prisma.availabilityDay.count(),
      prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    ])

  const stats = [
    { label: '新询盘', value: newLeads, note: `累计 ${totalLeads} 条`, href: '/admin/leads', icon: MessageSquareText },
    { label: '屏幕资源', value: screens, note: '国贸与恒润', href: '/admin/screens', icon: Monitor },
    { label: '案例内容', value: cases, note: '含样片与项目', href: '/admin/cases', icon: CircleDollarSign },
    { label: '知识文章', value: articles, note: 'SEO 内容资产', href: '/admin/articles', icon: FileText },
    { label: '档期记录', value: availability, note: '已维护日期', href: '/admin/availability', icon: CalendarDays },
  ]

  return (
    <div>
      <div className="mb-7">
        <span className="mono text-[9px] font-bold tracking-[0.13em] text-signal">
          DASHBOARD / TODAY
        </span>
        <h1 className="mt-2 text-3xl font-black">运营总览</h1>
        <p className="mt-2 text-sm text-black/45">
          先处理新询盘，再维护价格、档期和内容。所有前台变化会同步到正式页面。
        </p>
      </div>

      <div className="grid border-l border-t border-black/10 bg-white sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, note, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group min-h-[150px] border-b border-r border-black/10 p-5 hover:bg-[#fafafa]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black/45">{label}</span>
              <Icon className="h-4 w-4 text-signal" />
            </div>
            <strong className="mt-6 block text-4xl font-black">{value}</strong>
            <span className="mt-2 block text-[11px] text-black/35">{note}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_.65fr]">
        <section className="border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-black">最新客户询盘</h2>
              <p className="mt-1 text-xs text-black/40">按提交时间倒序</p>
            </div>
            <Link href="/admin/leads" className="text-xs font-black text-signal hover:underline">
              查看全部
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-black/[0.035] text-[10px] text-black/45">
                <tr>
                  <th className="px-5 py-3 font-bold">客户</th>
                  <th className="px-5 py-3 font-bold">意向</th>
                  <th className="px-5 py-3 font-bold">来源</th>
                  <th className="px-5 py-3 font-bold">状态</th>
                  <th className="px-5 py-3 font-bold">时间</th>
                </tr>
              </thead>
              <tbody>
                {latestLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-black/[0.07]">
                    <td className="px-5 py-4">
                      <strong className="block">{lead.name}</strong>
                      <a href={`tel:${lead.phone}`} className="mt-1 block font-mono text-xs text-signal">
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-xs text-black/55">{lead.screenInterest || '待确认'}</td>
                    <td className="px-5 py-4 text-xs text-black/45">{lead.source}</td>
                    <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-5 py-4 text-xs text-black/40">
                      {lead.createdAt.toLocaleString('zh-CN', { hour12: false })}
                    </td>
                  </tr>
                ))}
                {!latestLeads.length && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-black/40">
                      暂时还没有询盘。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="border border-black/10 bg-white p-5">
          <h2 className="text-lg font-black">上线检查</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div className="border-l-2 border-signal pl-3">
              <strong className="block">询盘通知</strong>
              <p className="mt-1 text-xs leading-6 text-black/45">
                配置企业微信机器人 Webhook 或 Resend 邮件后，新询盘会自动通知。
              </p>
            </div>
            <div className="border-l-2 border-signal pl-3">
              <strong className="block">百度统计</strong>
              <p className="mt-1 text-xs leading-6 text-black/45">
                在基础设置中填写统计 ID，前台会自动加载百度统计脚本。
              </p>
            </div>
            <div className="border-l-2 border-signal pl-3">
              <strong className="block">微信二维码</strong>
              <p className="mt-1 text-xs leading-6 text-black/45">
                上传真实二维码到图片目录后，在基础设置中填写路径。
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-2">
            <Link href="/admin/settings" className="bg-[#16191d] px-4 py-3 text-center text-sm font-black text-white hover:bg-signal">
              完善基础设置
            </Link>
            <Link href="/admin/pricing" className="border border-black/15 px-4 py-3 text-center text-sm font-black hover:border-signal">
              更新价格体系
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
