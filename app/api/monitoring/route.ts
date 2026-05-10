import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// 监控指标类型
interface MonitoringMetrics {
  timestamp: string;
  recommendation_system: {
    total_recommendations: number;
    cache_hit_rate: number;
    avg_response_time_ms: number;
    error_rate: number;
    algorithm_distribution: Record<string, number>;
  };
  user_behavior: {
    total_behaviors: number;
    behavior_types: Record<string, number>;
    avg_session_duration: number;
    active_users_24h: number;
  };
  system_performance: {
    memory_usage_mb: number;
    cpu_usage_percent: number;
    database_connections: number;
    uptime_hours: number;
  };
}

// 获取监控指标 - 开发版本（无需认证）
export async function GET(request: NextRequest) {
  try {
    // 开发模式：完全不需要认证
    // 生产环境应该移除这个版本
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: '此API仅用于开发环境' },
        { status: 403 }
      );
    }

    // 获取时间范围参数
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '24h'; // 24h, 7d, 30d

    // 收集监控指标
    const metrics = await collectMonitoringMetrics(timeframe);

    return NextResponse.json({
      success: true,
      data: metrics,
      timeframe,
      collected_at: new Date().toISOString(),
      mode: 'development-no-auth'
    });

  } catch (error: any) {
    console.error('监控系统错误:', error);
    return NextResponse.json(
      { error: '获取监控指标失败', details: error.message },
      { status: 500 }
    );
  }
}

// 收集监控指标
async function collectMonitoringMetrics(timeframe: string): Promise<MonitoringMetrics> {
  const now = new Date();
  let startTime = new Date();
  
  // 根据时间范围设置开始时间
  switch (timeframe) {
    case '1h':
      startTime.setHours(now.getHours() - 1);
      break;
    case '24h':
      startTime.setDate(now.getDate() - 1);
      break;
    case '7d':
      startTime.setDate(now.getDate() - 7);
      break;
    case '30d':
      startTime.setDate(now.getDate() - 30);
      break;
    default:
      startTime.setDate(now.getDate() - 1);
  }

  const startTimeStr = startTime.toISOString().slice(0, 19).replace('T', ' ');

  // 并行收集所有指标
  const [
    recommendationMetrics,
    userBehaviorMetrics,
    systemMetrics
  ] = await Promise.all([
    getRecommendationMetrics(startTimeStr),
    getUserBehaviorMetrics(startTimeStr),
    getSystemMetrics()
  ]);

  return {
    timestamp: now.toISOString(),
    recommendation_system: recommendationMetrics,
    user_behavior: userBehaviorMetrics,
    system_performance: systemMetrics
  };
}

// 获取推荐系统指标
async function getRecommendationMetrics(startTime: string) {
  try {
    // 总推荐数量
    const [totalRecsResult] = await query(
      `SELECT COUNT(*) as total FROM recommendation_cache WHERE created_at >= ?`,
      [startTime]
    ) as any[];

    // 缓存命中率（从缓存中获取的推荐 vs 新生成的推荐）
    const [cacheHitResult] = await query(
      `SELECT 
         COUNT(CASE WHEN created_at = updated_at THEN 1 END) as cache_hits,
         COUNT(*) as total_requests
       FROM recommendation_cache 
       WHERE created_at >= ?`,
      [startTime]
    ) as any[];

    // 算法分布
    const algorithmDistribution = await query(
      `SELECT recommendation_type, COUNT(*) as count
       FROM recommendation_cache 
       WHERE created_at >= ?
       GROUP BY recommendation_type`,
      [startTime]
    ) as any[];

    // 错误率（从日志中估算，这里简化处理）
    const [errorResult] = await query(
      `SELECT COUNT(*) as error_count FROM system_logs 
       WHERE log_level = 'error' 
         AND module = 'recommendation'
         AND created_at >= ?`,
      [startTime]
    ) as any[];

    const totalRequests = cacheHitResult?.total_requests || 1;
    const cacheHits = cacheHitResult?.cache_hits || 0;
    const errorCount = errorResult?.error_count || 0;

    // 转换为分布对象
    const algorithmDistObj: Record<string, number> = {};
    algorithmDistribution.forEach((item: any) => {
      algorithmDistObj[item.recommendation_type] = item.count;
    });

    return {
      total_recommendations: totalRecsResult?.total || 0,
      cache_hit_rate: cacheHits / totalRequests,
      avg_response_time_ms: 150, // 简化，实际应从日志计算
      error_rate: errorCount / Math.max(totalRequests, 1),
      algorithm_distribution: algorithmDistObj
    };

  } catch (error) {
    console.error('获取推荐指标错误:', error);
    return {
      total_recommendations: 0,
      cache_hit_rate: 0,
      avg_response_time_ms: 0,
      error_rate: 0,
      algorithm_distribution: {}
    };
  }
}

