import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `你是一位专业的广告投放顾问AI助手，服务于青海全媒体广告平台（www.xnmytx.com）。
平台覆盖西宁、海东、格尔木、德令哈等青海省主要城市，提供户外广告、社区广告、数字广告等多种媒体资源。

你的职责：
1. 了解客户的投放需求（城市、预算、行业、目标人群）
2. 推荐适合的广告类型和媒体组合
3. 提供投放策略建议
4. 引导客户创建投放方案

回答要求：
- 简洁专业，不超过300字
- 提供具体的数据和建议
- 引导用户下一步操作
- 不透露供应商底价和联系方式
- 价格以平台折扣价为准`;

function generateMockResponse(message: string, history: any[] = [], userInfo: any = {}): string {
  const msg = message.toLowerCase();
  const hasCity = !!userInfo.city;
  const hasBudget = !!userInfo.budget;
  const hasIndustry = !!userInfo.industry;

  if (/^(你好|hi|hello|嗨|嘿)/.test(msg)) {
    return `您好！欢迎来到青海全媒体广告平台！\n\n我是您的AI广告投放顾问，可以帮您：\n• 分析投放需求\n• 推荐最佳媒体组合\n• 制定投放策略\n\n请问您想在哪个城市投放广告？`;
  }

  if (/价格|多少钱|报价|费用/.test(msg)) {
    const city = hasCity ? userInfo.city : '青海各城市';
    return `关于${city}的广告报价：\n\n📺 **社区广告**：800-3,000元/月/面\n📱 **数字广告**：5,000元/月起\n🏙️ **户外大屏**：8,000-30,000元/月\n🚌 **公交广告**：2,000-8,000元/月/辆\n\n具体价格取决于广告位位置、尺寸和投放时长。\n\n👉 点击"查看投放方案"可以浏览具体广告位并获取精确报价。`;
  }

  if (/哪个城市|哪些城市|城市/.test(msg)) {
    return `我们目前覆盖青海省主要城市：\n\n🏙️ **西宁** - 省会城市，商业核心区人流量大\n🌆 **海东** - 新兴城市，成本性价比高\n🏔️ **格尔木** - 工业城市，适合特定行业\n🌊 **德令哈** - 旅游城市，季节性投放效果好\n🌏 **全省覆盖** - 多城市组合投放\n\n您主要想在哪个城市投放？`;
  }

  if (/广告类型|什么广告|哪种广告/.test(msg)) {
    const industry = hasIndustry ? userInfo.industry : '';
    let recommend = '';
    if (industry === '餐饮') recommend = '🍽️ 餐饮行业推荐：社区电梯广告 + 本地公众号 + 商圈小屏';
    else if (industry === '房地产') recommend = '🏠 房地产推荐：户外大屏 + 高炮广告 + 高端社区电梯';
    else if (industry === '汽车') recommend = '🚗 汽车行业推荐：高速广告 + 商圈大屏 + 交通要道';
    else recommend = '📊 综合推荐：户外广告 + 社区广告 + 数字广告 组合投放';
    
    return `我们的广告类型包括：\n\n📺 **社区广告** - 电梯框架、社区道闸、公告栏\n🏙️ **户外广告** - LED大屏、高炮立柱、楼顶大牌\n🚌 **交通广告** - 公交车身、出租车、站台\n📱 **数字广告** - 本地公众号、抖音信息流、朋友圈\n\n${recommend}\n\n请告诉我您的行业和预算，我为您推荐最合适的组合。`;
  }

  if (!hasCity) {
    const cityMatch = message.match(/(西宁|海东|格尔木|德令哈|全省)/);
    if (cityMatch) {
      return `好的，**${cityMatch[1]}**！这是一个不错的投放区域。\n\n接下来请告诉我：\n• **您的预算范围**是多少？（如：5万元、10万元）\n• **您的行业**是什么？（餐饮、房地产、汽车、教育等）\n\n有了这些信息，我可以为您推荐最合适的广告组合。`;
    }
    return `请告诉我您的投放城市，我好为您推荐：\n\n🏙️ **西宁** - 省会，人流密集，适合各行业\n🌆 **海东** - 新兴市场，性价比高\n🏔️ **格尔木** - 工业城市，特定人群\n🌊 **德令哈** - 旅游城市\n🌏 **全省** - 多城市组合投放\n\n您选择哪个城市？`;
  }

  if (!hasBudget) {
    return `了解，${userInfo.city}投放是很好的选择。\n\n接下来请告诉我您的**预算范围**：\n\n💰 **1-5万**：社区广告为主，精准触达\n💰 **5-10万**：户外+社区组合\n💰 **10-20万**：多渠道组合投放\n💰 **20万+**：全方位品牌投放\n\n您的预算大概是多少？`;
  }

  if (!hasIndustry) {
    return `收到，预算${userInfo.budget}元，${userInfo.city}投放。\n\n最后请告诉我您的**行业类型**：\n\n🍽️ 餐饮美食\n🏠 房地产\n🚗 汽车\n🎓 教育培训\n🏥 医疗健康\n🛍️ 零售百货\n✈️ 旅游酒店\n💰 金融保险\n\n您的行业是什么？`;
  }

  if (hasCity && hasBudget && hasIndustry) {
    const budget = parseInt(String(userInfo.budget).replace(/[^0-9]/g, '')) || 50000;
    const industryMap: Record<string, string> = {
      '餐饮': '🍽️ 餐饮行业适合社区广告+本地生活号推广',
      '房地产': '🏠 房地产适合户外大屏+高端社区精准投放',
      '汽车': '🚗 汽车适合交通广告+商圈展示',
      '教育': '🎓 教育适合社区+校园周边广告',
      '医疗': '🏥 医疗适合社区健康宣传+专业渠道',
      '旅游': '✈️ 旅游适合商圈大屏+交通广告',
      '金融': '💰 金融适合高端社区+商务区广告',
      '零售': '🛍️ 零售适合社区+商圈组合投放'
    };
    const industryAdvice = industryMap[userInfo.industry] || '📊 建议多渠道组合投放';
    
    return `完美！根据您的需求，我为您制定了一份投放方案：\n\n📊 **需求分析**\n• 城市：${userInfo.city}\n• 预算：${budget.toLocaleString()}元\n• 行业：${userInfo.industry}\n\n🎯 **推荐媒体组合**\n${industryAdvice}\n\n**预算分配建议**：\n• 主力媒体（50%）：${budget > 50000 ? '户外LED大屏' : '社区电梯广告'}\n• 辅助媒体（30%）：本地公众号矩阵\n• 效果补充（20%）：社交媒体信息流\n\n📈 **预期效果**\n• 日均曝光：${budget > 100000 ? '50万+' : budget > 50000 ? '20万+' : '5万+'}人次\n• 核心人群覆盖率：70%+\n\n🚀 **下一步行动**\n1. 查看推荐广告位详情\n2. 将选中的资源加入投放方案\n3. 联系客服获取专属折扣\n\n需要我为您推荐具体的广告位吗？`;
  }

  return `感谢您的提问！我来为您详细解答。\n\n作为青海全媒体广告平台的AI顾问，我可以帮您：\n\n1. **需求分析** - 了解您的投放目标\n2. **资源推荐** - 匹配最适合的广告位\n3. **方案制定** - 提供专业的投放策略\n\n请告诉我您的**城市、预算和行业**，我为您量身定制方案。`;
}

