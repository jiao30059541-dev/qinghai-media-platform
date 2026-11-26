import { pageMetadata } from '@/lib/seo'

export async function generateMetadata() {
  return pageMetadata({
    path: '/terms',
    title: '网站使用条款',
    description: '名扬天下传媒官网使用条款，说明网站内容、报价信息与知识产权使用规则。',
  })
}

export default function TermsPage() {
  return (
    <section className="container-site max-w-[900px] py-16 lg:py-24">
      <span className="eyebrow">TERMS OF USE</span>
      <h1 className="section-title mt-6">网站使用条款</h1>
      <div className="prose-site mt-10">
        <p>
          使用本网站即表示你理解并同意以下条款。网站内容用于介绍西宁名扬天下文化传媒有限公司的媒体资源与服务。
        </p>
        <h2>信息与报价</h2>
        <p>
          网站中的屏幕参数、档位和服务说明以当期确认信息为准。价格、播放频次和可用档期可能随时间调整，正式执行以双方确认的报价单或合同为准。
        </p>
        <h2>内容与知识产权</h2>
        <p>
          网站中的文字、版面、图片和内容样片受相关权利保护。未经书面许可，不得复制、改编或用于其他商业用途。
        </p>
        <h2>第三方内容</h2>
        <p>
          客户名称、Logo、案例和第三方内容仅在获得相应授权后展示。任何未标注授权的图片均不得被视为可自由商用素材。
        </p>
        <h2>责任边界</h2>
        <p>
          户外媒体提供传播场景，不对客户最终销售转化作出保证。因素材版权、内容审核或不可抗力导致的执行调整，按实际合同约定处理。
        </p>
      </div>
    </section>
  )
}
