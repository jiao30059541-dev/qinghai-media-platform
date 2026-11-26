import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { saveSeoPage } from '../actions'
import {
  CheckField,
  Field,
  SaveButton,
  SectionHeading,
  StatusBadge,
  TextareaField,
} from '../_components/Fields'

export const dynamic = 'force-dynamic'

export default async function AdminSeoPage() {
  await requireAdminPage()
  const pages = await prisma.pageSeo.findMany({ orderBy: { path: 'asc' } })

  return (
    <div>
      <SectionHeading
        eyebrow="SEARCH / METADATA"
        title="SEO 设置"
        description="覆盖页面标题、描述、关键词和分享图片。修改后保留 canonical、OpenGraph 与结构化数据。"
      />

      <details className="mb-7 border border-black/10 bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-black">新增页面 SEO</summary>
        <form action={saveSeoPage} className="grid gap-4 border-t border-black/10 p-5 md:grid-cols-2">
          <Field label="页面路径" name="path" placeholder="/screens/guomao" required />
          <Field label="分享图片路径" name="ogImage" placeholder="/images/guomao-night-hero.jpg" />
          <Field label="SEO 标题" name="title" required className="md:col-span-2" />
          <TextareaField label="SEO 描述" name="description" required className="md:col-span-2" />
          <TextareaField label="关键词（英文逗号分隔）" name="keywords" required className="md:col-span-2" />
          <div className="flex items-center"><CheckField label="禁止搜索引擎收录" name="noindex" /></div>
          <div className="flex justify-end"><SaveButton label="新增 SEO" /></div>
        </form>
      </details>

      <div className="grid gap-4">
        {pages.map((page) => (
          <article key={page.id} className="border border-black/10 bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b border-black/10 px-5 py-4">
              <h2 className="font-mono text-sm font-black">{page.path}</h2>
              <StatusBadge status={page.noindex ? 'archived' : 'published'} />
            </div>
            <form action={saveSeoPage} className="grid gap-4 p-5 md:grid-cols-2">
              <input type="hidden" name="id" value={page.id} />
              <Field label="页面路径" name="path" defaultValue={page.path} required />
              <Field label="分享图片路径" name="ogImage" defaultValue={page.ogImage} />
              <Field label="SEO 标题" name="title" defaultValue={page.title} required className="md:col-span-2" />
              <TextareaField label="SEO 描述" name="description" defaultValue={page.description} required className="md:col-span-2" />
              <TextareaField label="关键词（英文逗号分隔）" name="keywords" defaultValue={page.keywords} required className="md:col-span-2" />
              <div className="flex items-center"><CheckField label="禁止搜索引擎收录" name="noindex" defaultChecked={page.noindex} /></div>
              <div className="flex justify-end"><SaveButton /></div>
            </form>
          </article>
        ))}
      </div>
    </div>
  )
}
