import { getSettings } from '@/lib/settings'

export type SiteConfig = {
  name: string
  shortName: string
  siteName: string
  url: string
  phone: string
  phoneDisplay: string
  address: string
  icp: string
  defaultTitle: string
  defaultDescription: string
}

function formatPhone(phone: string) {
  if (phone.length === 11) return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`
  return phone
}

export const site: SiteConfig = {
  name: '西宁名扬天下文化传媒有限公司',
  shortName: '名扬天下',
  siteName: '名扬天下传媒',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xnmytx.com',
  phone: process.env.NEXT_PUBLIC_PHONE || '13997187771',
  phoneDisplay: '139 9718 7771',
  address: '青海省西宁市海晏路2号国贸大厦',
  icp: '青ICP备2024002834号',
  defaultTitle: '西宁户外LED大屏广告｜国贸大厦屏与恒润大厦屏｜名扬天下传媒',
  defaultDescription:
    '西宁名扬天下文化传媒有限公司运营国贸大厦LED屏与恒润大厦LED屏，提供点位咨询、档期确认、画面制作与上屏执行服务。',
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const settings = await getSettings(['company_name', 'service_phone', 'company_address'])
  const phone = settings.service_phone?.trim() || site.phone
  return {
    ...site,
    name: settings.company_name?.trim() || site.name,
    phone,
    phoneDisplay: formatPhone(phone),
    address: settings.company_address?.trim() || site.address,
  }
}

export const navItems = [
  { label: '屏幕资源', href: '/screens' },
  { label: '国贸大厦屏', href: '/screens/guomao' },
  { label: '恒润大厦屏', href: '/screens/hengrun' },
  { label: '案例与内容', href: '/cases' },
  { label: '投放知识', href: '/insights' },
  { label: '档期查询', href: '/availability' },
  { label: '关于我们', href: '/about' },
  { label: '报价档期', href: '/quote' },
] as const

export function absoluteUrl(path = '/') {
  return new URL(path, site.url).toString()
}

export function formatPhoneHref(config: SiteConfig = site) {
  return `tel:${config.phone}`
}
