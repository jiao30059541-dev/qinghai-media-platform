const https = require('https')
const BASE_URL = 'https://www.xnmytx.com'

function fetchApi(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const req = https.request({
      hostname: url.hostname, path: url.pathname, method,
      headers: { 'Content-Type': 'application/json' },
      rejectUnauthorized: false
    }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch(e) { resolve({success:false}) } })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

const caseArticles = [
  { keyword: '西宁旅游景区广告案例', title: '西宁旅游景区广告投放案例：旺季获客增长60%' },
  { keyword: '青海酒店广告投放案例', title: '青海连锁酒店广告投放案例：入住率提升25%的秘诀' },
  { keyword: '西宁餐饮广告案例', title: '西宁餐饮品牌广告投放案例：从认知到到店的完整闭环' },
  { keyword: '青海房地产广告案例', title: '西宁房地产项目广告投放案例：精准获客300组的实战分享' },
  { keyword: '青海教育机构广告案例', title: '青海教育培训机构广告投放案例：招生成本降低40%' },
  { keyword: '青海汽车广告投放案例', title: '格尔木汽车4S店广告投放案例：到店量翻倍的经验' },
  { keyword: '青海本地生活广告案例', title: '海东本地生活服务平台广告案例：社区渗透的运营策略' },
  { keyword: '青海旅游广告投放案例', title: '德令哈旅游广告投放案例：星空之城品牌打造实战' },
  { keyword: '西宁医美广告案例', title: '西宁医美机构广告投放案例：合规前提下的精准获客' },
  { keyword: '青海零售广告案例', title: '青海连锁零售品牌广告投放案例：全渠道整合营销实战' },
]

async function main() {
  console.log("Generating " + caseArticles.length + " case articles...\n")

  for (let i = 0; i < caseArticles.length; i++) {
    const a = caseArticles[i]
    process.stdout.write("  [" + (i+1) + "/" + caseArticles.length + "] " + a.keyword + "... ")
    
    try {
      const result = await fetchApi('/api/ai/generate', 'POST', {
        content_type: 'case',
        keyword: a.keyword,
        title: a.title,
      })
      if (result.success) {
        console.log("OK (id=" + (result.data?.task_id || '?') + ")")
      } else {
        console.log("FAIL - " + (result.message || 'unknown'))
      }
    } catch(e) {
      console.log("FAIL - " + e.message)
    }
    
    await sleep(3000)
  }

  console.log("\nDone! Now publishing...")
}

main().catch(e => { console.error("Fatal:", e); process.exit(1) })
