// app/privacy/page.tsx - 隐私政策
'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, UserCheck } from 'lucide-react'
import Head from 'next/head'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>隐私政策 — 青海全媒体广告平台</title>
        <meta name="description" content="青海全媒体广告智能投放平台隐私政策，了解我们如何收集、使用和保护您的个人信息" />
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          返回
        </button>

        <motion.div {...fadeInUp}>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">隐私政策</h1>
              <p className="text-gray-500 mt-1">最后更新：2026年7月</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">一、信息收集</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>1.1 当您注册账号时，我们收集的信息包括：真实姓名、身份证号码、手机号码、联系邮箱等。</p>
                <p>1.2 当您使用平台服务时，我们可能收集：浏览记录、搜索记录、投放偏好等使用数据。</p>
                <p>1.3 我们通过Cookie等技术收集您的访问信息，用于优化服务体验。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">二、信息使用</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>2.1 收集的信息仅用于提供、维护和改进平台服务。</p>
                <p>2.2 我们使用您的个人信息进行实名认证，遵守广告法相关规定。</p>
                <p>2.3 我们使用AI分析您的投放需求，为您推荐最合适的广告资源。</p>
                <p>2.4 未经您的明确同意，我们不会将个人信息用于其他用途。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">三、信息保护</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>3.1 我们采用行业标准的安全技术保护您的个人信息，包括SSL加密传输、数据加密存储等。</p>
                <p>3.2 我们建立严格的内部数据管理制度，限制员工对用户信息的访问权限。</p>
                <p>3.3 尽管我们采取上述措施，但无法保证绝对安全，请您理解互联网存在的风险。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">四、信息共享</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>4.1 我们不会向第三方出售或出租您的个人信息。</p>
                <p>4.2 在以下情况下，我们可能共享您的信息：</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>经您明确同意</li>
                  <li>法律法规要求</li>
                  <li>为保护平台合法权益</li>
                  <li>与为您提供服务的合作伙伴共享（如供应商接单需要）</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">五、您的权利</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>5.1 您有权查询、更正您的个人信息。</p>
                <p>5.2 您有权要求删除您的个人信息（法律法规另有规定的除外）。</p>
                <p>5.3 您有权撤回对信息收集的同意，但撤回可能影响您正常使用平台服务。</p>
                <p>5.4 您可以通过客服渠道行使上述权利。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">六、Cookie政策</h2>
              <p className="text-gray-600 leading-relaxed">
                我们使用Cookie和类似技术来提升您的使用体验。您可以在浏览器设置中禁用Cookie，
                但这可能导致部分功能无法正常使用。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">七、政策更新</h2>
              <p className="text-gray-600 leading-relaxed">
                我们可能会不时更新本隐私政策。重大变更时，我们将在平台显著位置公示。
                继续使用本平台服务即表示您同意更新后的隐私政策。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">八、联系我们</h2>
              <p className="text-gray-600 leading-relaxed">
                如您对本隐私政策有任何疑问，或需要行使您的个人信息相关权利，请通过以下方式联系我们：
              </p>
              <div className="mt-4 bg-gray-50 rounded-2xl p-6 space-y-2 text-gray-600">
                <p>📞 客服电话：0971-8888888</p>
                <p>📧 电子邮箱：contact@qinghai-media.com</p>
                <p>📍 地址：青海省西宁市城西区</p>
                <p>🕐 工作时间：周一至周五 9:00-18:00</p>
              </div>
            </section>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-gray-400 text-sm text-center">
                青海全媒体科技有限公司 | 地址：青海省西宁市城西区 | 客服电话：0971-8888888
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
