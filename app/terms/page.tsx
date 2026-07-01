// app/terms/page.tsx - 用户协议
'use client'

import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import Link from 'next/link'
import Head from 'next/head'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Head>
        <title>用户协议 — 青海全媒体广告平台</title>
        <meta name="description" content="青海全媒体广告智能投放平台用户服务协议，使用平台服务前请仔细阅读" />
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
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">用户协议</h1>
              <p className="text-gray-500 mt-1">最后更新：2026年7月</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 md:p-12 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">一、总则</h2>
              <p className="text-gray-600 leading-relaxed">
                欢迎使用青海全媒体广告智能投放平台（以下简称"本平台"）。本平台由西宁名扬天下文化传媒有限公司运营。
                用户（以下简称"您"）在使用本平台服务前，请仔细阅读并充分理解本协议的全部内容。
                您注册、登录、使用本平台服务，即表示您已阅读、理解并接受本协议的全部条款。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">二、用户注册与账号管理</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>2.1 您在注册时应提供真实、准确、完整的个人信息，包括但不限于真实姓名、身份证号码、联系方式等。</p>
                <p>2.2 根据《中华人民共和国广告法》及相关法律法规要求，发布广告需提供真实身份信息进行实名认证。</p>
                <p>2.3 您的账号仅限本人使用，不得出借、转让或授权他人使用。因账号保管不善导致的损失由您自行承担。</p>
                <p>2.4 您应妥善保管账号密码，如发现账号被盗用，请立即通知本平台。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">三、服务内容</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>3.1 本平台提供广告资源展示、查询、组合、预订等中介服务。</p>
                <p>3.2 本平台提供AI智能投放方案生成、数据分析等增值服务。</p>
                <p>3.3 本平台协助广告主与供应商建立联系，但不参与广告内容的创作与发布。</p>
                <p>3.4 本平台展示的广告资源信息由供应商提供，平台不对信息的准确性承担保证责任，但会尽最大努力审核。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">四、用户行为规范</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>4.1 您承诺发布的广告内容合法合规，不违反《中华人民共和国广告法》及相关法律法规。</p>
                <p>4.2 您不得利用本平台从事任何违法违规活动，包括但不限于发布虚假广告、侵犯他人知识产权等。</p>
                <p>4.3 您不得干扰本平台的正常运营，不得以任何方式攻击、入侵本平台系统。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">五、知识产权</h2>
              <p className="text-gray-600 leading-relaxed">
                本平台所有的软件、技术、设计、文字、图标、图片、音频、视频等内容的
                知识产权归西宁名扬天下文化传媒有限公司所有，未经书面许可，任何单位或个人不得擅自使用、复制、修改、传播。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">六、免责声明</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>6.1 本平台提供的服务按"现状"提供，平台不承担任何明示或暗示的保证责任。</p>
                <p>6.2 因不可抗力因素（包括但不限于自然灾害、战争、政府行为、系统故障等）导致的服务中断，平台不承担责任。</p>
                <p>6.3 您与供应商之间的交易纠纷，平台将尽力协助调解，但不承担任何法律责任。</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">七、协议变更与终止</h2>
              <p className="text-gray-600 leading-relaxed">
                本平台有权根据法律法规变化或业务需要修改本协议条款，修改后的协议将在平台公示。
                如您不同意修改后的协议，应停止使用本平台服务。继续使用视为接受修改后的协议。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">八、法律适用与争议解决</h2>
              <p className="text-gray-600 leading-relaxed">
                本协议的订立、执行、解释及争议解决均适用中华人民共和国法律。
                因本协议引起的或与本协议有关的任何争议，双方应友好协商解决；协商不成的，
                提交青海省西宁市有管辖权的人民法院诉讼解决。
              </p>
            </section>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-gray-400 text-sm text-center">
                西宁名扬天下文化传媒有限公司 | 地址：青海省西宁市城西区 | 客服电话：0971-8888888
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
