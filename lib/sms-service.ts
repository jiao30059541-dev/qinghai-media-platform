// lib/sms-service.ts - 统一短信服务工厂
import { TencentSmsService, createTencentSmsService, getTencentSmsConfig } from './sms-tencent'

// 短信服务商类型
export type SmsProvider = 'tencent' | 'aliyun' | 'yunpian' | 'dev'

// 短信服务配置
export interface SmsConfig {
  provider: SmsProvider
  // 腾讯云配置
  secretId?: string
  secretKey?: string
  sdkAppId?: string
  signName?: string
  templateId?: string
  region?: string
  // 阿里云配置
  accessKeyId?: string
  accessKeySecret?: string
  templateCode?: string
  // 云片配置
  apiKey?: string
  sign?: string
}

// 短信发送结果
export interface SmsResult {
  success: boolean
  message: string
  requestId?: string
  code?: string
  error?: string
}

// 开发模式短信服务
class DevSmsService {
  async sendVerificationCode(phone: string): Promise<SmsResult> {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    console.log(`[开发模式] 验证码发送到 ${phone}: ${code}`)
    
    return {
      success: true,
      message: '验证码已发送（开发模式）',
      code,
      requestId: `dev_${Date.now()}`
    }
  }
}

// 短信服务工厂
export class SmsService {
  private provider: SmsProvider
  private tencentService?: TencentSmsService
  private devService: DevSmsService

  constructor(config: SmsConfig) {
    this.provider = config.provider || 'dev'
    this.devService = new DevSmsService()
    
    if (this.provider === 'tencent') {
      const tencentConfig = {
        secretId: config.secretId || '',
        secretKey: config.secretKey || '',
        sdkAppId: config.sdkAppId || '',
        signName: config.signName || '青海广告平台',
        templateId: config.templateId || '',
        region: config.region || 'ap-guangzhou'
      }
      
      // 验证腾讯云配置
      if (tencentConfig.secretId && tencentConfig.secretKey && tencentConfig.sdkAppId) {
        this.tencentService = new TencentSmsService(tencentConfig)
      } else {
        console.warn('腾讯云短信配置不完整，回退到开发模式')
        this.provider = 'dev'
      }
    }
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(phone: string): Promise<SmsResult> {
    try {
      // 验证手机号格式
      if (!phone || phone.length !== 11 || !/^1[3-9]\d{9}$/.test(phone)) {
        return {
          success: false,
          message: '手机号码格式不正确',
          error: 'INVALID_PHONE'
        }
      }

      let result: SmsResult
      
      switch (this.provider) {
        case 'tencent':
          if (this.tencentService) {
            const code = Math.floor(100000 + Math.random() * 900000).toString()
            result = await this.tencentService.sendVerificationCode(phone, code)
            
            // 腾讯云服务返回的结果中不包含code，需要添加
            if (result.success && !result.code) {
              result.code = code
            }
          } else {
            result = await this.devService.sendVerificationCode(phone)
          }
          break
          
        case 'dev':
        default:
          result = await this.devService.sendVerificationCode(phone)
          break
      }
      
      return result
      
    } catch (error: any) {
      console.error('短信发送异常:', error)
      
      return {
        success: false,
        message: `短信服务异常: ${error.message || '未知错误'}`,
        error: 'SERVICE_ERROR'
      }
    }
  }

  /**
   * 获取当前服务商
   */
  getProvider(): SmsProvider {
    return this.provider
  }

  /**
   * 检查配置是否完整
   */
  isConfigured(): boolean {
    return this.provider !== 'dev'
  }
}

// 从环境变量获取配置
export function getSmsConfig(): SmsConfig {
  const provider = (process.env.SMS_PROVIDER as SmsProvider) || 'dev'
  
  const config: SmsConfig = {
    provider
  }
  
  if (provider === 'tencent') {
    config.secretId = process.env.SMS_SECRET_ID || ''
    config.secretKey = process.env.SMS_SECRET_KEY || ''
    config.sdkAppId = process.env.SMS_SDK_APP_ID || ''
    config.signName = process.env.SMS_SIGN_NAME || '青海广告平台'
    config.templateId = process.env.SMS_TEMPLATE_ID || ''
    config.region = process.env.SMS_REGION || 'ap-guangzhou'
  }
  
  return config
}

// 创建短信服务实例
export function createSmsService(): SmsService {
  const config = getSmsConfig()
  return new SmsService(config)
}