/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'www.xnmytx.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // PWA配置
  compress: true,
  // 生产环境优化
  productionBrowserSourceMaps: false,
  // 跨域配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  // 重定向配置
  async redirects() {
    return [];
  },
  // 环境变量
  env: {
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.xnmytx.com',
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://www.xnmytx.com/api',
  },
  // 实验性功能
  experimental: {
    // 启用服务器组件
    serverComponentsExternalPackages: ['mysql2'],
  },
  // Webpack配置
  webpack: (config, { dev, isServer }) => {
    // 添加PWA支持
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // 生产环境优化
    if (!dev && !isServer) {
      // 移除控制台日志
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }

    return config;
  },
};

module.exports = nextConfig;