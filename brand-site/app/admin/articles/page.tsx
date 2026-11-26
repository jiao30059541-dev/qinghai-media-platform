import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { saveArticle } from '../actions'
import {
  Field,
  SaveButton,
  SectionHeading,
  SelectField,
  StatusBadge,
  TextareaField,
} from '../_components/Fields'

export const dynamic = 'force-dynamic'

const publishOptions = [
  { value: 'published', label: '已发布' },
  { value: 'draft', label: '草稿' },
  { value: 'archived', label: '已下线' },
]

export default async function AdminArticlesPage() {
  await requireAdminPage()
  const articles = await prisma.article.findMany({
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
  })

  return (
    <div>
      <SectionHeading
        eyebrow="CONTENT / OUTDOOR MEDIA INSIGHTS"
        title="文章知识"
        description="持续发布选屏、创意、档期和投放执行内容，建立百度搜索入口。文章正文使用空行分段。"
      />

      <details className="mb-7 border border-black/10 bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-black">新建文章</summary>
        <form action={saveArticle} className="grid gap-4 border-t border-black/10 p-5 md:grid-cols-2">
          <Field label="URL 标识" name="slug" placeholder="例如 how-to-choose-led-screen" required />
          <Field label="文章分类" name="category" placeholder="投放指南" required />
          <Field label="标题" name="title" required className="md:col-span-2" />
          <Field label="发布日期" name="publishedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          <SelectField label="发布状态" name="status" defaultValue="draft" options={publishOptions} />
          <Field label="封面图片路径（可选）" name="coverImage" />
          <Field label="SEO 标题（可选）" name="seoTitle" />
          <TextareaField label="摘要" name="excerpt" required className="md:col-span-2" />
          <TextareaField label="SEO 描述" name="seoDescription" className="md:col-span-2" />
          <TextareaField label="正文" name="content" rows={16} required className="md:col-span-2" />
          <div className="md:col-span-2"><SaveButton label="保存文章" /></div>
        </form>
      </details>

      <div className="grid gap-4">
        {articles.map((article) => (
          <article key={article.id} className="border border-black/10 bg-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black">{article.title}</h2>
                  <StatusBadge status={article.status} />
                </div>
                <p className="mt-2 text-xs text-black/45">
                  {article.category} · /{article.slug} · {article.publishedAt ? article.publishedAt.toLocaleDateString('zh-CN') : '尚未发布'}
                </p>
              </div>
              <span className="text-xs text-black/35">更新于 {article.updatedAt.toLocaleString('zh-CN', { hour12: false })}</span>
            </div>
            <details>
              <summary className="cursor-pointer border-t border-black/[0.07] px-5 py-3 text-xs font-black text-signal">编辑文章</summary>
              <form action={saveArticle} className="grid gap-4 border-t border-black/[0.07] bg-black/[0.018] p-5 md:grid-cols-2">
                <input type="hidden" name="id" value={article.id} />
                <Field label="URL 标识" name="slug" defaultValue={article.slug} required />
                <Field label="文章分类" name="category" defaultValue={article.category} required />
                <Field label="标题" name="title" defaultValue={article.title} required className="md:col-span-2" />
                <Field label="发布日期" name="publishedAt" type="date" defaultValue={article.publishedAt?.toISOString().slice(0, 10)} />
                <SelectField label="发布状态" name="status" defaultValue={article.status} options={publishOptions} />
                <Field label="封面图片路径（可选）" name="coverImage" defaultValue={article.coverImage} />
                <Field label="SEO 标题（可选）" name="seoTitle" defaultValue={article.seoTitle} />
                <TextareaField label="摘要" name="excerpt" defaultValue={article.excerpt} required className="md:col-span-2" />
                <TextareaField label="SEO 描述" name="seoDescription" defaultValue={article.seoDescription} className="md:col-span-2" />
                <TextareaField label="正文" name="content" defaultValue={article.content} rows={16} required className="md:col-span-2" />
                <div className="md:col-span-2"><SaveButton /></div>
              </form>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}
