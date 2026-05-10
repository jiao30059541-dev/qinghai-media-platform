// scripts/ai-cron-jobs.ts - AI自动运营系统定时任务
// 由 systemd timer 或 pm2 cron 触发
// 使用 Next.js API 调用方式执行

const BASE_URL = 'https://www.xnmytx.com'

async function callApi(path: string, method = 'GET', body?: any) {
  const options: any = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${path}`, options)
  return res.json()
}

async function main() {
  const args = process.argv.slice(2)
  const task = args[0] || 'daily'

  console.log(`[AI Cron] Starting task: ${task} at ${new Date().toISOString()}`)

  switch (task) {
    case 'daily': {
      // 每日内容生成：从设置读取参数
      const settings = await callApi('/api/ai/settings')
      if (!settings.success) { console.error('Failed to get settings'); return }

      const s = settings.data || {}
      const dailyCount = parseInt(s.daily_content_count || '3')
      const ratioIndustry = parseInt(s.content_ratio_industry || '50')
      const ratioLocal = parseInt(s.content_ratio_local || '30')
      const ratioCase = parseInt(s.content_ratio_case || '20')
      const autoPublish = s.auto_publish === 'true'
      const requireReview = s.require_review !== 'false'

      // 计算各类别数量
      const countIndustry = Math.round(dailyCount * ratioIndustry / 100)
      const countLocal = Math.round(dailyCount * ratioLocal / 100)
      const countCase = dailyCount - countIndustry - countLocal

      console.log(`[AI Cron] Daily plan: ${dailyCount} articles (industry=${countIndustry}, local=${countLocal}, case=${countCase})`)

      // 获取活跃关键词
      const keywords = await callApi('/api/ai/keywords?status=active&limit=100')
      const activeKeywords = keywords.data || []

      // 生成行业知识文章
      for (let i = 0; i < countIndustry; i++) {
        const kw = activeKeywords[i]
        const result = await callApi('/api/ai/generate', 'POST', {
          content_type: 'industry',
          keyword: kw?.keyword || '青海广告投放',
          title: kw ? undefined : undefined
        })
        console.log(`  [Industry ${i+1}/${countIndustry}] ${result.success ? 'OK' : 'FAIL'}: ${result.message || ''}`)
      }

      // 生成本地媒体文章
      for (let i = 0; i < countLocal; i++) {
        const kw = activeKeywords[countIndustry + i]
        const result = await callApi('/api/ai/generate', 'POST', {
          content_type: 'local',
          keyword: kw?.keyword || '西宁户外广告',
          title: kw ? undefined : undefined
        })
        console.log(`  [Local ${i+1}/${countLocal}] ${result.success ? 'OK' : 'FAIL'}: ${result.message || ''}`)
      }

      // 生成案例文章
      for (let i = 0; i < countCase; i++) {
        const kw = activeKeywords[countIndustry + countLocal + i]
        const result = await callApi('/api/ai/generate', 'POST', {
          content_type: 'case',
          keyword: kw?.keyword || '青海广告投放案例',
          title: kw ? undefined : undefined
        })
        console.log(`  [Case ${i+1}/${countCase}] ${result.success ? 'OK' : 'FAIL'}: ${result.message || ''}`)
      }

      console.log(`[AI Cron] Daily task completed at ${new Date().toISOString()}`)
      break
    }

    case 'hot-topics': {
      // 热点话题检测并生成内容
      const settings = await callApi('/api/ai/settings')
      const s = settings.data || {}
      if (s.hot_topic_enabled !== 'true') {
        console.log('[AI Cron] Hot topic disabled, skipping')
        return
      }

      // 预定热点：季节性/节庆/政策
      const now = new Date()
      const month = now.getMonth() + 1
      const seasonTopics = [
        { month: [3,4,5], topic: '春季广告投放', heat: 70 },
        { month: [6,7,8], topic: '夏季旅游旺季广告', heat: 85 },
        { month: [9,10,11], topic: '秋季营销广告', heat: 75 },
        { month: [12,1,2], topic: '冬季/春节广告投放', heat: 90 },
      ]

      for (const st of seasonTopics) {
        if (st.month.includes(month)) {
          console.log(`[AI Cron] Generating seasonal topic: ${st.topic}`)
          const result = await callApi('/api/ai/generate', 'POST', {
            content_type: 'industry',
            keyword: st.topic,
            title: `${now.getFullYear()}年${st.topic}趋势分析`
          })
          console.log(`  ${result.success ? 'OK' : 'FAIL'}`)
        }
      }

      console.log(`[AI Cron] Hot topics task completed`)
      break
    }

    case 'lead-scoring': {
      // 线索评分（批量处理）
      const settings = await callApi('/api/ai/settings')
      const s = settings.data || {}
      if (s.lead_scoring_enabled !== 'true') {
        console.log('[AI Cron] Lead scoring disabled, skipping')
        return
      }

      // 可以通过 API 批量获取未评分的用户行为数据
      // 当前通过 AI 线索引擎 API 触发
      console.log('[AI Cron] Lead scoring task completed')
      break
    }

    default:
      console.log(`[AI Cron] Unknown task: ${task}`)
      break
  }
}

main().catch(e => {
  console.error('[AI Cron] Fatal error:', e)
  process.exit(1)
})
