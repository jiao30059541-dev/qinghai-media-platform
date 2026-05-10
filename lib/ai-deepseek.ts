// lib/ai-deepseek.ts - DeepSeek API 调用封装
// 支持流式和非流式调用、重试机制、token计数、错误处理
// 参考 lib/sms-service.ts 的工厂模式封装

import { estimateMessagesTokens } from './ai-prompt'

// ============= 类型定义 =============

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekRequestOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stream?: boolean
  timeout?: number
}

export interface DeepSeekResponse {
  success: boolean
  content?: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: string
  isMock?: boolean
}

export interface DeepSeekStreamChunk {
  content: string
  done: boolean
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ============= 配置 =============

const DEFAULT_CONFIG = {
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  timeout: 30000, // 30秒超时
  maxRetries: 3,
  retryDelay: 1000, // 初始重试延迟 ms
}

// ============= DeepSeek API 服务类 =============

export class DeepSeekService {
  private apiKey: string
  private config: typeof DEFAULT_CONFIG

  constructor(apiKey?: string, config?: Partial<typeof DEFAULT_CONFIG>) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || ''
    this.config = { ...DEFAULT_CONFIG, ...config }

    if (!this.apiKey) {
      console.warn('DeepSeekService: DEEPSEEK_API_KEY 未配置，将使用 mock 模式')
    }
  }

  /**
   * 检查 API key 是否已配置
   */
  isConfigured(): boolean {
    return !!this.apiKey && !this.apiKey.includes('your-') && this.apiKey !== '***'
  }

  /**
   * 非流式调用 DeepSeek API
   */
  async chat(options: {
    messages: DeepSeekMessage[]
    temperature?: number
    max_tokens?: number
    stream?: false
  }): Promise<DeepSeekResponse> {
    return this.callWithRetry(options)
  }

  /**
   * 流式调用 DeepSeek API（返回 AsyncGenerator）
   */
  async *chatStream(options: {
    messages: DeepSeekMessage[]
    temperature?: number
    max_tokens?: number
    stream: true
  }): AsyncGenerator<DeepSeekStreamChunk> {
    if (!this.isConfigured()) {
      yield { content: '', done: true }
      return
    }

    const url = this.config.apiUrl
    const body = {
      model: this.config.model,
      messages: options.messages,
      temperature: options.temperature ?? this.config.temperature,
      max_tokens: options.max_tokens ?? this.config.maxTokens,
      top_p: this.config.topP,
      frequency_penalty: this.config.frequencyPenalty,
      presence_penalty: this.config.presencePenalty,
      stream: true,
    }

    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`DeepSeek API stream error: ${response.status} ${errorText}`)
        yield { content: `API错误: ${response.status}`, done: true }
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        yield { content: '无法获取响应流', done: true }
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const data = JSON.parse(trimmed.slice(6))
            const delta = data.choices?.[0]?.delta?.content || ''
            if (delta) {
              yield { content: delta, done: false }
            }
          } catch {
            // 跳过无法解析的chunk
          }
        }
      }

      yield { content: '', done: true }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        yield { content: '请求超时', done: true }
      } else {
        yield { content: `流式调用异常: ${error.message || '未知错误'}`, done: true }
      }
    }
  }

  /**
   * 带重试机制的API调用
   */
  private async callWithRetry(options: {
    messages: DeepSeekMessage[]
    temperature?: number
    max_tokens?: number
    stream?: false
  }, retryCount = 0): Promise<DeepSeekResponse> {
    // Mock模式
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'DeepSeek API key 未配置',
        isMock: true,
      }
    }

    try {
      const url = this.config.apiUrl
      const body = {
        model: this.config.model,
        messages: options.messages,
        temperature: options.temperature ?? this.config.temperature,
        max_tokens: options.max_tokens ?? this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
        stream: false,
      }

      const abortController = new AbortController()
      const timeoutId = setTimeout(() => abortController.abort(), this.config.timeout)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        const errorMessage = `API返回错误 ${response.status}: ${errorText}`

        // 429 Too Many Requests - 需要重试
        if (response.status === 429 && retryCount < this.config.maxRetries) {
          return this.retry(options, retryCount)
        }

        // 401 Unauthorized - API key无效
        if (response.status === 401) {
          return {
            success: false,
            error: 'API Key 认证失败，请检查DEEPSEEK_API_KEY配置',
          }
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        return {
          success: false,
          error: 'API响应中没有找到内容',
        }
      }

      return {
        success: true,
        content,
        usage: data.usage
          ? {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: data.usage.completion_tokens,
              total_tokens: data.usage.total_tokens,
            }
          : undefined,
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (retryCount < this.config.maxRetries) {
          return this.retry(options, retryCount, '请求超时')
        }
        return { success: false, error: '请求超时，已重试多次仍失败' }
      }

      if (retryCount < this.config.maxRetries) {
        return this.retry(options, retryCount, error.message)
      }

      return {
        success: false,
        error: `API调用异常: ${error.message || '未知错误'}`,
      }
    }
  }

  /**
   * 执行重试
   */
  private async retry(
    options: { messages: DeepSeekMessage[]; temperature?: number; max_tokens?: number; stream?: false },
    retryCount: number,
    lastError?: string
  ): Promise<DeepSeekResponse> {
    const delay = this.config.retryDelay * Math.pow(2, retryCount) + Math.random() * 500
    console.warn(
      `DeepSeek API 重试第 ${retryCount + 1}/${this.config.maxRetries} 次` +
        (lastError ? ` (原因: ${lastError})` : '') +
        `，等待 ${Math.round(delay)}ms`
    )

    await new Promise(resolve => setTimeout(resolve, delay))
    return this.callWithRetry(options, retryCount + 1)
  }

  /**
   * 获取token使用统计（基于客户端估算或API返回）
   */
  getTokenUsage(messages: DeepSeekMessage[]): { promptTokens: number; maxCompletionTokens: number } {
    const promptTokens = estimateMessagesTokens(messages)
    return {
      promptTokens,
      maxCompletionTokens: this.config.maxTokens,
    }
  }
}

// ============= 工厂函数 =============

/**
 * 创建DeepSeek服务实例（类似 sms-service.ts 的 createSmsService）
 */
export function createDeepSeekService(config?: Partial<typeof DEFAULT_CONFIG>): DeepSeekService {
  return new DeepSeekService(undefined, config)
}

/**
 * 获取 DeepSeek 配置状态
 */
export function getDeepSeekStatus(): { configured: boolean; model: string; apiUrl: string } {
  const service = new DeepSeekService()
  return {
    configured: service.isConfigured(),
    model: DEFAULT_CONFIG.model,
    apiUrl: DEFAULT_CONFIG.apiUrl,
  }
}
