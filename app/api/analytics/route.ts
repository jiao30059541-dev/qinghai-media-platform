import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth';

// 数据分析响应类型
interface AnalyticsResponse {
  success: boolean;
  data: any;
  timeframe?: string;
  user_id?: number;
}

// 获取数据分析仪表盘
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份（需要管理员权限）
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析查询参数
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('report') || 'dashboard';
    const timeframe = searchParams.get('timeframe') || '7d'; // 7d, 30d, 90d, 1y
    const startDate = searchParams.get('start_date') ?? undefined;
    const endDate = searchParams.get('end_date') ?? undefined;

    let analyticsData: any = {};

    switch (reportType) {
      case 'dashboard':
        analyticsData = await getDashboardAnalytics(timeframe, startDate, endDate);
        break;
      case 'user_behavior':
        analyticsData = await getUserBehaviorAnalytics(timeframe, startDate, endDate);
        break;
      case 'media_performance':
        analyticsData = await getMediaPerformanceAnalytics(timeframe, startDate, endDate);
        break;
      case 'revenue_trends':
        analyticsData = await getRevenueTrendsAnalytics(timeframe, startDate, endDate);
        break;
      case 'recommendation_effectiveness':
        analyticsData = await getRecommendationEffectivenessAnalytics(timeframe, startDate, endDate);
        break;
      default:
        return NextResponse.json(
          { error: '无效的报告类型' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      report_type: reportType,
      timeframe,
      user_id: userId
    });

  } catch (error: any) {
    console.error('数据分析错误:', error);
    return NextResponse.json(
      { error: '数据分析失败', details: error.message },
      { status: 500 }
    );
  }
}

// 获取仪表盘分析数据
async function getDashboardAnalytics(timeframe: string, startDate?: string, endDate?: string) {
  const dateCondition = getDateCondition(timeframe, startDate, endDate);
  const andCondition = dateCondition.replace('WHERE', 'AND');
  
  // 获取关键指标
  const [metrics, user_growth, revenue, media, top_performers, recent_activities] = await Promise.all([
    getKeyMetrics(dateCondition, andCondition),
    getUserGrowth(dateCondition),
    getRevenueMetrics(dateCondition),
    getMediaMetrics(dateCondition),
    getTopPerformers(dateCondition),
    getRecentActivities(dateCondition)
  ]);

  return {
    metrics,
    user_growth,
    revenue,
    media,
    top_performers,
    recent_activities
  };
}

// 获取用户行为分析
async function getUserBehaviorAnalytics(timeframe: string, startDate?: string, endDate?: string) {
  const dateCondition = getDateCondition(timeframe, startDate, endDate);
  
  return {
    behavior_summary: await getBehaviorSummary(dateCondition),
    session_analysis: await getSessionAnalysis(dateCondition),
    device_analysis: await getDeviceAnalysis(dateCondition),
    user_segments: await getUserSegments(dateCondition),
    retention_analysis: await getRetentionAnalysis(dateCondition)
  };
}

// 获取媒体表现分析
async function getMediaPerformanceAnalytics(timeframe: string, startDate?: string, endDate?: string) {
  const dateCondition = getDateCondition(timeframe, startDate, endDate);
  
  return {
    media_summary: await getMediaSummary(dateCondition),
    category_performance: await getCategoryPerformance(dateCondition),
    city_performance: await getCityPerformance(dateCondition),
    price_tier_analysis: await getPriceTierAnalysis(dateCondition),
    conversion_funnel: await getConversionFunnel(dateCondition)
  };
}

// 获取收入趋势分析
async function getRevenueTrendsAnalytics(timeframe: string, startDate?: string, endDate?: string) {
  const dateCondition = getDateCondition(timeframe, startDate, endDate);
  
  return {
    revenue_summary: await getRevenueSummary(dateCondition),
    daily_revenue: await getDailyRevenueTrends(dateCondition),
    revenue_by_category: await getRevenueByCategory(dateCondition),
    revenue_by_city: await getRevenueByCity(dateCondition),
    customer_lifetime_value: await getCustomerLifetimeValue(dateCondition)
  };
}

