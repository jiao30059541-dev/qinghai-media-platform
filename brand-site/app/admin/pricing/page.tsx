import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { savePricingPlan } from '../actions'
import {
  Field,
  SaveButton,
  SectionHeading,
  SelectField,
  StatusBadge,
  TextareaField,
} from '../_components/Fields'

export const dynamic = 'force-dynamic'

const screenOptions = [
  { value: 'guomao', label: '国贸大厦 LED 屏' },
  { value: 'hengrun', label: '恒润大厦 LED 屏' },
]

const publishOptions = [
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '已下线' },
]

export default async function AdminPricingPage() {
  await requireAdminPage()
  const plans = await prisma.pricingPlan.findMany({
    include: { screen: true },
    orderBy: [{ screenSlug: 'asc' }, { sortOrder: 'asc' }],
  })

  return (
    <div>
      <SectionHeading
        eyebrow="PRICING / SALES PACKAGES"
        title="价格档位"
        description="价格和对外文案可逐条维护。未定价时建议填写“询价”；上线正式价格后再更新金额或价格标签。"
      />

      <details className="mb-7 border border-black/10 bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-black">新增价格档位</summary>
        <form action={savePricingPlan} className="grid gap-4 border-t border-black/10 p-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="档位代码" name="code" placeholder="例如 G05" required />
          <SelectField label="所属屏幕" name="screenSlug" options={screenOptions} />
          <Field label="档位名称" name="name" required />
          <Field label="播放时长" name="duration" placeholder="15 秒" required />
          <Field label="播放频次" name="frequency" placeholder="中频" required />
          <Field label="计费周期" name="period" placeholder="按月" required />
          <Field label="价格（元，可空）" name="price" type="number" min={0} step={1} />
          <Field label="对外价格标签" name="priceLabel" defaultValue="询价" required />
          <Field label="排序" name="sortOrder" type="number" defaultValue={plans.length + 1} />
          <SelectField label="发布状态" name="status" defaultValue="draft" options={publishOptions} />
          <TextareaField label="档位说明" name="description" className="md:col-span-2" />
          <div className="md:col-span-2 xl:col-span-4"><SaveButton label="新增档位" /></div>
        </form>
      </details>

      <div className="border border-black/10 bg-white">
        <div className="grid gap-3 border-b border-black/10 px-5 py-4 sm:grid-cols-[80px_1fr_1fr_180px] sm:items-center">
          <span className="text-[10px] font-bold text-black/35">代码</span>
          <span className="text-[10px] font-bold text-black/35">姓名与屏幕</span>
          <span className="text-[10px] font-bold text-black/35">播出条件</span>
          <span className="text-[10px] font-bold text-black/35">价格与状态</span>
        </div>
        <div className="divide-y divide-black/[0.07]">
          {plans.map((plan) => (
            <details key={plan.id}>
              <summary className="grid cursor-pointer gap-3 px-5 py-4 text-sm sm:grid-cols-[80px_1fr_1fr_180px] sm:items-center">
                <strong className="font-mono text-xs">{plan.code}</strong>
                <span>
                  <b className="block">{plan.name}</b>
                  <small className="mt-1 block text-[10px] text-black/40">{plan.screen?.name || plan.screenSlug}</small>
                </span>
                <span className="text-xs text-black/50">{plan.duration} · {plan.frequency} · {plan.period}</span>
                <span className="flex items-center gap-2">
                  <b className="text-sm">{plan.priceLabel}</b>
                  <StatusBadge status={plan.status} />
                </span>
              </summary>
              <form action={savePricingPlan} className="grid gap-4 border-t border-black/[0.07] bg-black/[0.018] p-5 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={plan.id} />
                <Field label="档位代码" name="code" defaultValue={plan.code} required />
                <SelectField label="所属屏幕" name="screenSlug" defaultValue={plan.screenSlug} options={screenOptions} />
                <Field label="档位名称" name="name" defaultValue={plan.name} required />
                <Field label="播放时长" name="duration" defaultValue={plan.duration} required />
                <Field label="播放频次" name="frequency" defaultValue={plan.frequency} required />
                <Field label="计费周期" name="period" defaultValue={plan.period} required />
                <Field label="价格（元，可空）" name="price" type="number" min={0} step={1} defaultValue={plan.price} />
                <Field label="对外价格标签" name="priceLabel" defaultValue={plan.priceLabel} required />
                <Field label="排序" name="sortOrder" type="number" defaultValue={plan.sortOrder} />
                <SelectField label="发布状态" name="status" defaultValue={plan.status} options={publishOptions} />
                <TextareaField label="档位说明" name="description" defaultValue={plan.description} className="md:col-span-2" />
                <div className="md:col-span-2 xl:col-span-4"><SaveButton /></div>
              </form>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
