import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { saveAvailabilityDay } from '../actions'
import {
  Field,
  SaveButton,
  SectionHeading,
  SelectField,
  StatusBadge,
  TextareaField,
} from '../_components/Fields'

export const dynamic = 'force-dynamic'

const statusOptions = [
  { value: 'available', label: '可预约' },
  { value: 'limited', label: '少量可约' },
  { value: 'full', label: '已满档' },
  { value: 'closed', label: '停止投放' },
  { value: 'ask', label: '咨询确认' },
]

export default async function AdminAvailabilityPage() {
  await requireAdminPage()
  const rows = await prisma.availabilityDay.findMany({
    orderBy: { date: 'desc' },
    take: 180,
  })

  return (
    <div>
      <SectionHeading
        eyebrow="AVAILABILITY / CALENDAR"
        title="档期日历"
        description="为具体日期标记国贸与恒润的档期状态。未维护的日期，网站统一显示“咨询确认”。"
      />

      <details className="mb-7 border border-black/10 bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-black">新增或覆盖某个日期</summary>
        <form action={saveAvailabilityDay} className="grid gap-4 border-t border-black/10 p-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="日期" name="date" type="date" required />
          <SelectField label="国贸大厦屏" name="guomaoStatus" options={statusOptions} defaultValue="ask" />
          <SelectField label="恒润大厦屏" name="hengrunStatus" options={statusOptions} defaultValue="ask" />
          <Field label="备注" name="note" placeholder="例如：春节档满档" />
          <div className="md:col-span-2 xl:col-span-4">
            <SaveButton label="保存档期" />
          </div>
        </form>
      </details>

      <div className="border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4">
          <h2 className="font-black">已维护档期</h2>
          <p className="mt-1 text-xs text-black/40">最近录入的 180 条记录</p>
        </div>
        <div className="divide-y divide-black/[0.07]">
          {rows.map((row) => (
            <details key={row.id} className="group">
              <summary className="grid cursor-pointer gap-3 px-5 py-4 text-sm sm:grid-cols-[150px_1fr_1fr_120px] sm:items-center">
                <strong className="font-mono">{row.date}</strong>
                <span className="flex items-center gap-2 text-xs text-black/50">
                  国贸 <StatusBadge status={row.guomaoStatus} />
                </span>
                <span className="flex items-center gap-2 text-xs text-black/50">
                  恒润 <StatusBadge status={row.hengrunStatus} />
                </span>
                <span className="text-xs text-black/35">{row.note || '无备注'}</span>
              </summary>
              <form action={saveAvailabilityDay} className="grid gap-4 border-t border-black/[0.07] bg-black/[0.018] p-5 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={row.id} />
                <Field label="日期" name="date" type="date" defaultValue={row.date} required />
                <SelectField label="国贸大厦屏" name="guomaoStatus" defaultValue={row.guomaoStatus} options={statusOptions} />
                <SelectField label="恒润大厦屏" name="hengrunStatus" defaultValue={row.hengrunStatus} options={statusOptions} />
                <Field label="备注" name="note" defaultValue={row.note} />
                <div className="md:col-span-2 xl:col-span-4"><SaveButton /></div>
              </form>
            </details>
          ))}
          {!rows.length && <p className="px-5 py-14 text-center text-sm text-black/40">还没有维护档期。</p>}
        </div>
      </div>
    </div>
  )
}