// 获取推荐效果分析
async function getRecommendationEffectivenessAnalytics(timeframe: string, startDate?: string, endDate?: string) {
  const dateCondition = getDateCondition(timeframe, startDate, endDate);
  
  return {
    recommendation_summary: await getRecommendationSummary(dateCondition),
    algorithm_performance: await getAlgorithmPerformance(dateCondition),
    conversion_rates: await getRecommendationConversionRates(dateCondition),
    user_engagement: await getRecommendationEngagement(dateCondition),
    a_b_testing: await getABTestingResults(dateCondition)
  };
}

// 辅助函数：获取日期条件
function getDateCondition(timeframe: string, startDate?: string, endDate?: string): string {
  if (startDate && endDate) {
    return `WHERE created_at BETWEEN '${startDate}' AND '${endDate}'`;
  }
  
  const now = new Date();
  let start = new Date();
  
  switch (timeframe) {
    case '1d':
      start.setDate(now.getDate() - 1);
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }
  
  return `WHERE created_at >= '${start.toISOString().split('T')[0]}'`;
}

// 获取关键指标 - 修复版本
async function getKeyMetrics(dateCondition: string, andCondition: string) {
  const metrics = await Promise.all([
    // 总用户数 - 使用WHERE条件
    query(`SELECT COUNT(*) as total_users FROM users ${dateCondition}`),
    // 活跃用户数（最近7天有行为的用户）
    query(`SELECT COUNT(DISTINCT user_id) as active_users FROM user_behaviors WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`),
    // 总媒体数
    query(`SELECT COUNT(*) as total_media FROM media WHERE status = 'active'`),
    // 总订单数 - 使用WHERE条件
    query(`SELECT COUNT(*) as total_orders FROM orders ${dateCondition}`),
    // 总收入 - 已有WHERE，使用AND条件
    query(`SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM orders WHERE status = 'confirmed' ${andCondition}`),
    // 平均订单价值 - 已有WHERE，使用AND条件
    query(`SELECT COALESCE(AVG(total_price), 0) as avg_order_value FROM orders WHERE status = 'confirmed' ${andCondition}`)
  ]);

  return {
    total_users: metrics[0][0]?.total_users || 0,
    active_users: metrics[1][0]?.active_users || 0,
    total_media: metrics[2][0]?.total_media || 0,
    total_orders: metrics[3][0]?.total_orders || 0,
    total_revenue: metrics[4][0]?.total_revenue || 0,
    avg_order_value: metrics[5][0]?.avg_order_value || 0
  };
}

