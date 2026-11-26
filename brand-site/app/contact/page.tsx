import { MapPin, Phone, Send } from 'lucide-react'
import BaiduMap from '@/components/BaiduMap'
import LeadForm from '@/components/LeadForm'
import WechatCard from '@/components/WechatCard'
import { pageMetadata } from '@/lib/seo'
import { getSetting } from '@/lib/settings'
import { getSiteConfig, site } from '@/lib/site'

export async function generateMetadata() {
  return pageMetadata({
    path: '/contact',
    title: '联系名扬天下传媒｜西宁户外LED大屏广告',
    description: `联系西宁名扬天下文化传媒有限公司，咨询国贸大厦LED屏与恒润大厦LED屏投放。电话 ${site.phone}。`,
  })
}

export default async function ContactPage() {
  const wechatQr = await getSetting('wechat_qr')
  const config = await getSiteConfig()

  return (
    <>
      <section className="py-16 lg:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[.88fr_1.12fr]">
          <div>
            <span className="eyebrow">CONTACT / XINING</span>
            <h1 className="display-title mt-7">
              告诉我们，
              <br />
              <span className="text-signal">你想让谁看见。</span>
            </h1>
            <p className="body-copy mt-7 max-w-[580px]">
              咨询屏幕参数、投放档期和画面制作，请电话联系，或提交需求让我们回电。
            </p>
            <div className="mt-10 grid gap-5 border-t border-black/10 pt-7">
              <a href={`tel:${config.phone}`} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center bg-signal text-white">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-xs text-black/40">电话咨询</span>
                  <strong className="mono mt-1 block text-xl font-black">{config.phoneDisplay}</strong>
                </div>
              </a>
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center border border-black/15 text-signal">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-xs text-black/40">公司地址</span>
                  <strong className="mt-1 block text-sm leading-7">{config.address}</strong>
                </div>
              </div>
            </div>
            {wechatQr && (
              <div className="mt-5 max-w-[440px]">
                <WechatCard qr={wechatQr} />
              </div>
            )}
          </div>
          <div className="bg-white p-6 shadow-lift sm:p-9">
            <div className="mb-7 flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center bg-ink text-white">
                <Send className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black">提交联系需求</h2>
                <p className="mt-1 text-xs text-black/40">我们通常在 1 个工作日内回复</p>
              </div>
            </div>
            <LeadForm source="contact-page" />
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-white py-14 lg:py-20">
        <div className="container-site">
          <span className="eyebrow">LOCATIONS / BAIDU MAP</span>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <BaiduMap title="国贸大厦 LED 屏" address="西宁市海晏路2号国贸大厦" />
            <BaiduMap title="恒润大厦 LED 屏" address="西宁市湟光十字东北角恒润大厦" />
          </div>
        </div>
      </section>
    </>
  )
}
