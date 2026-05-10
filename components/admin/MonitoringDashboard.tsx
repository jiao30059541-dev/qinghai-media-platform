'use client';

import React, { useState, useEffect } from 'react';

// 监控数据类型
interface MonitoringData {
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

// 健康检查数据
interface HealthData {
  status: string;
  checks: {
    database: { status: string; response_time_ms: number };
    api: { status: string; response_time_ms: number };
    recommendation_engine: { status: string; response_time_ms: number };
    cache: { status: string; hit_rate?: number };
  };
}

export default function MonitoringDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('24h');

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchMonitoringData = async () => {
    try {
      // 获取健康检查数据
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        const healthResult = await healthResponse.json();
        setHealthData(healthResult.data);
      }

      // 获取监控数据
      const monitoringResponse = await fetch(`/api/monitoring?timeframe=${timeframe}`);
      if (monitoringResponse.ok) {
        const monitoringResult = await monitoringResponse.json();
        setMonitoringData(monitoringResult.data);
      }
      
      setError(null);
    } catch (err) {
      setError('获取监控数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">系统监控仪表板</h1>
        <div className="flex items-center space-x-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">最近1小时</option>
            <option value="24h">最近24小时</option>
            <option value="7d">最近7天</option>
            <option value="30d">最近30天</option>
          </select>
          <button
            onClick={fetchMonitoringData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 系统状态 */}
      {healthData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">系统健康状态</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatusCard
              name="数据库"
              status={healthData.checks.database.status}
              responseTime={`${healthData.checks.database.response_time_ms}ms`}
            />
            <StatusCard
              name="API服务"
              status={healthData.checks.api.status}
              responseTime={`${healthData.checks.api.response_time_ms}ms`}
            />
            <StatusCard
              name="推荐引擎"
              status={healthData.checks.recommendation_engine.status}
              responseTime={`${healthData.checks.recommendation_engine.response_time_ms}ms`}
            />
            <StatusCard
              name="缓存系统"
              status={healthData.checks.cache.status}
              responseTime={healthData.checks.cache.hit_rate ? `命中率: ${(healthData.checks.cache.hit_rate * 100).toFixed(0)}%` : 'N/A'}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            总体状态：<span className={`font-medium ${healthData.status === 'healthy' ? 'text-green-600' : healthData.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'}`}>
              {healthData.status === 'healthy' ? '健康' : healthData.status === 'degraded' ? '降级' : '异常'}
            </span>
          </div>
        </div>
      )}

      {/* 关键指标 */}
      {monitoringData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="总推荐数"
            value={monitoringData.recommendation_system.total_recommendations}
            unit="次"
            icon="🎯"
          />
          <MetricCard
            title="缓存命中率"
            value={`${(monitoringData.recommendation_system.cache_hit_rate * 100).toFixed(1)}%`}
            unit=""
            icon="💾"
          />
          <MetricCard
            title="平均响应时间"
            value={monitoringData.recommendation_system.avg_response_time_ms}
            unit="ms"
            icon="⚡"
          />
          <MetricCard
            title="错误率"
            value={`${(monitoringData.recommendation_system.error_rate * 100).toFixed(2)}%`}
            unit=""
            icon="⚠️"
          />
        </div>
      )}

      {/* 用户行为指标 */}
      {monitoringData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">用户行为分析</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{monitoringData.user_behavior.total_behaviors}</div>
              <div className="text-sm text-gray-600">总行为数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{monitoringData.user_behavior.active_users_24h}</div>
              <div className="text-sm text-gray-600">24小时活跃用户</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{monitoringData.user_behavior.avg_session_duration.toFixed(0)}</div>
              <div className="text-sm text-gray-600">平均会话时长(秒)</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{Object.keys(monitoringData.user_behavior.behavior_types).length}</div>
              <div className="text-sm text-gray-600">行为类型数</div>
            </div>
          </div>

          {/* 行为类型分布 */}
          <h3 className="text-sm font-medium text-gray-700 mb-3">行为类型分布</h3>
          <div className="space-y-2">
            {Object.entries(monitoringData.user_behavior.behavior_types).map(([type, count]) => (
              <div key={type} className="flex items-center">
                <span className="w-24 text-sm text-gray-600">{getBehaviorLabel(type)}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(count / Math.max(...Object.values(monitoringData.user_behavior.behavior_types))) * 100}%` }}
                  ></div>
                </div>
                <span className="w-16 text-right text-sm text-gray-600 ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 系统性能 */}
      {monitoringData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">系统性能</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{monitoringData.system_performance.memory_usage_mb}</div>
              <div className="text-sm text-gray-500">内存使用(MB)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{monitoringData.system_performance.cpu_usage_percent}%</div>
              <div className="text-sm text-gray-500">CPU使用率</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{monitoringData.system_performance.database_connections}</div>
              <div className="text-sm text-gray-500">数据库连接数</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{monitoringData.system_performance.uptime_hours}</div>
              <div className="text-sm text-gray-500">运行时间(小时)</div>
            </div>
          </div>
        </div>
      )}

      {/* 数据更新时间 */}
      {monitoringData && (
        <div className="text-center text-sm text-gray-400">
          最后更新：{new Date(monitoringData.timestamp).toLocaleString('zh-CN')}
        </div>
      )}
    </div>
  );
}

// 状态卡片组件
function StatusCard({ name, status, responseTime }: { name: string; status: string; responseTime: string }) {
  const statusColors: Record<string, string> = {
    healthy: 'text-green-600 bg-green-50 border-green-200',
    degraded: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    unhealthy: 'text-red-600 bg-red-50 border-red-200',
  };

  const statusLabels: Record<string, string> = {
    healthy: '健康',
    degraded: '降级',
    unhealthy: '异常',
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status] || 'bg-gray-50 border-gray-200'}`}>
      <div className="text-sm font-medium">{name}</div>
      <div className="mt-1">
        <span className="text-lg font-bold">{statusLabels[status] || '未知'}</span>
      </div>
      <div className="mt-1 text-xs opacity-75">{responseTime}</div>
    </div>
  );
}

// 指标卡片组件
function MetricCard({ title, value, unit, icon }: { title: string; value: string | number; unit: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}{unit}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
}

// 行为类型中文标签
function getBehaviorLabel(type: string): string {
  const labels: Record<string, string> = {
    view: '浏览',
    click: '点击',
    favorite: '收藏',
    add_to_cart: '加入投放篮',
    purchase: '购买',
  };
  return labels[type] || type;
}