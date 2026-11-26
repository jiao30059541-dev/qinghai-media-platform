import { pageMetadata } from '@/lib/seo'
import { getSiteConfig, site } from '@/lib/site'

export async function generateMetadata() {
  return pageMetadata({
    path: '/privacy',
    title: '隐私政策',
    description: '名扬天下传媒官网隐私政策，说明咨询表单信息的用途与保护方式。',
  })
}

export default async function PrivacyPage() {
  const config = await getSiteConfig()
  return (
    <section className="container-site max-w-[900px] py-16 lg:py-24">
      <span className="eyebrow">PRIVACY POLICY</span>
      <h1 className="section-title mt-6">隐私政策</h1>
      <div className="prose-site mt-10">
        <p>
          西宁名扬天下文化传媒有限公司尊重你的个人信息。本政策说明我们在官网咨询过程中收集的信息及使用方式。
        </p>
        <h2>我们收集的信息</h2>
        <p>
          当你提交投放咨询时，我们可能收集姓名、手机号码、公司名称、意向屏幕、计划时间和需求说明。这些信息仅用于本次业务沟通。
        </p>
        <h2>信息使用</h2>
        <p>
          我们使用这些信息回复咨询、准备投放建议、核对档期并提供报价。未经你的同意，我们不会将信息出售或用于无关营销。
        </p>
        <h2>信息保护</h2>
        <p>
          咨询数据保存在业务后台，仅授权工作人员可以访问。我们会采取合理措施防止未经授权的访问、修改或泄露。
        </p>
        <h2>联系我们</h2>
        <p>
          如需查询、更正或删除已提交的信息，请致电 {config.phone}，或联系 {config.name}。
        </p>
      </div>
    </section>
  )
}
