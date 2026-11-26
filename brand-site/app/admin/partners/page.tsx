import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { savePartner } from '../actions'
import {
  CheckField,
  Field,
  SaveButton,
  SectionHeading,
  SelectField,
  StatusBadge,
} from '../_components/Fields'

export const dynamic = 'force-dynamic'

const publishOptions = [
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '已下线' },
]

export default async function AdminPartnersPage() {
  await requireAdminPage()
  const partners = await prisma.partner.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div>
      <SectionHeading
        eyebrow="RELATIONSHIPS / PARTNERS"
        title="合作伙伴"
        description="只有获得授权后再发布真实客户名称与 Logo。未授权时建议仅维护合作类别。"
      />

      <details className="mb-7 border border-black/10 bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-black">新增合作伙伴或合作类别</summary>
        <form action={savePartner} className="grid gap-4 border-t border-black/10 p-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="名称" name="name" required />
          <Field label="分类" name="category" placeholder="文旅项目 / 品牌客户" required />
          <Field label="官网链接（可选）" name="website" />
          <Field label="Logo 图片路径（可选）" name="logo" />
          <Field label="排序" name="sortOrder" type="number" defaultValue={partners.length + 1} />
          <SelectField label="发布状态" name="status" defaultValue="draft" options={publishOptions} />
          <div className="flex items-end pb-2"><CheckField label="已获得展示授权" name="authorized" /></div>
          <div className="flex items-end pb-1"><SaveButton label="新增" /></div>
        </form>
      </details>

      <div className="border border-black/10 bg-white">
        <div className="divide-y divide-black/[0.07]">
          {partners.map((partner) => (
            <details key={partner.id}>
              <summary className="grid cursor-pointer gap-3 px-5 py-4 text-sm sm:grid-cols-[1fr_150px_120px_100px] sm:items-center">
                <strong>{partner.name}</strong>
                <span className="font-mono text-[10px] text-black/40">{partner.category}</span>
                <StatusBadge status={partner.status} />
                <span className="text-xs text-black/35">{partner.authorized ? '已授权' : '类别展示'}</span>
              </summary>
              <form action={savePartner} className="grid gap-4 border-t border-black/[0.07] bg-black/[0.018] p-5 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={partner.id} />
                <Field label="名称" name="name" defaultValue={partner.name} required />
                <Field label="分类" name="category" defaultValue={partner.category} required />
                <Field label="官网链接（可选）" name="website" defaultValue={partner.website} />
                <Field label="Logo 图片路径（可选）" name="logo" defaultValue={partner.logo} />
                <Field label="排序" name="sortOrder" type="number" defaultValue={partner.sortOrder} />
                <SelectField label="发布状态" name="status" defaultValue={partner.status} options={publishOptions} />
                <div className="flex items-end pb-2"><CheckField label="已获得展示授权" name="authorized" defaultChecked={partner.authorized} /></div>
                <div className="flex items-end pb-1"><SaveButton /></div>
              </form>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
