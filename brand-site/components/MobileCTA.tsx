import { MessageCircle, Phone } from 'lucide-react'
import type { SiteConfig } from '@/lib/site'

export default function MobileCTA({ config }: { config: SiteConfig }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-black/10 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,.1)] backdrop-blur-xl md:hidden">
      <a
        href={`tel:${config.phone}`}
        className="flex min-h-14 items-center justify-center gap-2 text-sm font-black"
      >
        <Phone className="h-4 w-4 text-signal" />
        电话咨询
      </a>
      <a
        href={`sms:${config.phone}`}
        className="flex min-h-14 items-center justify-center gap-2 bg-signal text-sm font-black text-white"
      >
        <MessageCircle className="h-4 w-4" />
        发送需求
      </a>
    </div>
  )
}
