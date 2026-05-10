// lib/ai-prompt.ts - AI 提示词模板模块
// 包含内容生成、热点追踪、线索评分三大类提示词

// ============= 内容生成提示词 =============

/**
 * SEO文章生成提示词 - 构建围绕关键词的专业广告行业文章
 * 要求：标题含关键词、结构化标题、含广告投放知识、含青海地域信息、结尾引导咨询平台
 */
export function buildContentPrompt(params: {
  keyword: string
  title?: string
  contentType: 'industry' | 'local' | 'case'
}): { system: string; user: string } {
  const { keyword, title, contentType } = params

  const systemPrompt = `你是一位专业的广告行业内容创作专家，服务于青海全媒体广告平台（www.xnmytx.com）。
你擅长创作高质量的SEO内容，内容需要兼具专业性和可读性，能够帮助广告主了解青海本地广告市场。

内容创作规范：
1. 标题必须包含核心关键词，且自然流畅
2. 使用结构化标题（H2/H3），层次清晰
3. 融入专业的广告投放知识、媒体选择策略、预算分配建议
4. 结合青海本地地域信息（西宁、海东、格尔木、德令哈等城市）
5. 结尾自然引导读者咨询青海全媒体广告平台
6. 全文800-1500字，信息密度高，避免空泛描述
7. SEO关键词密度控制在2%-3%之间`

  let userPrompt = ''

  switch (contentType) {
    case 'industry':
      userPrompt = `请围绕关键词「${keyword}」撰写一篇广告行业知识类SEO文章。

${
  title
    ? `建议标题：${title}`
    : `请生成一个包含关键词「${keyword}」的吸引人标题`
}

文章结构要求：
## 一、引言
- 从青海本地广告市场切入，引出关键词主题
- 说明该主题对青海广告主的重要性

## 二、核心内容（2-3个H2段落）
- 每个H2下设2-3个H3子标题
- 融入具体的广告投放策略、媒体选择方法
- 结合青海各城市（西宁、海东、格尔木、德令哈）的广告资源特点
- 提供可操作的专业建议

## 三、青海市场洞察
- 分析青海本地广告市场现状和趋势
- 引用本地投放案例或场景

## 四、总结与建议
- 总结核心观点
- 引导读者：如需专业的广告投放服务，可咨询青海全媒体广告平台（www.xnmytx.com）获取定制化投放方案`
      break

    case 'local':
      userPrompt = `请围绕关键词「${keyword}」撰写一篇青海本地媒体广告类SEO文章。

${
  title
    ? `建议标题：${title}`
    : `请生成一个包含关键词「${keyword}」的吸引人标题`
}

文章结构要求：
## 一、青海广告市场概况
- 介绍青海本地媒体资源分布（户外大屏、社区广告、公交广告等）
- 各城市广告资源特点分析

## 二、核心内容（2-3个H2段落）
- 聚焦青海本地媒体类型的选择策略
- 不同行业的青海本地投放建议
- 各城市性价比分析

## 三、投放效果预估
- 基于青海市场的数据分析
- 不同预算区间的投放方案建议

## 四、立即咨询
- 引导读者联系青海全媒体广告平台
- 获取青海各城市广告位的详细报价和投放方案`
      break

    case 'case':
      userPrompt = `请围绕关键词「${keyword}」撰写一篇广告投放案例类SEO文章。

${
  title
    ? `建议标题：${title}`
    : `请生成一个包含关键词「${keyword}」的吸引人标题`
}

文章结构要求：
## 一、案例背景
- 客户行业、需求痛点
- 投放目标（品牌曝光、获客引流等）

## 二、投放策略
- 媒体组合方案（户外+社区+数字等）
- 预算分配逻辑
- 青海本地针对性策略

## 三、执行过程
- 投放时间节点
- 创意方向
- 各渠道执行细节

## 四、投放效果
- 曝光量、点击率、转化率等数据
- ROI分析
- 客户反馈

## 五、经验总结
- 成功关键因素
- 优化建议
- 引导读者咨询青海全媒体广告平台获取专属方案`
      break
  }

  return { system: systemPrompt, user: userPrompt }
}

// ============= 热点追踪提示词 =============

/**
 * 热点追踪提示词 - 围绕热点话题生成广告行业趋势分析文章
 */
