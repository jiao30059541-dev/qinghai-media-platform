'use client'

import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import { Send, Bot, User, Sparkles, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Message = {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isMock?: boolean
}

export default function AIChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是您的广告投放顾问AI助手。\n\n我可以帮助您：\n1️⃣ 分析您的广告投放需求\n2️⃣ 推荐适合的广告类型\n3️⃣ 制定初步的投放策略\n4️⃣ 引导您创建投放方案\n\n请告诉我：\n• 您要投放的城市是？\n• 您的预算是多少？\n• 您的行业是什么？',
      role: 'assistant',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userInfo, setUserInfo] = useState({
    city: '',
    budget: '',
    industry: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const quickReplies = [
    { text: '我想在西宁投放广告', city: '西宁' },
    { text: '预算在5万元左右', budget: '50000' },
    { text: '我是餐饮行业', industry: '餐饮' },
    { text: '我是房地产行业', industry: '房地产' },
    { text: '预算10万，全省投放', budget: '100000', city: '全省' }
  ]
  
  const sendMessage = async (content: string, isQuickReply = false) => {
    if (!content.trim() && !isQuickReply) return
    
    const messageText = isQuickReply ? content : input
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // 从用户消息中提取信息
    const updatedInfo = { ...userInfo }
    if (/西宁/.test(content)) updatedInfo.city = '西宁'
    if (/海东/.test(content)) updatedInfo.city = '海东'
    if (/格尔木/.test(content)) updatedInfo.city = '格尔木'
    if (/德令哈/.test(content)) updatedInfo.city = '德令哈'
    if (/全省/.test(content)) updatedInfo.city = '全省'
    const budgetMatch = content.match(/(\d+)\s*[万万元元]/)
    if (budgetMatch) updatedInfo.budget = budgetMatch[1]
    if (/餐饮/.test(content)) updatedInfo.industry = '餐饮'
    if (/房地产/.test(content)) updatedInfo.industry = '房地产'
    if (/汽车/.test(content)) updatedInfo.industry = '汽车'
    if (/教育/.test(content)) updatedInfo.industry = '教育'
    if (/医疗/.test(content)) updatedInfo.industry = '医疗'
    if (/旅游/.test(content)) updatedInfo.industry = '旅游'
    if (/金融/.test(content)) updatedInfo.industry = '金融'
    if (/零售/.test(content)) updatedInfo.industry = '零售'
    setUserInfo(updatedInfo)
    
    try {
      const recentMessages = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }))
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: recentMessages,
          userInfo: {
            industry: updatedInfo.industry || undefined,
            budget: updatedInfo.budget ? parseInt(updatedInfo.budget) * (updatedInfo.budget.length <= 2 ? 10000 : 1) : undefined,
            city: updatedInfo.city || undefined,
          }
        })
      })
      
      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.success ? data.data.response : '抱歉，AI服务暂时不可用，请稍后重试。',
        role: 'assistant',
        timestamp: new Date(),
        isMock: data.data?.isMock
      }
      
      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，网络连接出现问题，请检查网络后重试。',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleQuickReply = (reply: typeof quickReplies[0]) => {
    let message = reply.text
    if (reply.city) setUserInfo(prev => ({ ...prev, city: reply.city }))
    if (reply.budget) setUserInfo(prev => ({ ...prev, budget: reply.budget }))
    if (reply.industry) setUserInfo(prev => ({ ...prev, industry: reply.industry }))
    sendMessage(message, true)
  }
  
  const guideToPlan = () => {
    const guideMessage: Message = {
      id: Date.now().toString(),
      content: '太好了！让我们开始创建您的投放方案。\n\n首先，我建议您：\n\n1. **浏览广告资源库** - 查看我推荐的广告类型的具体位置\n2. **选择感兴趣的广告位** - 点击"加入投放方案"\n3. **完善投放细节** - 在投放方案页面设置时间、预算等\n4. **生成最终方案** - 我会帮您优化并生成完整方案\n\n👉 点击这里开始浏览广告资源\nhttps://www.xnmytx.com/media\n\n您也可以继续向我提问，我会为您详细解答。',
      role: 'assistant',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, guideMessage])
  }
  
  const resetConversation = () => {
    setMessages([
      {
        id: '1',
        content: '您好！我是您的广告投放顾问AI助手。\n\n我可以帮助您：\n1️⃣ 分析您的广告投放需求\n2️⃣ 推荐适合的广告类型\n3️⃣ 制定初步的投放策略\n4️⃣ 引导您创建投放方案\n\n请告诉我：\n• 您要投放的城市是？\n• 您的预算是多少？\n• 您的行业是什么？',
        role: 'assistant',
        timestamp: new Date()
      }
    ])
    setUserInfo({ city: '', budget: '', industry: '' })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage(input)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <Head>
        <title>AI广告投放顾问 — 青海全媒体广告平台</title>
        <meta name="description" content="AI智能广告投放顾问，输入您的行业、预算和城市，一键生成青海户外广告投放方案，智能推荐最适合的广告组合" />
      </Head>
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-primary to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI广告投放顾问</h1>
                <p className="text-sm text-gray-600">智能推荐，专业方案</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/plan')}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                查看投放方案
              </button>
              <button
                onClick={resetConversation}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="重置对话"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 聊天头部 */}
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI投放咨询</h2>
                <p className="text-gray-600 mt-1">与我对话，获取专业的广告投放建议</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  AI在线
                </div>
              </div>
            </div>
            
            {(userInfo.city || userInfo.budget || userInfo.industry) && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">已收集信息</h3>
                <div className="flex flex-wrap gap-3">
                  {userInfo.city && (
                    <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                      🌆 {userInfo.city}
                    </span>
                  )}
                  {userInfo.budget && (
                    <span className="bg-white text-green-700 px-3 py-1 rounded-full text-sm border border-green-200">
                      💰 {userInfo.budget}元
                    </span>
                  )}
                  {userInfo.industry && (
                    <span className="bg-white text-purple-700 px-3 py-1 rounded-full text-sm border border-purple-200">
                      🏢 {userInfo.industry}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* 消息区域 */}
          <div className="h-[500px] overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}
                  >
                    <div className="flex items-start mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${message.role === 'user' ? 'bg-white/20' : 'bg-gradient-to-r from-primary to-blue-600'}`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {message.role === 'user' ? '您' : 'AI广告顾问'}
                          {message.isMock && <span className="ml-2 text-xs opacity-60">(离线模式)</span>}
                        </div>
                        <div className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                    
                    {message.role === 'assistant' && message.content.includes('下一步行动') && (
                      <div className="mt-4">
                        <button
                          onClick={guideToPlan}
                          className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          立即创建投放方案
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-gray-100 p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center mr-3">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* 快速回复区域 */}
          {!isLoading && (
            <div className="border-t p-4">
              <div className="flex items-center mb-3">
                <Sparkles className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">快速回复</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
                  >
                    {reply.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 输入区域 */}
          <div className="border-t p-6">
            <form onSubmit={handleSubmit}>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入您的问题或需求..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={isLoading}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    例如：&quot;我想在西宁投放餐饮广告，预算5万元&quot;
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`px-6 py-3 rounded-lg font-bold flex items-center ${isLoading || !input.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 text-white'}`}
                >
                  <Send className="w-5 h-5 mr-2" />
                  发送
                </button>
              </div>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">💡 使用说明</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• AI不会提供供应商联系方式或具体底价</li>
                <li>• 所有价格均为平台折扣价，最终以客服确认为准</li>
                <li>• 对话内容仅用于方案生成，不会泄露给第三方</li>
                <li>• 如需人工服务，请在工作时间联系客服</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 功能卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">智能推荐</h3>
            <p className="text-gray-600 text-sm">
              基于您的行业、预算和城市，AI智能推荐最适合的广告组合
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="font-bold text-gray-900 mb-2">方案生成</h3>
            <p className="text-gray-600 text-sm">
              自动生成完整的投放方案，包括策略、预算分配和预估效果
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="font-bold text-gray-900 mb-2">平台保障</h3>
            <p className="text-gray-600 text-sm">
              所有广告资源均经过平台审核，价格透明，服务有保障
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
