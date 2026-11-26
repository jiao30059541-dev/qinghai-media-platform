import { prisma } from '@/lib/prisma'
import { requireAdminPage } from '@/lib/admin-page'
import { saveSetting } from '../actions'
import { Field, SaveButton, SectionHeading, TextareaField } from '../_components/Fields'
import ImageUploadField from './ImageUploadField'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  await requireAdminPage()
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } })
  const values = Object.fromEntries(settings.map((item) => [item.key, item.value]))

  return (
    <div>
      <SectionHeading
        eyebrow="SYSTEM / SETTINGS"
        title="基础设置"
        description="配置百度统计、微信二维码和报价提示。统计 ID 或二维码为空时，前台不会显示空位。"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="border border-black/10 bg-white p-5">
          <h2 className="text-lg font-black">运营主体与联系方式</h2>
          <p className="mt-1 text-xs text-black/40">修改后同步到结构化数据与联系区域。</p>
          <div className="mt-5 grid gap-5">
            {[
              ['company_name', '公司全称'],
              ['service_phone', '招商电话'],
              ['company_address', '公司地址'],
            ].map(([key, label]) => (
              <form key={key} action={saveSetting} className="grid gap-3">
                <input type="hidden" name="key" value={key} />
                <Field label={label} name="value" defaultValue={values[key] || ''} />
                <div><SaveButton /></div>
              </form>
            ))}
            <form action={saveSetting} className="grid gap-3">
              <input type="hidden" name="key" value="quote_notice" />
              <TextareaField label="报价提示" name="value" defaultValue={values.quote_notice || ''} />
              <div><SaveButton /></div>
            </form>
          </div>
        </section>

        <section className="border border-black/10 bg-white p-5">
          <h2 className="text-lg font-black">统计与联系工具</h2>
          <p className="mt-1 text-xs text-black/40">填写真实 ID 后生效，不填写时不会加载第三方脚本。</p>
          <div className="mt-5 grid gap-6">
            <form action={saveSetting} className="grid gap-3">
              <input type="hidden" name="key" value="baidu_analytics_id" />
              <Field label="百度统计 ID" name="value" defaultValue={values.baidu_analytics_id || ''} placeholder="在百度统计后台获取" />
              <div><SaveButton /></div>
            </form>
            <form action={saveSetting} className="grid gap-3">
              <input type="hidden" name="key" value="wechat_qr" />
              <ImageUploadField name="value" label="微信咨询二维码" defaultValue={values.wechat_qr || ''} />
              <div><SaveButton /></div>
            </form>
            <form action={saveSetting} className="grid gap-3">
              <input type="hidden" name="key" value="meiqia_embed_id" />
              <Field label="美洽/在线客服 ID（可选）" name="value" defaultValue={values.meiqia_embed_id || ''} />
              <div><SaveButton /></div>
            </form>
          </div>
        </section>
      </div>

      <section className="mt-6 border border-black/10 bg-white">
        <div className="border-b border-black/10 p-5">
          <h2 className="text-lg font-black">其他配置项</h2>
          <p className="mt-1 text-xs text-black/40">用于后续接入地图、通知或第三方脚本。</p>
        </div>
        <div className="divide-y divide-black/[0.07]">
          {settings
            .filter((item) => !['company_name', 'service_phone', 'company_address', 'quote_notice', 'baidu_analytics_id', 'wechat_qr', 'meiqia_embed_id'].includes(item.key))
            .map((item) => (
              <form key={item.id} action={saveSetting} className="grid gap-3 p-5 md:grid-cols-[240px_1fr_auto] md:items-end">
                <input type="hidden" name="key" value={item.key} />
                <div>
                  <span className="mono text-[10px] font-bold text-black/35">{item.key}</span>
                </div>
                <Field label="配置值" name="value" defaultValue={item.value} />
                <SaveButton />
              </form>
            ))}
        </div>
      </section>
    </div>
  )
}