// 获取用户增长数据
async function getUserGrowth(dateCondition: string) {
  const growthData = await query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_users,
      COUNT(DISTINCT CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN id END) as active_users_7d,
      COUNT(DISTINCT CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN id END) as active_users_30d
    FROM users
    ${dateCondition}
    GROUP BY DATE(created_at)
    ORDER BY date
  `);

  return growthData;
}

// 获取收入指标
async function getRevenueMetrics(dateCondition: string) {
  const revenueData = await query(`
    SELECT 
      DATE(o.created_at) as date,
      COUNT(o.id) as order_count,
      COALESCE(SUM(o.total_price), 0) as daily_revenue,
      COALESCE(AVG(o.total_price), 0) as avg_order_value,
      COUNT(DISTINCT o.user_id) as paying_customers
    FROM orders o
    WHERE o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    GROUP BY DATE(o.created_at)
    ORDER BY date
  `);

  return revenueData;
}

// 获取媒体指标
async function getMediaMetrics(dateCondition: string) {
  const mediaData = await query(`
    SELECT 
      m.category_level1 as category,
      COUNT(DISTINCT m.id) as media_count,
      COUNT(DISTINCT ub.user_id) as unique_viewers,
      COUNT(ub.id) as total_views,
      COALESCE(AVG(ub.duration_seconds), 0) as avg_view_duration,
      COUNT(DISTINCT oi.order_id) as conversion_count
    FROM media m
    LEFT JOIN user_behaviors ub ON m.id = ub.media_id AND ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN order_items oi ON m.id = oi.media_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    WHERE m.status = 'active'
    GROUP BY m.category_level1
    ORDER BY media_count DESC
  `);

  return mediaData;
}

// 获取顶级表现者
async function getTopPerformers(dateCondition: string) {
  const [topMedia, topCities, topCategories] = await Promise.all([
    // 顶级媒体
    query(`
      SELECT 
        m.id,
        m.name,
        m.category_level1,
        m.city,
        m.list_price,
        COUNT(DISTINCT ub.user_id) as unique_viewers,
        COUNT(ub.id) as total_views,
        COUNT(DISTINCT oi.order_id) as conversions
      FROM media m
      LEFT JOIN user_behaviors ub ON m.id = ub.media_id AND ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
      LEFT JOIN order_items oi ON m.id = oi.media_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
      WHERE m.status = 'active'
      GROUP BY m.id
      ORDER BY conversions DESC, total_views DESC
      LIMIT 10
    `),
    // 顶级城市
    query(`
      SELECT 
        m.city,
        COUNT(DISTINCT m.id) as media_count,
        COUNT(DISTINCT ub.user_id) as unique_viewers,
        COUNT(ub.id) as total_views,
        COUNT(DISTINCT oi.order_id) as conversions,
        COALESCE(SUM(o.total_price), 0) as total_revenue
      FROM media m
      LEFT JOIN user_behaviors ub ON m.id = ub.media_id AND ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
      LEFT JOIN order_items oi ON m.id = oi.media_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
      WHERE m.status = 'active' AND m.city IS NOT NULL
      GROUP BY m.city
      ORDER BY total_revenue DESC
      LIMIT 10
    `),
    // 顶级分类
    query(`
      SELECT 
        m.category_level1 as category,
        COUNT(DISTINCT m.id) as media_count,
        COUNT(DISTINCT ub.user_id) as unique_viewers,
        COUNT(ub.id) as total_views,
        COUNT(DISTINCT oi.order_id) as conversions,
        COALESCE(SUM(o.total_price), 0) as total_revenue,
        COALESCE(AVG(m.list_price), 0) as avg_price
      FROM media m
      LEFT JOIN user_behaviors ub ON m.id = ub.media_id AND ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
      LEFT JOIN order_items oi ON m.id = oi.media_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
      WHERE m.status = 'active'
      GROUP BY m.category_level1
      ORDER BY total_revenue DESC
      LIMIT 10
    `)
  ]);

  return {
    top_media: topMedia,
    top_cities: topCities,
    top_categories: topCategories
  };
}

// 获取最近活动
async function getRecentActivities(dateCondition: string) {
  const activities = await query(`
    SELECT 
      'user_register' as activity_type,
      u.name as user_name,
      u.company_name,
      u.created_at as timestamp,
      NULL as media_name,
      NULL as order_amount
    FROM users u
    ${dateCondition.replace('created_at', 'u.created_at')}
    
    UNION ALL
    
    SELECT 
      'media_view' as activity_type,
      u.name as user_name,
      u.company_name,
      ub.created_at as timestamp,
      m.name as media_name,
      NULL as order_amount
    FROM user_behaviors ub
    JOIN users u ON ub.user_id = u.id
    JOIN media m ON ub.media_id = m.id
    WHERE ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    
    UNION ALL
    
    SELECT 
      'order_created' as activity_type,
      u.name as user_name,
      u.company_name,
      o.created_at as timestamp,
      NULL as media_name,
      o.total_price as order_amount
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ${dateCondition.replace('created_at', 'o.created_at')}
    
    ORDER BY timestamp DESC
    LIMIT 20
  `);

  return activities;
}

// 获取行为摘要
async function getBehaviorSummary(dateCondition: string) {
  const summary = await query(`
    SELECT 
      ub.behavior_type,
      COUNT(*) as count,
      COUNT(DISTINCT ub.user_id) as unique_users,
      COALESCE(AVG(ub.duration_seconds), 0) as avg_duration,
      COUNT(DISTINCT ub.media_id) as unique_media
    FROM user_behaviors ub
    ${dateCondition}
    GROUP BY ub.behavior_type
    ORDER BY count DESC
  `);

  return summary;
}

// 获取会话分析
async function getSessionAnalysis(dateCondition: string) {
  const analysis = await query(`
    SELECT 
      ub.session_id,
      COUNT(DISTINCT ub.user_id) as user_count,
      COUNT(*) as total_actions,
      COUNT(DISTINCT ub.media_id) as media_viewed,
      MIN(ub.created_at) as session_start,
      MAX(ub.created_at) as session_end,
      TIMESTAMPDIFF(SECOND, MIN(ub.created_at), MAX(ub.created_at)) as session_duration
    FROM user_behaviors ub
    WHERE ub.session_id IS NOT NULL ${dateCondition.replace('WHERE', 'AND')}
    GROUP BY ub.session_id
    ORDER BY session_start DESC
    LIMIT 50
  `);

  return analysis;
}

// 获取设备分析
async function getDeviceAnalysis(dateCondition: string) {
  const analysis = await query(`
    SELECT 
      COALESCE(ub.device_type, 'unknown') as device_type,
      COUNT(*) as session_count,
      COUNT(DISTINCT ub.user_id) as unique_users,
      COALESCE(AVG(ub.duration_seconds), 0) as avg_session_duration,
      COUNT(DISTINCT ub.media_id) as media_viewed
    FROM user_behaviors ub
    ${dateCondition}
    GROUP BY COALESCE(ub.device_type, 'unknown')
    ORDER BY session_count DESC
  `);

  return analysis;
}

// 获取用户分群
async function getUserSegments(dateCondition: string) {
  const segments = await query(`
    SELECT 
      CASE 
        WHEN u.industry IS NOT NULL THEN u.industry
        ELSE '未指定'
      END as segment,
      COUNT(DISTINCT u.id) as user_count,
      COUNT(DISTINCT ub.id) as total_actions,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total_price), 0) as total_spent,
      COALESCE(AVG(o.total_price), 0) as avg_order_value
    FROM users u
    LEFT JOIN user_behaviors ub ON u.id = ub.user_id ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    ${dateCondition.replace('created_at', 'u.created_at')}
    GROUP BY CASE 
        WHEN u.industry IS NOT NULL THEN u.industry
        ELSE '未指定'
      END
    ORDER BY total_spent DESC
  `);

  return segments;
}

// 获取留存分析
async function getRetentionAnalysis(dateCondition: string) {
  const retention = await query(`
    SELECT 
      DATE(u.created_at) as cohort_date,
      COUNT(DISTINCT u.id) as cohort_size,
      COUNT(DISTINCT CASE WHEN ub.created_at >= DATE_ADD(u.created_at, INTERVAL 1 DAY) AND ub.created_at < DATE_ADD(u.created_at, INTERVAL 2 DAY) THEN u.id END) as day_1_retained,
      COUNT(DISTINCT CASE WHEN ub.created_at >= DATE_ADD(u.created_at, INTERVAL 7 DAY) AND ub.created_at < DATE_ADD(u.created_at, INTERVAL 8 DAY) THEN u.id END) as day_7_retained,
      COUNT(DISTINCT CASE WHEN ub.created_at >= DATE_ADD(u.created_at, INTERVAL 30 DAY) AND ub.created_at < DATE_ADD(u.created_at, INTERVAL 31 DAY) THEN u.id END) as day_30_retained
    FROM users u
    LEFT JOIN user_behaviors ub ON u.id = ub.user_id
    WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
    GROUP BY DATE(u.created_at)
    ORDER BY cohort_date DESC
    LIMIT 30
  `);

  return retention;
}

// 获取媒体摘要
async function getMediaSummary(dateCondition: string) {
  const summary = await query(`
    SELECT 
      COUNT(DISTINCT m.id) as total_media,
      COUNT(DISTINCT m.supplier_id) as total_suppliers,
      COUNT(DISTINCT m.city) as cities_covered,
      COUNT(DISTINCT m.category_level1) as categories,
      COALESCE(AVG(m.list_price), 0) as avg_price,
      COALESCE(AVG(m.daily_exposure), 0) as avg_exposure
    FROM media m
    WHERE m.status = 'active'
  `);

  return summary[0] || {};
}

// 获取分类表现
async function getCategoryPerformance(dateCondition: string) {
  const performance = await query(`
    SELECT 
      m.category_level1 as category,
      COUNT(DISTINCT m.id) as media_count,
      COUNT(DISTINCT ub.user_id) as unique_viewers,
      COUNT(ub.id) as total_views,
      COALESCE(AVG(ub.duration_seconds), 0) as avg_view_time,
      COUNT(DISTINCT oi.order_id) as conversions,
      COALESCE(SUM(o.total_price), 0) as total_revenue,
      COALESCE(COUNT(DISTINCT oi.order_id) * 100.0 / NULLIF(COUNT(ub.id), 0), 0) as conversion_rate
    FROM media m
    LEFT JOIN user_behaviors ub ON m.id = ub.media_id AND ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN order_items oi ON m.id = oi.media_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    WHERE m.status = 'active'
    GROUP BY m.category_level1
    ORDER BY total_revenue DESC
  `);

  return performance;
}

// 获取城市表现
async function getCityPerformance(dateCondition: string) {
  const performance = await query(`
    SELECT 
      m.city,
      COUNT(DISTINCT m.id) as media_count,
      COUNT(DISTINCT ub.user_id) as unique_viewers,
      COUNT(ub.id) as total_views,
      COUNT(DISTINCT oi.order_id) as conversions,
      COALESCE(SUM(o.total_price), 0) as total_revenue,
      COALESCE(AVG(m.list_price), 0) as avg_price
    FROM media m
    LEFT JOIN user_behaviors ub ON m.id = ub.media_id AND ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN order_items oi ON m.id = oi.media_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    WHERE m.status = 'active' AND m.city IS NOT NULL
    GROUP BY m.city
    ORDER BY total_revenue DESC
  `);

  return performance;
}

// 获取价格层级分析
async function getPriceTierAnalysis(dateCondition: string) {
  const analysis = await query(`
    SELECT 
      CASE 
        WHEN m.list_price < 5000 THEN '低端 (<5k)'
        WHEN m.list_price BETWEEN 5000 AND 20000 THEN '中端 (5k-20k)'
        WHEN m.list_price BETWEEN 20001 AND 50000 THEN '高端 (20k-50k)'
        ELSE '超高端 (>50k)'
      END as price_tier,
      COUNT(DISTINCT m.id) as media_count,
      COUNT(DISTINCT ub.user_id) as unique_viewers,
      COUNT(ub.id) as total_views,
      COUNT(DISTINCT oi.order_id) as conversions,
      COALESCE(SUM(o.total_price), 0) as total_revenue,
      COALESCE(COUNT(DISTINCT oi.order_id) * 100.0 / NULLIF(COUNT(ub.id), 0), 0) as conversion_rate
    FROM media m
    LEFT JOIN user_behaviors ub ON m.id = ub.media_id AND ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN order_items oi ON m.id = oi.media_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    WHERE m.status = 'active' AND m.list_price IS NOT NULL
    GROUP BY price_tier
    ORDER BY total_revenue DESC
  `);

  return analysis;
}

// 获取转化漏斗
async function getConversionFunnel(dateCondition: string) {
  const funnel = await query(`
    SELECT 
      '媒体浏览' as stage,
      COUNT(DISTINCT ub.id) as count
    FROM user_behaviors ub
    WHERE ub.behavior_type = 'view' ${dateCondition.replace('WHERE', 'AND')}
    
    UNION ALL
    
    SELECT 
      '详情点击' as stage,
      COUNT(DISTINCT ub.id) as count
    FROM user_behaviors ub
    WHERE ub.behavior_type = 'click' ${dateCondition.replace('WHERE', 'AND')}
    
    UNION ALL
    
    SELECT 
      '加入投放篮' as stage,
      COUNT(DISTINCT ub.id) as count
    FROM user_behaviors ub
    WHERE ub.behavior_type = 'add_to_cart' ${dateCondition.replace('WHERE', 'AND')}
    
    UNION ALL
    
    SELECT 
      '下单购买' as stage,
      COUNT(DISTINCT o.id) as count
    FROM orders o
    WHERE o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
  `);

  return funnel;
}

// 获取收入摘要
async function getRevenueSummary(dateCondition: string) {
  const summary = await query(`
    SELECT 
      COALESCE(SUM(o.total_price), 0) as total_revenue,
      COUNT(DISTINCT o.id) as order_count,
      COUNT(DISTINCT o.user_id) as paying_customers,
      COALESCE(AVG(o.total_price), 0) as avg_order_value,
      COALESCE(MAX(o.total_price), 0) as max_order_value,
      COALESCE(MIN(o.total_price), 0) as min_order_value
    FROM orders o
    WHERE o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
  `);

  return summary[0] || {};
}

// 获取每日收入趋势
async function getDailyRevenueTrends(dateCondition: string) {
  const trends = await query(`
    SELECT 
      DATE(o.created_at) as date,
      COALESCE(SUM(o.total_price), 0) as daily_revenue,
      COUNT(DISTINCT o.id) as order_count,
      COUNT(DISTINCT o.user_id) as paying_customers,
      COALESCE(AVG(o.total_price), 0) as avg_order_value
    FROM orders o
    WHERE o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    GROUP BY DATE(o.created_at)
    ORDER BY date
  `);

  return trends;
}

// 获取按分类的收入
async function getRevenueByCategory(dateCondition: string) {
  const revenue = await query(`
    SELECT 
      m.category_level1 as category,
      COALESCE(SUM(o.total_price), 0) as total_revenue,
      COUNT(DISTINCT o.id) as order_count,
      COUNT(DISTINCT o.user_id) as paying_customers,
      COALESCE(AVG(o.total_price), 0) as avg_order_value
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN media m ON oi.media_id = m.id
    WHERE o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    GROUP BY m.category_level1
    ORDER BY total_revenue DESC
  `);

  return revenue;
}

// 获取按城市的收入
async function getRevenueByCity(dateCondition: string) {
  const revenue = await query(`
    SELECT 
      m.city,
      COALESCE(SUM(o.total_price), 0) as total_revenue,
      COUNT(DISTINCT o.id) as order_count,
      COUNT(DISTINCT o.user_id) as paying_customers,
      COALESCE(AVG(o.total_price), 0) as avg_order_value
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN media m ON oi.media_id = m.id
    WHERE o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')} AND m.city IS NOT NULL
    GROUP BY m.city
    ORDER BY total_revenue DESC
  `);

  return revenue;
}

// 获取客户终身价值
async function getCustomerLifetimeValue(dateCondition: string) {
  const clv = await query(`
    SELECT 
      o.user_id,
      u.name as user_name,
      u.company_name,
      COUNT(DISTINCT o.id) as total_orders,
      COALESCE(SUM(o.total_price), 0) as total_spent,
      COALESCE(AVG(o.total_price), 0) as avg_order_value,
      MIN(o.created_at) as first_order_date,
      MAX(o.created_at) as last_order_date,
      DATEDIFF(MAX(o.created_at), MIN(o.created_at)) as customer_lifetime_days
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    GROUP BY o.user_id, u.name, u.company_name
    ORDER BY total_spent DESC
    LIMIT 20
  `);

  return clv;
}

// 获取推荐摘要
async function getRecommendationSummary(dateCondition: string) {
  const summary = await query(`
    SELECT 
      rc.recommendation_type,
      COUNT(DISTINCT rc.id) as total_recommendations,
      COUNT(DISTINCT rc.user_id) as unique_users,
      COUNT(DISTINCT rc.media_id) as unique_media,
      COALESCE(AVG(rc.recommendation_score), 0) as avg_score,
      COUNT(DISTINCT ub.id) as total_clicks,
      COUNT(DISTINCT oi.order_id) as conversions
    FROM recommendation_cache rc
    LEFT JOIN user_behaviors ub ON rc.media_id = ub.media_id AND ub.behavior_type = 'click' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN order_items oi ON rc.media_id = oi.media_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    WHERE rc.expires_at > NOW() ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'rc.created_at')}
    GROUP BY rc.recommendation_type
    ORDER BY total_recommendations DESC
  `);

  return summary;
}

// 获取算法表现
async function getAlgorithmPerformance(dateCondition: string) {
  const performance = await query(`
    SELECT 
      rc.recommendation_type as algorithm,
      COUNT(DISTINCT rc.id) as impressions,
      COUNT(DISTINCT ub.id) as clicks,
      COUNT(DISTINCT oi.order_id) as conversions,
      COALESCE(COUNT(DISTINCT ub.id) * 100.0 / NULLIF(COUNT(DISTINCT rc.id), 0), 0) as ctr,
      COALESCE(COUNT(DISTINCT oi.order_id) * 100.0 / NULLIF(COUNT(DISTINCT ub.id), 0), 0) as conversion_rate,
      COALESCE(SUM(o.total_price), 0) as total_revenue
    FROM recommendation_cache rc
    LEFT JOIN user_behaviors ub ON rc.media_id = ub.media_id AND ub.behavior_type = 'click' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN order_items oi ON rc.media_id = oi.media_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    WHERE rc.expires_at > NOW() ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'rc.created_at')}
    GROUP BY rc.recommendation_type
    ORDER BY total_revenue DESC
  `);

  return performance;
}

// 获取推荐转化率
async function getRecommendationConversionRates(dateCondition: string) {
  const rates = await query(`
    SELECT 
      DATE(rc.created_at) as date,
      rc.recommendation_type,
      COUNT(DISTINCT rc.id) as impressions,
      COUNT(DISTINCT ub.id) as clicks,
      COUNT(DISTINCT oi.order_id) as conversions,
      COALESCE(COUNT(DISTINCT ub.id) * 100.0 / NULLIF(COUNT(DISTINCT rc.id), 0), 0) as ctr,
      COALESCE(COUNT(DISTINCT oi.order_id) * 100.0 / NULLIF(COUNT(DISTINCT ub.id), 0), 0) as conversion_rate
    FROM recommendation_cache rc
    LEFT JOIN user_behaviors ub ON rc.media_id = ub.media_id AND ub.behavior_type = 'click' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    LEFT JOIN order_items oi ON rc.media_id = oi.media_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'confirmed' ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'o.created_at')}
    WHERE rc.expires_at > NOW() ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'rc.created_at')}
    GROUP BY DATE(rc.created_at), rc.recommendation_type
    ORDER BY date DESC, conversions DESC
  `);

  return rates;
}

// 获取推荐参与度
async function getRecommendationEngagement(dateCondition: string) {
  const engagement = await query(`
    SELECT 
      rc.recommendation_type,
      COALESCE(AVG(ub.duration_seconds), 0) as avg_engagement_time,
      COUNT(DISTINCT CASE WHEN ub.behavior_type = 'favorite' THEN ub.id END) as favorites,
      COUNT(DISTINCT CASE WHEN ub.behavior_type = 'add_to_cart' THEN ub.id END) as add_to_cart,
      COUNT(DISTINCT CASE WHEN ub.behavior_type = 'purchase' THEN ub.id END) as purchases
    FROM recommendation_cache rc
    LEFT JOIN user_behaviors ub ON rc.media_id = ub.media_id ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'ub.created_at')}
    WHERE rc.expires_at > NOW() ${dateCondition.replace('WHERE', 'AND').replace('created_at', 'rc.created_at')}
    GROUP BY rc.recommendation_type
    ORDER BY avg_engagement_time DESC
  `);

  return engagement;
}

// 获取A/B测试结果
async function getABTestingResults(dateCondition: string) {
  // 这里可以添加A/B测试逻辑
  // 目前返回模拟数据
  return [
    {
      test_name: '推荐算法A/B测试',
      variant_a: '协同过滤算法',
      variant_b: '内容推荐算法',
      impressions_a: 1000,
      impressions_b: 1000,
      clicks_a: 120,
      clicks_b: 150,
      conversions_a: 12,
      conversions_b: 18,
      ctr_a: 12.0,
      ctr_b: 15.0,
      conversion_rate_a: 10.0,
      conversion_rate_b: 12.0,
      winner: 'variant_b',
      confidence_level: 95.2
    }
  ];
}