export function buildTrendPrompt(params: {
  topic: string
  category: string
  heatScore?: number
}): { system: string; user: string } {
  const systemPrompt = `你是一位广告行业趋势分析专家，擅长结合社会热点、政策变化、季节性事件，分析其对广告行业的影响，并给出青海本地广告主的应对策略。

你的写作风格：
- 专业但不晦涩，让广告主能看懂
- 结合热点事件的时效性，紧跟最新动态
- 落脚点始终在"广告投放策略"和"青海本地市场"
- 结尾引导读者采取行动`

  const userPrompt = `请围绕热点话题「${params.topic}」（热度评分：${params.heatScore || '较高'}，类别：${params.category}），撰写一篇广告行业趋势分析文章。

写作要求：
1. 首先简要介绍该热点话题的核心内容
2. 分析该热点对广告行业的影响和机遇
3. 从青海本地广告主的角度出发，给出具体的应对策略
4. 结合青海各城市特点，提供差异化的投放建议
5. 引用数据或趋势增强说服力
6. 结尾引导读者咨询青海全媒体广告平台

文章需包含以下结构化内容：

## 热点解读
## 广告行业影响分析
## 青海广告主应对策略
## 媒体投放建议
## 行动建议

全文600-1000字，确保内容具备时效性和实操价值。`

  return { system: systemPrompt, user: userPrompt }
}

// ============= 线索评分提示词 =============

/**
 * 线索评分提示词 - 分析用户行为判断线索价值
 * 输出：high / medium / low 及原因说明
 */
export function buildLeadScoringPrompt(params: {
  userInfo: {
    userId?: number
    industry?: string
    budget?: number | string
    city?: string
    name?: string
    company?: string
    phone?: string
  }
  behaviors: Array<{
    type: string
    detail?: string
    timestamp?: string
  }>
  consultationContent?: string
}): { system: string; user: string } {
  const systemPrompt = `你是一位专业的广告销售线索评分专家。你需要根据用户的行为数据、个人信息和咨询内容，判断该线索的价值等级。

评分标准：
- HIGH（高价值）：用户有明确预算（>5万）、有具体行业、有明确的投放城市、反复浏览广告位、主动咨询报价、已完成企业认证
- MEDIUM（中价值）：用户有初步意向但预算不明确（1-5万）、或只提供了部分信息、有浏览行为但未深入咨询
- LOW（低价值）：无明确投放意向、无预算信息、仅浏览首页、或信息明显不完整/虚假

评分维度权重：
1. 预算信息（30%）：预算越高，价值越大
2. 行业明确度（20%）：是否知道自己的行业定位
3. 城市选择（15%）：是否明确投放城市
4. 行为深度（25%）：是否查看广告位详情、是否咨询报价、停留时长
5. 信息完整度（10%）：是否填写了完整的公司和个人信息`

  const behaviorsText = params.behaviors
    .map((b, i) => `${i + 1}. [${b.type}] ${b.detail || ''}${b.timestamp ? ' 时间：' + b.timestamp : ''}`)
    .join('\n')

  const userPrompt = `请分析以下广告投放线索，输出评分结果。

## 用户信息
- 行业：${params.userInfo.industry || '未提供'}
- 预算：${params.userInfo.budget || '未提供'}
- 目标城市：${params.userInfo.city || '未提供'}
- 公司名称：${params.userInfo.company || '未提供'}
- 联系人：${params.userInfo.name || '未提供'}

## 用户行为记录
${behaviorsText || '无详细行为记录'}

## 咨询内容
${params.consultationContent || '无咨询内容'}

请按以下JSON格式输出（不要包含其他文字）：
{
  "score_level": "high|medium|low",
  "score": 0-100,
  "reason": "评分理由，详细说明各维度的得分依据",
  "suggested_action": "建议跟进方式和个人"
}`

  return { system: systemPrompt, user: userPrompt }
}

// ============= 通用辅助函数 =============

/**
 * 计算文本的token数量（粗略估计）
 * 中文约每1.5字符为1个token，英文约每4字符为1个token
 */
export function estimateTokens(text: string): number {
  let tokens = 0
  for (const char of text) {
    // 中文字符范围
    if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(char)) {
      tokens += 1.5
    } else if (/[\w]/.test(char)) {
      tokens += 0.25
    } else {
      tokens += 0.5
    }
  }
  return Math.ceil(tokens)
}

/**
 * 计算消息数组的总token数
 */
export function estimateMessagesTokens(
  messages: Array<{ role: string; content: string }>
): number {
  let total = 0
  // 基础格式开销
  total += 3 // 每条消息的开销
  for (const msg of messages) {
    total += estimateTokens(msg.content)
    total += estimateTokens(msg.role)
  }
  return total
}

/**
 * 安全截断文本到指定token数
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  if (estimateTokens(text) <= maxTokens) return text
  // 粗略截断——保留前80%的字符
  const ratio = maxTokens / estimateTokens(text)
  const charLimit = Math.floor(text.length * ratio * 0.9)
  return text.slice(0, charLimit) + '\n\n[内容已截断...]'
}
