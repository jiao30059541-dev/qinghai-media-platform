import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="container-site flex min-h-[65vh] flex-col items-start justify-center py-20">
      <span className="eyebrow">404 / NOT FOUND</span>
      <h1 className="mt-6 text-5xl font-black">这一页不在城市画面里。</h1>
      <p className="mt-5 text-black/50">页面可能已经迁移，或者地址输入有误。</p>
      <Link href="/" className="btn-primary mt-8">
        返回首页
      </Link>
    </section>
  )
}
