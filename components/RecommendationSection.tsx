'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Recommendation {
  media_id: number;
  name: string;
  category_level1: string;
  category_level2: string;
  city: string;
  list_price: number;
  deal_price: number;
  size: string;
  daily_exposure: number;
  recommendation_type: 'collaborative' | 'content' | 'popular' | 'personalized';
  recommendation_score: number;
  reason: string;
  image_url: string;
}

interface RecommendationSectionProps {
  title?: string;
  type?: 'all' | 'collaborative' | 'content' | 'popular' | 'personalized';
  limit?: number;
  category?: string;
  city?: string;
  showTitle?: boolean;
  className?: string;
}

export default function RecommendationSection({
  title = '为您推荐',
  type = 'all',
  limit = 6,
  category,
  city,
  showTitle = true,
  className = ''
}: RecommendationSectionProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [type, limit, category, city]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
        ...(category && { category }),
        ...(city && { city })
      });

      const response = await fetch(`/api/recommendations?${params}`);
      
      if (!response.ok) {
        throw new Error(`获取推荐失败: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setRecommendations(data.data);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error('获取推荐数据错误:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const trackBehavior = async (mediaId: number, behaviorType: string) => {
    try {
      await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_id: mediaId,
          behavior_type: behaviorType,
          session_id: `session_${Date.now()}`,
          device_type: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          user_agent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('跟踪行为错误:', error);
    }
  };

  const handleCardClick = (mediaId: number) => {
    trackBehavior(mediaId, 'click');
  };

  const handleCardView = (mediaId: number) => {
    trackBehavior(mediaId, 'view');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'personalized':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'collaborative':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'content':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      case 'popular':
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'personalized':
        return '个性化推荐';
      case 'collaborative':
        return '协同过滤';
      case 'content':
        return '内容相似';
      case 'popular':
        return '热门推荐';
      default:
        return '推荐';
    }
  };

  if (loading) {
    return (
      <div className={`${className} py-8`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <div className="text-sm text-gray-500">加载中...</div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} py-8`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">推荐加载失败</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`${className} py-8`}>
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <div className="text-gray-600 text-lg mb-2">暂无推荐</div>
          <div className="text-gray-500">浏览更多广告位以获取个性化推荐</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} py-8`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">推荐算法:</span>
            <div className="flex space-x-1">
              {['personalized', 'collaborative', 'content', 'popular'].map((t) => (
                <button
                  key={t}
                  onClick={() => window.location.href = `/media?recommendation_type=${t}`}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    type === t 
                      ? getTypeColor(t) + ' text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {getTypeText(t)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item, index) => (
          <div 
            key={item.media_id}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            onMouseEnter={() => handleCardView(item.media_id)}
          >
            <Link 
              href={`/media/${item.media_id}`}
              onClick={() => handleCardClick(item.media_id)}
              className="block"
            >
              {/* 图片区域 */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/40 z-10"></div>
                <img
                  src={item.image_url || '/images/default-media.jpg'}
                  alt={item.name || '青海广告资源推荐'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* 推荐标签 */}
                <div className="absolute top-3 left-3 z-20">
                  <span className={`${getTypeColor(item.recommendation_type)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                    {getTypeText(item.recommendation_type)}
                  </span>
                </div>
                
                {/* 推荐分数 */}
                <div className="absolute top-3 right-3 z-20">
                  <div className="bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {(item.recommendation_score * 100).toFixed(0)}分
                  </div>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-20 text-gray-500">分类:</span>
                    <span className="font-medium">{item.category_level1} · {item.category_level2}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-20 text-gray-500">城市:</span>
                    <span className="font-medium">{item.city}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-20 text-gray-500">尺寸:</span>
                    <span className="font-medium">{item.size}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-20 text-gray-500">曝光量:</span>
                    <span className="font-medium">{item.daily_exposure?.toLocaleString() || '0'}/天</span>
                  </div>
                </div>

                {/* 价格区域 */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-sm text-gray-500">报价</div>
                    <div className="text-xl font-bold text-blue-600">
                      ¥{item.deal_price?.toLocaleString() || item.list_price?.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">推荐理由</div>
                    <div className="text-sm font-medium text-gray-700 line-clamp-1">
                      {item.reason}
                    </div>
                  </div>
                </div>

                {/* 交互按钮 */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      trackBehavior(item.media_id, 'favorite');
                      // 这里可以添加收藏功能
                    }}
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>❤️</span>
                    <span>收藏</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      trackBehavior(item.media_id, 'add_to_cart');
                      // 这里可以添加到投放篮功能
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center space-x-1"
                  >
                    <span>🛒</span>
                    <span>加入投放篮</span>
                  </button>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 推荐算法说明 */}
      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">推荐算法说明</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="font-medium text-gray-900">个性化推荐</div>
            </div>
            <div className="text-sm text-gray-600">
              基于您的浏览历史、兴趣偏好和行为模式，为您量身定制的推荐
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
              <div className="font-medium text-gray-900">协同过滤</div>
            </div>
            <div className="text-sm text-gray-600">
              分析与您相似用户的偏好，推荐他们喜欢而您可能也感兴趣的广告位
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
              <div className="font-medium text-gray-900">内容相似</div>
            </div>
            <div className="text-sm text-gray-600">
              基于广告位的属性（分类、城市、价格等）相似度进行推荐
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
              <div className="font-medium text-gray-900">热门推荐</div>
            </div>
            <div className="text-sm text-gray-600">
              根据近期所有用户的浏览和购买行为，推荐最受欢迎的广告位
            </div>
          </div>
        </div>
      </div>

      {/* 刷新按钮 */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchRecommendations}
          className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
        >
          🔄 刷新推荐
        </button>
      </div>
    </div>
  );
}