interface ChatRequest {
  message: string;
  history?: Array<{ role: string; content: string }>;
  userInfo?: {
    industry?: string;
    budget?: number;
    city?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, history = [], userInfo = {} } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // Try DeepSeek API
    if (DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== '' && !DEEPSEEK_API_KEY.includes('your-')) {
      try {
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
          { role: 'user', content: message }
        ];

        const response = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages,
            max_tokens: 1024,
            temperature: 0.7,
            stream: false
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content;
          
          if (aiResponse) {
            try {
              await query(
                'INSERT INTO ai_conversations (user_message, ai_response, user_info, created_at) VALUES (?, ?, ?, NOW())',
                [message, aiResponse, JSON.stringify(userInfo)]
              );
            } catch (dbError) {
              // ai_conversations table may not exist, silently skip
            }

            return NextResponse.json({
              success: true,
              data: {
                response: aiResponse,
                usage: data.usage,
                isMock: false
              }
            });
          }
        } else {
          console.error('DeepSeek API调用失败:', response.status);
        }
      } catch (apiError) {
        console.error('DeepSeek API错误:', apiError);
      }
    }

    // Fallback to intelligent mock
    const mockResponse = generateMockResponse(message, history, userInfo);
    
    return NextResponse.json({
      success: true,
      data: {
        response: mockResponse,
        isMock: true
      }
    });

  } catch (error) {
    console.error('AI聊天处理错误:', error);
    return NextResponse.json(
      { success: false, error: 'AI服务暂时不可用' },
      { status: 500 }
    );
  }
}
