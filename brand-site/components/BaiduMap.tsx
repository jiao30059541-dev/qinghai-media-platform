import { ExternalLink, MapPin } from 'lucide-react'

export default function BaiduMap({
  address,
  title,
  className = '',
}: {
  address: string
  title: string
  className?: string
}) {
  const encoded = encodeURIComponent(address)
  const mapSrc = `https://api.map.baidu.com/geocoder?address=${encoded}&output=html&src=xnmytx&coordtype=bd09ll`

  return (
    <div className={`overflow-hidden border border-black/10 bg-white ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-black/10 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-black">
          <MapPin className="h-4 w-4 text-signal" />
          {title}
        </span>
        <a
          href={`https://map.baidu.com/search/${encoded}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs font-bold text-black/45 hover:text-signal"
        >
          百度地图
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <iframe
        title={`${title}百度地图`}
        src={mapSrc}
        className="h-[300px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
