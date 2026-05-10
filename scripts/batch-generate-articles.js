// scripts/batch-generate-articles.js - 批量生成30篇高质量投放研究文章
const https = require('https')
const http = require('http')

const BASE_URL = 'https://www.xnmytx.com'

function fetchApi(path, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
      rejectUnauthorized: false
    }
    const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { resolve({ success: false, message: 'Parse error' }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

// 30 个选题，每个分类 10 个
const articles = {
  industry: [
    { keyword: '青海广告投放策略', title: '青海广告投放策略全解析：从预算分配到媒体选择' },
    { keyword: '青海户外广告市场分析', title: '2026年青海户外广告市场深度分析报告' },
    { keyword: '青海广告预算分配方案', title: '青海广告主必看：不同预算规模的投放分配方案' },
    { keyword: '青海本地品牌推广', title: '青海本地品牌如何通过广告投放实现市场突破' },
    { keyword: '青海广告效果评估', title: '青海广告投放效果评估指南：关键指标与优化方法' },
    { keyword: '青海数字广告趋势', title: '青海数字广告发展趋势：线上线下融合的投放策略' },
    { keyword: '青海广告投放ROI', title: '青海广告投放ROI提升指南：让每一分钱都花在刀刃上' },
    { keyword: '青海广告行业报告', title: '青海广告行业2026年度发展报告：机遇与挑战' },
    { keyword: '青海广告合规指南', title: '青海广告投放合规指南：广告法要点与本地实践' },
    { keyword: '青海广告资源整合', title: '青海全媒体广告资源整合策略：实现1+1>2的投放效果' },
  ],
  local: [
    { keyword: '西宁户外大屏广告报价', title: '西宁户外LED大屏广告价格全览：从商圈到交通枢纽' },
    { keyword: '西宁电梯广告投放指南', title: '西宁电梯广告投放指南：覆盖高端社区的核心方法' },
    { keyword: '西宁公交广告价格', title: '西宁公交车身广告价格与投放效果深度评测' },
    { keyword: '海东广告资源推荐', title: '海东广告资源全解析：工业园区与商业区的投放选择' },
    { keyword: '格尔木广告投放渠道', title: '格尔木广告投放指南：能源城市的精准触达策略' },
    { keyword: '德令哈广告市场', title: '德令哈广告市场分析：旅游城市的媒体投放机遇' },
    { keyword: '青海高速公路广告', title: '青海高速公路广告牌价格与投放价值评估' },
    { keyword: '西宁社区广告投放', title: '西宁社区广告投放策略：道闸、灯箱、电梯全覆盖' },
    { keyword: '西宁商圈LED屏', title: '西宁商圈LED大屏广告投放效果实测报告' },
    { keyword: '青海五线城市广告', title: '青海县域广告市场开拓指南：海西、海南、黄南投放建议' },
  ],
  case: [
    { keyword: '西宁旅游景区广告案例', title: '西宁旅游景区广告投放案例：旺季获客增长60%' },
    { keyword: '青海酒店广告投放案例', title: '青海连锁酒店广告投放案例：入住率提升25%的秘诀' },
    { keyword: '西宁餐饮广告案例', title: '西宁餐饮品牌广告投放案例：从认知到到店的完整闭环' },
    { keyword: '青海房地产广告案例', title: '西宁房地产项目广告投放案例：精准获客300组的实战分享' },
    { keyword: '青海教育机构广告案例', title: '青海教育培训机构广告投放案例：招生成本降低40%' },
    { keyword: '青海汽车广告投放案例', title: '格尔木汽车4S店广告投放案例：到店量翻倍的经验' },
    { keyword: '青海本地生活广告案例', title: '海东本地生活服务平台广告案例：社区渗透的运营策略' },
    { keyword: '青海旅游广告投放案例', title: '德令哈旅游广告投放案例：星空之城品牌打造实战' },
    { keyword: '青海医疗广告案例', title: '西宁医美机构广告投放案例：合规前提下的精准获客' },
    { keyword: '青海零售广告投放案例', title: '青海连锁零售品牌广告投放案例：全渠道整合营销实战' },
  ]
}

const total = Object.values(articles).flat().length
console.log(`Total articles to generate: ${total}`)
console.log('')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  let success = 0
  let fail = 0

  const types = ['industry', 'local', 'case']

  for (const type of types) {
    const list = articles[type]
    console.log(`\n========== Generating ${type} articles (${list.length}) ==========`)

    for (let i = 0; i < list.length; i++) {
      const article = list[i]
      process.stdout.write(`  [${type} ${i + 1}/${list.length}] "${article.keyword}"... `)

      try {
        const result = await fetchApi('/api/ai/generate', 'POST', {
          content_type: type,
          keyword: article.keyword,
          title: article.title,
        })

        if (result.success) {
          const taskId = result.data?.task_id || '?'
          const tokens = result.data?.usage?.total_tokens || result.data?.token_used || '?'
          console.log(`✅ (id=${taskId}, tokens=${tokens})`)
          success++
        } else {
          console.log(`❌ ${result.message || '生成失败'}`)
          fail++
        }
      } catch (e) {
        console.log(`❌ ${e.message}`)
        fail++
      }

      // 间隔 2 秒避免限流
      await sleep(2000)
    }
  }

  console.log(`\n========== Done ==========`)
  console.log(`Total: ${total}, Success: ${success}, Failed: ${fail}`)

  // 如果全部成功，自动发布
  if (fail === 0) {
    console.log('\nAll generated, publishing...')
    const mysql = require('mysql2/promise')
    const fs = require('fs')
    const pw = fs.readFileSync('/opt/qinghai-media-platform/.env.local','utf-8').match(/DB_PASSWORD=(\S+)/)?.[1] || ''
    
    try {
      const conn = await mysql.createConnection({
        host: 'localhost', port: 3307, user: 'ai_ads_user',
        password: pw, database: 'ai_ads'
      })
      const [result] = await conn.execute(
        "UPDATE ai_content_tasks SET status = 'published', published_at = NOW() WHERE status = 'draft'"
      )
      console.log(`Published ${result.affectedRows} articles`)
      await conn.end()
    } catch (e) {
      console.log('Auto-publish failed:', e.message)
    }
  }
}

main().catch(e => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
