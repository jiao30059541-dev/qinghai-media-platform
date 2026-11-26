import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { saveScreen } from '../actions'
import {
  Field,
  SaveButton,
  SectionHeading,
  SelectField,
  StatusBadge,
  TextareaField,
} from '../_components/Fields'

export const dynamic = 'force-dynamic'

export default async function AdminScreensPage() {
  await requireAdminPage()
  const screens = await prisma.screen.findMany({
    include: { _count: { select: { pricingPlans: true, cases: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div>
      <SectionHeading
        eyebrow="MEDIA / SCREEN RESOURCES"
        title="屏幕资源"
        description="维护国贸大厦屏与恒润大厦屏的点位、规格、图片和对外说明。主屏与次屏始终分开命名、独立销售。"
      />

      <div className="grid gap-5">
        {screens.map((screen) => (
          <article key={screen.id} className="border border-black/10 bg-white">
            <div className="grid gap-4 border-b border-black/10 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black">{screen.name}</h2>
                  <StatusBadge status={screen.status} />
                </div>
                <p className="mt-2 text-xs text-black/45">
                  /{screen.slug} · {screen.area} · {screen.displaySize} · {screen._count.pricingPlans} 个价格档位
                </p>
              </div>
              <img src={screen.heroImage} alt="" className="h-16 w-28 object-cover" />
            </div>
            <form action={saveScreen} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
              <input type="hidden" name="id" value={screen.id} />
              <Field label="英文标识" name="slug" defaultValue={screen.slug} required />
              <Field label="屏幕名称" name="name" defaultValue={screen.name} required />
              <Field label="简称" name="shortName" defaultValue={screen.shortName} required />
              <Field label="角色定位" name="role" defaultValue={screen.role} required />
              <Field label="点位地址" name="location" defaultValue={screen.location} required className="md:col-span-2" />
              <Field label="显示面积" name="area" defaultValue={screen.area} required />
              <Field label="显示尺寸" name="displaySize" defaultValue={screen.displaySize} required />
              <Field label="物理分辨率" name="resolution" defaultValue={screen.resolution} required />
              <Field label="点间距" name="pixelPitch" defaultValue={screen.pixelPitch} required />
              <Field label="亮度" name="brightness" defaultValue={screen.brightness} placeholder="未确认可留空" />
              <Field label="播出时段" name="operatingHours" defaultValue={screen.operatingHours} />
              <Field label="每日频次" name="dailyPlays" defaultValue={screen.dailyPlays} />
              <Field label="排序" name="sortOrder" type="number" defaultValue={screen.sortOrder} />
              <SelectField
                label="发布状态"
                name="status"
                defaultValue={screen.status}
                options={[
                  { value: 'published', label: '已发布' },
                  { value: 'draft', label: '草稿' },
                  { value: 'archived', label: '已下线' },
                ]}
              />
              <TextareaField label="对外介绍" name="description" defaultValue={screen.description} required className="md:col-span-2 xl:col-span-4" />
              <TextareaField label="核心卖点（每行一条）" name="highlights" defaultValue={screen.highlights} rows={5} className="md:col-span-2" />
              <Field label="首屏图片路径" name="heroImage" defaultValue={screen.heroImage} required />
              <Field label="地图链接（可选）" name="mapUrl" defaultValue={screen.mapUrl} />
              <TextareaField label="图库图片（每行一个路径）" name="galleryImages" defaultValue={screen.galleryImages} rows={5} className="md:col-span-2 xl:col-span-4" />
              <div className="md:col-span-2 xl:col-span-4"><SaveButton /></div>
            </form>
          </article>
        ))}
      </div>
    </div>
  )
}
