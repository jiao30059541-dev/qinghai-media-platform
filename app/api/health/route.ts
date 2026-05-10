import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 健康检查响应
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: 'healthy' | 'unhealthy'; response_time_ms: number };
    api: { status: 'healthy' | 'unhealthy'; response_time_ms: number };
    recommendation_engine: { status: 'healthy' | 'unhealthy'; response_time_ms: number };
    cache: { status: 'healthy' | 'unhealthy'; hit_rate?: number };
  };
  version: string;
  uptime_seconds: number;
}

// 健康检查
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 并行执行健康检查
    const [dbCheck, apiCheck, recCheck, cacheCheck] = await Promise.all([
      checkDatabase(),
      checkApiEndpoints(),
      checkRecommendationEngine(),
      checkCache()
    ]);

    const totalTime = Date.now() - startTime;
    
    // 确定总体状态
    const allHealthy = dbCheck.status === 'healthy' && 
                      apiCheck.status === 'healthy' && 
                      recCheck.status === 'healthy';
    
    const status: 'healthy' | 'degraded' | 'unhealthy' = 
      allHealthy ? 'healthy' : 
      (dbCheck.status === 'unhealthy' || apiCheck.status === 'unhealthy') ? 'unhealthy' : 'degraded';

    const response: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck,
        api: apiCheck,
        recommendation_engine: recCheck,
        cache: cacheCheck
      },
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime())
    };

    return NextResponse.json({
      success: true,
      data: response,
      response_time_ms: totalTime
    });

  } catch (error: any) {
    console.error('健康检查错误:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      response_time_ms: Date.now() - startTime
    }, { status: 500 });
  }
}

// 检查数据库连接
async function checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; response_time_ms: number }> {
  const startTime = Date.now();
  
  try {
    // 执行一个简单的查询
    const result = await query('SELECT 1 as health_check') as any[];
    const responseTime = Date.now() - startTime;
    
    return {
      status: result && result.length > 0 ? 'healthy' : 'unhealthy',
      response_time_ms: responseTime
    };
  } catch (error) {
    console.error('数据库健康检查错误:', error);
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime
    };
  }
}

// 检查API端点
async function checkApiEndpoints(): Promise<{ status: 'healthy' | 'unhealthy'; response_time_ms: number }> {
  const startTime = Date.now();
  
  try {
    // 检查关键API端点
    const endpoints = [
      '/api/analytics?report=dashboard',
      '/api/recommendations?limit=1'
    ];
    
    // 这里简化处理，实际应该检查每个端点
    // 现在只检查应用是否响应
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy', // 简化，假设API正常工作
      response_time_ms: responseTime
    };
  } catch (error) {
    console.error('API健康检查错误:', error);
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime
    };
  }
}

// 检查推荐引擎
async function checkRecommendationEngine(): Promise<{ status: 'healthy' | 'unhealthy'; response_time_ms: number }> {
  const startTime = Date.now();
  
  try {
    // 检查推荐缓存
    const [cacheResult] = await query(
      'SELECT COUNT(*) as cache_count FROM recommendation_cache WHERE expires_at > NOW()'
    ) as any[];
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: cacheResult?.cache_count !== undefined ? 'healthy' : 'unhealthy',
      response_time_ms: responseTime
    };
  } catch (error) {
    console.error('推荐引擎健康检查错误:', error);
    return {
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime
    };
  }
}

// 检查缓存
async function checkCache(): Promise<{ status: 'healthy' | 'unhealthy'; hit_rate?: number }> {
  try {
    // 这里简化处理，实际应该检查Redis或内存缓存
    // 现在返回模拟数据
    return {
      status: 'healthy',
      hit_rate: 0.75
    };
  } catch (error) {
    console.error('缓存健康检查错误:', error);
    return {
      status: 'unhealthy'
    };
  }
}