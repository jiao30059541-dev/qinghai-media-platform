// scripts/ai-cron-runner.js - AI定时任务执行器
// PM2 或系统 cron 调用的入口
// 用法: node scripts/ai-cron-runner.js daily|hot-topics|lead-scoring

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
        catch { resolve({ success: false, message: 'Parse error', raw: data }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function main() {
  const args = process.argv.slice(2)
  const task = args[0] || 'daily'

  console.log(`[AI Cron] Starting: ${task} at ${new Date().toISOString()}`)

  switch (task) {
    case 'daily': {
      const settings = await fetchApi('/api/ai/settings')
      if (!settings.success) { console.error('Failed get settings'); return }

      const s = settings.data || {}
      const dailyCount = parseInt(s.daily_content_count || '3')
      const ratioIndustry = parseInt(s.content_ratio_industry || '50')
      const ratioLocal = parseInt(s.content_ratio_local || '30')
      const autoPublish = s.auto_publish === 'true'

      const countIndustry = Math.round(dailyCount * ratioIndustry / 100)
      const countLocal = Math.round(dailyCount * ratioLocal / 100)
      const countCase = dailyCount - countIndustry - countLocal

      console.log(`Plan: ${dailyCount} articles (ind=${countIndustry}, loc=${countLocal}, case=${countCase})`)

      const kwRes = await fetchApi('/api/ai/keywords?status=active&limit=100')
      const keywords = kwRes.data || []

      const types = [
        ...Array(countIndustry).fill('industry'),
        ...Array(countLocal).fill('local'),
        ...Array(countCase).fill('case'),
      ]

      for (let i = 0; i < types.length; i++) {
        const kw = keywords[i % Math.max(keywords.length, 1)]
        const result = await fetchApi('/api/ai/generate', 'POST', {
          content_type: types[i],
          keyword: kw?.keyword || '青海广告投放'
        })
        console.log(`  [${i+1}/${types.length}] ${types[i]}: ${result.success ? 'OK' : 'FAIL'}`)
        // 间隔1秒避免API限流
        if (i < types.length - 1) await new Promise(r => setTimeout(r, 1000))
      }
      break
    }

    case 'hot-topics': {
      const now = new Date()
      const month = now.getMonth() + 1
      const topics = []

      // 季节性内容
      if ([3,4,5].includes(month)) {
        topics.push({ keyword: '春季广告投放', type: 'industry', heat: 70 })
        topics.push({ keyword: '青海旅游旺季广告', type: 'local', heat: 80 })
      } else if ([6,7,8].includes(month)) {
        topics.push({ keyword: '暑期旅游广告投放', type: 'industry', heat: 85 })
        topics.push({ keyword: '青海夏季景区广告', type: 'local', heat: 90 })
      } else if ([9,10,11].includes(month)) {
        topics.push({ keyword: '秋季营销广告策略', type: 'industry', heat: 75 })
        topics.push({ keyword: '双十一广告投放', type: 'case', heat: 80 })
      } else {
        topics.push({ keyword: '春节广告投放策略', type: 'industry', heat: 90 })
        topics.push({ keyword: '冬季青海户外广告', type: 'local', heat: 75 })
      }

      for (const t of topics) {
        const result = await fetchApi('/api/ai/generate', 'POST', {
          content_type: t.type,
          keyword: t.keyword,
          title: `${now.getFullYear()}年${t.keyword}趋势分析`
        })
        console.log(`  Topic ${t.keyword}: ${result.success ? 'OK' : 'FAIL'}`)
        await new Promise(r => setTimeout(r, 1000))
      }
      break
    }

    default:
      console.log(`Unknown task: ${task}`)
  }

  console.log(`[AI Cron] Done: ${task} at ${new Date().toISOString()}`)
}

main().catch(e => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
