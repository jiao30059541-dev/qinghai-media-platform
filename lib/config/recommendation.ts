// 推荐系统配置
// 这个文件包含推荐算法的可调参数

// 算法权重类型定义
interface PopularWeights {
  userCountWeight: number;
  behaviorWeight: number;
  exposureWeight: number;
  minUsers: number;
  timeWindowDays: number;
}

interface CollaborativeWeights {
  userSimilarityWeight: number;
  behaviorWeight: number;
  minSimilarUsers: number;
  timeWindowDays: number;
}

interface ContentWeights {
  similarityWeight: number;
  behaviorWeight: number;
  timeWindowDays: number;
}

interface PersonalizedWeights {
  interestWeight: number;
  categoryMatchWeight: number;
  cityMatchWeight: number;
  minInterestScore: number;
}

interface HybridWeights {
  personalized: number;
  collaborative: number;
  content: number;
  popular: number;
}

type AlgorithmWeights = PopularWeights | CollaborativeWeights | ContentWeights | PersonalizedWeights | HybridWeights;

interface BehaviorWeights {
  view: number;
  click: number;
  favorite: number;
  add_to_cart: number;
  purchase: number;
  [key: string]: number;
}

interface CacheConfig {
  ttlHours: number;
  maxRecommendations: number;
  cleanupIntervalHours: number;
}

interface InterestConfig {
  timeWindowDays: number;
  decayFactor: number;
  minBehaviorCount: number;
}

interface PerformanceConfig {
  batchSize: number;
  timeoutMs: number;
  maxRetries: number;
}

interface ABTestConfig {
  enabled: boolean;
  defaultAlgorithm: string;
  variants: Array<{ name: string; algorithm: string; weight: number }>;
  metrics: string[];
}

interface MonitoringConfig {
  enabled: boolean;
  logLevel: string;
  metricsIntervalMinutes: number;
  alertThresholds: {
    errorRate: number;
    latencyMs: number;
    cacheHitRate: number;
  };
}

interface ExperimentalConfig {
  deepLearningEnabled: boolean;
  realTimeUpdates: boolean;
  coldStartStrategy: string;
}

interface RecommendationConfigType {
  algorithmWeights: {
    popular: PopularWeights;
    collaborative: CollaborativeWeights;
    content: ContentWeights;
    personalized: PersonalizedWeights;
    hybrid: HybridWeights;
  };
  behaviorWeights: BehaviorWeights;
  cache: CacheConfig;
  interests: InterestConfig;
  performance: PerformanceConfig;
  abTesting: ABTestConfig;
  monitoring: MonitoringConfig;
  experimental: ExperimentalConfig;
}

export const RecommendationConfig: RecommendationConfigType = {
  // 算法权重配置
  algorithmWeights: {
    // 热门推荐权重
    popular: {
      userCountWeight: 0.5,      // 用户数量权重
      behaviorWeight: 0.3,       // 行为权重
      exposureWeight: 0.2,       // 曝光量权重
      minUsers: 1,               // 最小用户数
      timeWindowDays: 7,         // 时间窗口（天）
    },
    
    // 协同过滤权重
    collaborative: {
      userSimilarityWeight: 0.1, // 用户相似度权重
      behaviorWeight: 1.0,       // 行为权重
      minSimilarUsers: 1,        // 最小相似用户数
      timeWindowDays: 7,         // 时间窗口（天）
    },
    
    // 内容推荐权重
    content: {
      similarityWeight: 0.8,     // 相似度权重
      behaviorWeight: 0.2,       // 行为权重
      timeWindowDays: 30,        // 时间窗口（天）
    },
    
    // 个性化推荐权重
    personalized: {
      interestWeight: 0.7,       // 兴趣权重
      categoryMatchWeight: 0.3,  // 分类匹配权重
      cityMatchWeight: 0.2,      // 城市匹配权重
      minInterestScore: 0.3,     // 最小兴趣分数
    },
    
    // 混合推荐权重（当使用'all'类型时）
    hybrid: {
      personalized: 0.4,         // 个性化推荐权重
      collaborative: 0.3,        // 协同过滤权重
      content: 0.2,              // 内容推荐权重
      popular: 0.1,              // 热门推荐权重
    },
  },
  
  // 行为权重映射
  behaviorWeights: {
    view: 0.2,      // 浏览
    click: 0.5,     // 点击
    favorite: 0.8,  // 收藏
    add_to_cart: 1.0, // 加入投放篮
    purchase: 1.5,  // 购买
  },
  
  // 推荐缓存配置
  cache: {
    ttlHours: 1,           // 缓存有效期（小时）
    maxRecommendations: 50, // 最大推荐数量
    cleanupIntervalHours: 24, // 清理间隔（小时）
  },
  
  // 用户兴趣配置
  interests: {
    timeWindowDays: 30,    // 兴趣计算时间窗口
    decayFactor: 0.95,     // 衰减因子（每天）
    minBehaviorCount: 3,   // 最小行为数量
  },
  
  // 性能配置
  performance: {
    batchSize: 100,        // 批量处理大小
    timeoutMs: 5000,       // 超时时间（毫秒）
    maxRetries: 3,         // 最大重试次数
  },
  
  // A/B测试配置
  abTesting: {
    enabled: true,         // 是否启用A/B测试
    defaultAlgorithm: 'hybrid', // 默认算法
    variants: [
      { name: 'A', algorithm: 'hybrid', weight: 0.5 },
      { name: 'B', algorithm: 'personalized', weight: 0.3 },
      { name: 'C', algorithm: 'popular', weight: 0.2 },
    ],
    metrics: ['ctr', 'conversion_rate', 'revenue'], // 评估指标
  },
  
  // 监控配置
  monitoring: {
    enabled: true,
    logLevel: 'info',      // 日志级别：debug, info, warn, error
    metricsIntervalMinutes: 5, // 指标收集间隔（分钟）
    alertThresholds: {
      errorRate: 0.05,     // 错误率阈值
      latencyMs: 1000,     // 延迟阈值（毫秒）
      cacheHitRate: 0.7,   // 缓存命中率阈值
    },
  },
  
  // 实验性功能
  experimental: {
    deepLearningEnabled: false, // 深度学习推荐
    realTimeUpdates: true,      // 实时更新
    coldStartStrategy: 'popular', // 冷启动策略
  },
};

