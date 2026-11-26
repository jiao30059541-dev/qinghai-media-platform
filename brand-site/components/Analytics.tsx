import Script from 'next/script'

export default function Analytics({ baiduId }: { baiduId?: string }) {
  if (!baiduId) return null

  return (
    <>
      <Script id="baidu-analytics" strategy="afterInteractive">
        {`
          var _hmt = _hmt || [];
          (function() {
            var hm = document.createElement("script");
            hm.src = "https://hm.baidu.com/hm.js?${baiduId}";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(hm, s);
          })();
        `}
      </Script>
      <Script id="baidu-analytics-config" strategy="afterInteractive">
        {`
          window._hmt = window._hmt || [];
        `}
      </Script>
    </>
  )
}
