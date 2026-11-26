import { CalendarCheck, ClipboardCheck, MonitorUp, Phone } from 'lucide-react'
import LeadForm from '@/components/LeadForm'
import { pageMetadata } from '@/lib/seo'
import { getSiteConfig } from '@/lib/site'

export async function generateMetadata() {
  return pageMetadata({
    path: '/quote',
    title: '国贸大厦与恒润大厦LED屏报价档期查询',
    description:
      '提交国贸大厦LED屏或恒润大厦LED屏投放需求，确认播放时长、频次、周期和当前档期后获取对应报价。',
  })
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ screen?: string }>
}) {
  const query = await searchParams
  const config = await getSiteConfig()
  const allowed = ['guomao', 'hengrun', 'both']
  const defaultScreen = allowed.includes(query.screen || '') ? query.screen : ''

  return (
    <>
      <section className="bg-[#101419] py-16 text-white lg:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <span className="eyebrow">PLAN & QUOTE</span>
            <h1 className="display-title mt-7">
              先确认档期，
              <br />
              <span className="text-signal">再获取准确报价。</span>
            </h1>
          </div>
          <div>
            <p className="text-[16px] leading-8 text-white/55">
              价格与播放频次、时长、周期和当前档期有关。请先提交需求，我们会按实际方案核算。
            </p>
            <a href={`tel:${config.phone}`} className="mono mt-6 inline-flex items-center gap-3 text-lg font-black">
              <Phone className="h-5 w-5 text-signal" />
              {config.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
          <div>
            <span className="eyebrow">WHAT WE NEED</span>
            <h2 className="section-title mt-6">四项信息，快速核价。</h2>
            <div className="mt-8 grid gap-6">
              {[
                [CalendarCheck, '计划时间', '预计开始投放的月份与周期'],
                [MonitorUp, '意向屏幕', '国贸单屏、恒润单屏或双屏联动'],
                [ClipboardCheck, '播放需求', '单次时长、频次和内容类型'],
                [Phone, '联系方式', '用于回复方案与报价的联系电话'],
              ].map(([Icon, title, text], index) => {
                const IconComponent = Icon as typeof CalendarCheck
                return (
                  <div key={title as string} className="grid grid-cols-[44px_1fr] gap-4 border-t border-black/10 pt-5">
                    <span className="grid h-10 w-10 place-items-center border border-black/15 text-signal">
                      <IconComponent className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-black">
                        0{index + 1}. {title as string}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-black/45">{text as string}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white p-6 shadow-lift sm:p-9">
            <LeadForm source="quote-page" defaultScreen={defaultScreen} />
          </div>
        </div>
      </section>
    </>
  )
}
