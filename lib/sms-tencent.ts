// lib/sms-tencent.ts - 腾讯云短信服务实现
import * as tencentcloud from "tencentcloud-sdk-nodejs"

// 腾讯云短信客户端
const SmsClient = tencentcloud.sms.v20210111.Client

export interface TencentSmsConfig {
  secretId: string
  secretKey: string
  sdkAppId: string
  signName: string
  templateId: string
  region?: string
}

export interface SmsResult {
  success: boolean
  message: string
  requestId?: string
  code?: string
  error?: string
}

export class TencentSmsService {
  private config: TencentSmsConfig
  private client: any

  constructor(config: TencentSmsConfig) {
    this.config = {
      region: 'ap-guangzhou',
      ...config
    }
    
    // 创建客户端
    this.client = new SmsClient({
      credential: {
        secretId: this.config.secretId,
        secretKey: this.config.secretKey,
      },
      region: this.config.region,
      profile: {
        httpProfile: {
          endpoint: "sms.tencentcloudapi.com",
        },
      },
    })
  }

  /**
   * 发送验证码短信
   * @param phone 手机号
   * @param code 验证码
   * @returns 发送结果
   */
  async sendVerificationCode(phone: string, code: string): Promise<SmsResult> {
    try {
      // 验证手机号格式
      if (!phone || phone.length !== 11) {
        return {
          success: false,
          message: '手机号码格式不正确',
          error: 'INVALID_PHONE'
        }
      }

      // 模板参数：验证码和有效期
      const templateParamSet = [code, "5"]
      
      const params = {
        PhoneNumberSet: [`+86${phone}`],
        SmsSdkAppId: this.config.sdkAppId,
        SignName: this.config.signName,
        TemplateId: this.config.templateId,
        TemplateParamSet: templateParamSet,
      }

      console.log(`[腾讯云短信] 准备发送到 ${phone}: ${code}`)
      
      // 调用腾讯云API
      const response = await this.client.SendSms(params)
      
      console.log(`[腾讯云短信] API响应:`, JSON.stringify(response, null, 2))
      
      // 检查发送状态
      if (response.SendStatusSet && response.SendStatusSet.length > 0) {
        const status = response.SendStatusSet[0]
        
        if (status.Code === 'Ok') {
          return {
            success: true,
            message: '短信发送成功',
            requestId: response.RequestId,
            code
          }
        } else {
          return {
            success: false,
            message: `短信发送失败: ${status.Message}`,
            error: status.Code,
            requestId: response.RequestId
          }
        }
      }
      
      return {
        success: false,
        message: '短信发送未知错误',
        error: 'UNKNOWN_ERROR',
        requestId: response.RequestId
      }
      
    } catch (error: any) {
      console.error('腾讯云短信发送失败:', error)
      
      return {
        success: false,
        message: `短信服务异常: ${error.message || '未知错误'}`,
        error: error.code || 'API_ERROR'
      }
    }
  }

  /**
   * 发送普通短信
   * @param phones 手机号数组
   * @param templateId 模板ID
   * @param params 模板参数
   * @returns 发送结果
   */
  async sendSms(
    phones: string[], 
    templateId: string, 
    params: string[]
  ): Promise<SmsResult> {
    try {
      const phoneSet = phones.map(phone => `+86${phone}`)
      
      const requestParams = {
        PhoneNumberSet: phoneSet,
        SmsSdkAppId: this.config.sdkAppId,
        SignName: this.config.signName,
        TemplateId: templateId,
        TemplateParamSet: params,
      }

      const response = await this.client.SendSms(requestParams)
      
      if (response.SendStatusSet && response.SendStatusSet.length > 0) {
        const failedPhones = response.SendStatusSet
          .filter((status: any) => status.Code !== 'Ok')
          .map((status: any) => status.PhoneNumber)
        
        if (failedPhones.length === 0) {
          return {
            success: true,
            message: '短信发送成功',
            requestId: response.RequestId
          }
        } else {
          return {
            success: false,
            message: `部分短信发送失败: ${failedPhones.join(',')}`,
            requestId: response.RequestId
          }
        }
      }
      
      return {
        success: false,
        message: '短信发送未知错误',
        error: 'UNKNOWN_ERROR',
        requestId: response.RequestId
      }
      
    } catch (error: any) {
      console.error('腾讯云短信发送失败:', error)
      
      return {
        success: false,
        message: `短信服务异常: ${error.message || '未知错误'}`,
        error: error.code || 'API_ERROR'
      }
    }
  }
}

// 从环境变量创建配置
export function getTencentSmsConfig(): TencentSmsConfig {
  return {
    secretId: process.env.SMS_SECRET_ID || '',
    secretKey: process.env.SMS_SECRET_KEY || '',
    sdkAppId: process.env.SMS_SDK_APP_ID || '',
    signName: process.env.SMS_SIGN_NAME || '青海广告平台',
    templateId: process.env.SMS_TEMPLATE_ID || '',
    region: process.env.SMS_REGION || 'ap-guangzhou'
  }
}

// 创建短信服务实例
export function createTencentSmsService(): TencentSmsService {
  const config = getTencentSmsConfig()
  
  if (!config.secretId || !config.secretKey) {
    throw new Error('腾讯云短信配置不完整，请设置SMS_SECRET_ID和SMS_SECRET_KEY')
  }
  
  if (!config.sdkAppId) {
    throw new Error('请设置SMS_SDK_APP_ID')
  }
  
  if (!config.signName) {
    throw new Error('请设置SMS_SIGN_NAME')
  }
  
  if (!config.templateId) {
    throw new Error('请设置SMS_TEMPLATE_ID')
  }
  
  return new TencentSmsService(config)
}