import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">西宁名扬天下文化传媒有限公司</h3>
            <p className="text-gray-400">
              AI驱动的智能广告投放平台，覆盖青海全域户外广告资源
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">资源分类</h4>
            <ul className="space-y-2 text-gray-400">
              <li>户外广告</li>
              <li>社区广告</li>
              <li>商业广告</li>
              <li>数字广告</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">服务支持</h4>
            <ul className="space-y-2 text-gray-400">
              <li>AI投放方案</li>
              <li>价格咨询</li>
              <li>资源预订</li>
              <li>售后服务</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2 text-gray-400">
              <li>电话: 13997187771</li>
              <li>邮箱: contact@qinghai-media.com</li>
              <li>地址: 青海省西宁市城西区国贸大厦5楼</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          <div className="flex justify-center gap-6 mb-4">
            <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
            <Link href="/terms" className="hover:text-white transition-colors">用户协议</Link>
            <Link href="/about" className="hover:text-white transition-colors">关于我们</Link>
            <Link href="/articles" className="hover:text-white transition-colors">投放研究</Link>
          </div>
          <p>(C) 2026 青海全媒体广告智能投放平台 | 备案号: 青ICP备2024002834号</p>
          <p className="mt-2">本平台所有广告资源信息均由供应商提供，价格仅供参考</p>
        </div>
      </div>
    </footer>
  )
}
