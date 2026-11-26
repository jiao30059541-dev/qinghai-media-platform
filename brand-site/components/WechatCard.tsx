import Image from 'next/image'
import { MessageCircle } from 'lucide-react'

export default function WechatCard({ qr }: { qr?: string }) {
  if (!qr) return null

  return (
    <div className="flex items-center gap-4 border border-black/10 bg-white p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-paper">
        <Image src={qr} alt="名扬天下传媒微信二维码" fill sizes="96px" className="object-contain" />
      </div>
      <div>
        <strong className="flex items-center gap-2 text-sm">
          <MessageCircle className="h-4 w-4 text-signal" />
          微信咨询
        </strong>
        <p className="mt-2 text-xs leading-6 text-black/45">扫码添加，发送投放需求与屏幕名称。</p>
      </div>
    </div>
  )
}