// 获取热门推荐权重
export function getPopularWeights(): PopularWeights {
  return RecommendationConfig.algorithmWeights.popular;
}

// 获取协同过滤权重
export function getCollaborativeWeights(): CollaborativeWeights {
  return RecommendationConfig.algorithmWeights.collaborative;
}

// 获取内容推荐权重
export function getContentWeights(): ContentWeights {
  return RecommendationConfig.algorithmWeights.content;
}

// 获取个性化推荐权重
export function getPersonalizedWeights(): PersonalizedWeights {
  return RecommendationConfig.algorithmWeights.personalized;
}

// 获取混合推荐权重
export function getHybridWeights(): HybridWeights {
  return RecommendationConfig.algorithmWeights.hybrid;
}

// 获取行为权重
export function getBehaviorWeight(behaviorType: string): number {
  return RecommendationConfig.behaviorWeights[behaviorType] || 1.0;
}

// 获取行为权重映射
export function getBehaviorWeights(): BehaviorWeights {
  return RecommendationConfig.behaviorWeights;
}

// 获取缓存配置
export function getCacheConfig(): CacheConfig {
  return RecommendationConfig.cache;
}

// 获取兴趣配置
export function getInterestConfig(): InterestConfig {
  return RecommendationConfig.interests;
}

// 获取A/B测试配置
export function getABTestingConfig(): ABTestConfig {
  return RecommendationConfig.abTesting;
}

// 获取监控配置
export function getMonitoringConfig(): MonitoringConfig {
  return RecommendationConfig.monitoring;
}

// 获取实验性配置
export function getExperimentalConfig(): ExperimentalConfig {
  return RecommendationConfig.experimental;
}

// 计算推荐分数（示例函数）
export function calculateRecommendationScore(
  algorithmType: string,
  metrics: Record<string, number>
): number {
  let score = 0;
  
  switch (algorithmType) {
    case 'popular': {
      const weights = getPopularWeights();
      score = 
        (metrics.userCount || 0) * weights.userCountWeight +
        (metrics.avgBehaviorWeight || 0) * weights.behaviorWeight +
        Math.log((metrics.exposure || 1) + 1) * weights.exposureWeight;
      break;
    }
      
    case 'collaborative': {
      const weights = getCollaborativeWeights();
      score = 
        (metrics.similarUserCount || 0) * weights.userSimilarityWeight +
        (metrics.avgBehaviorWeight || 0) * weights.behaviorWeight;
      break;
    }
      
    case 'content': {
      const weights = getContentWeights();
      score = 
        (metrics.similarity || 0) * weights.similarityWeight +
        (metrics.behaviorWeight || 0) * weights.behaviorWeight;
      break;
    }
      
    case 'personalized': {
      const weights = getPersonalizedWeights();
      score = 
        (metrics.interestScore || 0) * weights.interestWeight +
        (metrics.categoryMatch ? weights.categoryMatchWeight : 0) +
        (metrics.cityMatch ? weights.cityMatchWeight : 0);
      break;
    }
      
    default:
      score = Math.random() * 0.5 + 0.5; // 默认随机分数
  }
  
  return Math.min(Math.max(score, 0), 1); // 限制在0-1范围内
}

// 检查是否启用A/B测试
export function isABTestingEnabled(): boolean {
  return RecommendationConfig.abTesting.enabled;
}

// 获取A/B测试变体
export function getABTestVariants() {
  return RecommendationConfig.abTesting.variants;
}