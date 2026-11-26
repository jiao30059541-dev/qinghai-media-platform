import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { saveCaseStudy } from '../actions'
import {
  CheckField,
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

const mediaOptions = [
  { value: '', label: '不绑定 / 双屏项目' },
  { value: 'guomao', label: '国贸大厦 LED 屏' },
  { value: 'hengrun', label: '恒润大厦 LED 屏' },
]

export default async function AdminCasesPage() {
  await requireAdminPage()
  const cases = await prisma.caseStudy.findMany({
    include: { screen: true },
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
  })

  return (
    <div>
      <SectionHeading
        eyebrow="CONTENT / CASES & CREATIVE"
        title="案例内容"
        description="发布自有创意样片，或在取得客户与素材授权后发布正式案例。不要用未授权 Logo、客户名称或效果数据。"
      />

      <details className="mb-7 border border-black/10 bg-white">
        <summary className="cursor-pointer px-5 py-4 text-sm font-black">新增案例或内容样片</summary>
        <form action={saveCaseStudy} className="grid gap-4 border-t border-black/10 p-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="URL 标识" name="slug" placeholder="例如 city-campaign" required />
          <Field label="标题" name="title" required />
          <Field label="分类" name="category" placeholder="创意样片 / 品牌项目" required />
          <Field label="客户名称（获授权后填写）" name="client" />
          <Field label="封面图片路径" name="coverImage" defaultValue="/images/guomao-night-crossing.jpg" required />
          <SelectField label="绑定屏幕" name="mediaSlug" options={mediaOptions} />
          <Field label="发布日期" name="publishedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          <Field label="排序" name="sortOrder" type="number" defaultValue={cases.length + 1} />
          <SelectField label="发布状态" name="status" defaultValue="draft" options={publishOptions} />
          <div className="flex items-end pb-2"><CheckField label="首页推荐" name="featured" /></div>
          <TextareaField label="内容摘要" name="summary" required className="md:col-span-2" />
          <TextareaField label="传播问题" name="challenge" required />
          <TextareaField label="画面方法" name="solution" required />
          <TextareaField label="执行结果" name="result" required className="md:col-span-2" />
          <div className="md:col-span-2 xl:col-span-4"><SaveButton label="新增内容" /></div>
        </form>
      </details>

      <div className="grid gap-4">
        {cases.map((item) => (
          <article key={item.id} className="border border-black/10 bg-white">
            <div className="grid gap-4 p-5 sm:grid-cols-[120px_1fr_auto] sm:items-center">
              <img src={item.coverImage} alt="" className="aspect-[16/10] w-full object-cover sm:w-[120px]" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-black">{item.title}</h2>
                  <StatusBadge status={item.status} />
                  {item.featured && <span className="bg-signal/10 px-2 py-1 text-[10px] font-bold text-signal">首页推荐</span>}
                </div>
                <p className="mt-2 text-xs text-black/45">
                  {item.category} · {item.screen?.name || '双屏'} · {new Date(item.publishedAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <span className="font-mono text-xs text-black/35">/{item.slug}</span>
            </div>
            <details>
              <summary className="cursor-pointer border-t border-black/[0.07] px-5 py-3 text-xs font-black text-signal">编辑内容</summary>
              <form action={saveCaseStudy} className="grid gap-4 border-t border-black/[0.07] bg-black/[0.018] p-5 md:grid-cols-2 xl:grid-cols-4">
                <input type="hidden" name="id" value={item.id} />
                <Field label="URL 标识" name="slug" defaultValue={item.slug} required />
                <Field label="标题" name="title" defaultValue={item.title} required />
                <Field label="分类" name="category" defaultValue={item.category} required />
                <Field label="客户名称" name="client" defaultValue={item.client} />
                <Field label="封面图片路径" name="coverImage" defaultValue={item.coverImage} required />
                <SelectField label="绑定屏幕" name="mediaSlug" defaultValue={item.mediaSlug || ''} options={mediaOptions} />
                <Field label="发布日期" name="publishedAt" type="date" defaultValue={item.publishedAt.toISOString().slice(0, 10)} />
                <Field label="排序" name="sortOrder" type="number" defaultValue={item.sortOrder} />
                <SelectField label="发布状态" name="status" defaultValue={item.status} options={publishOptions} />
                <div className="flex items-end pb-2"><CheckField label="首页推荐" name="featured" defaultChecked={item.featured} /></div>
                <TextareaField label="内容摘要" name="summary" defaultValue={item.summary} required className="md:col-span-2" />
                <TextareaField label="传播问题" name="challenge" defaultValue={item.challenge} required />
                <TextareaField label="画面方法" name="solution" defaultValue={item.solution} required />
                <TextareaField label="执行结果" name="result" defaultValue={item.result} required className="md:col-span-2" />
                <div className="md:col-span-2 xl:col-span-4"><SaveButton /></div>
              </form>
            </details>
          </article>
        ))}
      </div>
    </div>
  )
}