// 获取用户行为指标
async function getUserBehaviorMetrics(startTime: string) {
  try {
    // 总行为数量
    const [totalBehaviorsResult] = await query(
      `SELECT COUNT(*) as total FROM user_behaviors WHERE created_at >= ?`,
      [startTime]
    ) as any[];

    // 行为类型分布
    const behaviorTypes = await query(
      `SELECT behavior_type, COUNT(*) as count
       FROM user_behaviors 
       WHERE created_at >= ?
       GROUP BY behavior_type`,
      [startTime]
    ) as any[];

    // 平均会话时长
    const [avgSessionResult] = await query(
      `SELECT AVG(duration_seconds) as avg_duration
       FROM user_behaviors 
       WHERE created_at >= ? AND duration_seconds > 0`,
      [startTime]
    ) as any[];

    // 24小时活跃用户
    const [activeUsersResult] = await query(
      `SELECT COUNT(DISTINCT user_id) as active_users
       FROM user_behaviors 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`,
      []
    ) as any[];

    // 转换为分布对象
    const behaviorTypesObj: Record<string, number> = {};
    behaviorTypes.forEach((item: any) => {
      behaviorTypesObj[item.behavior_type] = item.count;
    });

    return {
      total_behaviors: totalBehaviorsResult?.total || 0,
      behavior_types: behaviorTypesObj,
      avg_session_duration: avgSessionResult?.avg_duration || 0,
      active_users_24h: activeUsersResult?.active_users || 0
    };

  } catch (error) {
    console.error('获取用户行为指标错误:', error);
    return {
      total_behaviors: 0,
      behavior_types: {},
      avg_session_duration: 0,
      active_users_24h: 0
    };
  }
}

// 获取系统性能指标
async function getSystemMetrics() {
  try {
    // 数据库连接数（简化）
    const [dbConnectionsResult] = await query(
      `SHOW STATUS LIKE 'Threads_connected'`,
      []
    ) as any[];

    // 系统运行时间（从PM2或系统获取，这里简化）
    const uptimeHours = 24; // 简化

    return {
      memory_usage_mb: Math.floor(Math.random() * 500) + 100, // 模拟数据
      cpu_usage_percent: Math.floor(Math.random() * 30) + 10, // 模拟数据
      database_connections: dbConnectionsResult?.Value || 0,
      uptime_hours: uptimeHours
    };

  } catch (error) {
    console.error('获取系统指标错误:', error);
    return {
      memory_usage_mb: 0,
      cpu_usage_percent: 0,
      database_connections: 0,
      uptime_hours: 0
    };
  }
}

// 记录监控数据（开发版本）
export async function POST(request: NextRequest) {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: '此API仅用于开发环境' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { module, metric_name, metric_value, metadata } = body;

    if (!module || !metric_name || metric_value === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 插入监控数据
    await query(
      `INSERT INTO system_metrics 
       (module, metric_name, metric_value, metadata)
       VALUES (?, ?, ?, ?)`,
      [module, metric_name, metric_value, JSON.stringify(metadata || {})]
    );

    return NextResponse.json({
      success: true,
      message: '监控数据记录成功',
      module,
      metric_name,
      metric_value
    });

  } catch (error: any) {
    console.error('记录监控数据错误:', error);
    return NextResponse.json(
      { error: '记录监控数据失败', details: error.message },
      { status: 500 }
    );
  }
}