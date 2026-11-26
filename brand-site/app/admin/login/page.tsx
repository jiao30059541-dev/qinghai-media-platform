import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: '后台登录',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return <LoginPageContent searchParams={searchParams} />
}

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const query = await searchParams
  const nextPath =
    query.next?.startsWith('/admin') && query.next !== '/admin/login'
      ? query.next
      : '/admin'

  return (
    <main className="grid min-h-screen bg-[#0b0e12] text-white lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(229,54,44,.28),transparent_34%),linear-gradient(145deg,#0b0e12_20%,#171c23_100%)]" />
        <div className="relative">
          <span className="mono text-[10px] font-bold tracking-[0.16em] text-signal">
            XNMytx / CONTENT OPERATIONS
          </span>
          <h1 className="mt-8 max-w-[620px] text-[clamp(46px,5.4vw,86px)] font-black leading-[1.04]">
            管理内容，
            <br />
            掌握每一次
            <br />
            <span className="text-signal">城市曝光。</span>
          </h1>
        </div>
        <div className="relative grid max-w-[560px] grid-cols-3 border-t border-white/15 pt-6 text-xs text-white/45">
          <span>屏幕资源</span>
          <span>案例与文章</span>
          <span>询盘与档期</span>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid h-11 w-11 grid-cols-2 gap-1 border border-signal p-1">
              <i className="row-span-2 bg-signal" />
              <i className="bg-white" />
              <i className="border border-signal" />
            </span>
            <div>
              <strong className="block text-lg">名扬天下传媒</strong>
              <small className="mono block text-[8px] tracking-[0.15em] text-white/40">
                ADMIN CONSOLE
              </small>
            </div>
          </div>
          <h2 className="text-3xl font-black">登录内容后台</h2>
          <p className="mt-3 text-sm leading-7 text-white/45">
            管理屏幕、价格、案例、文章、档期和客户咨询。
          </p>
          <LoginForm nextPath={nextPath} />
        </div>
      </section>
    </main>
  )
}
