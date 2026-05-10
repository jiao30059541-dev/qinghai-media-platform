// lib/design-system.ts
// 青海全媒体广告平台设计系统

export const designSystem = {
  // 颜色系统
  colors: {
    primary: '#1a365d', // 深蓝主色 - 专业、信任
    secondary: '#d4af37', // 金色强调色 - 高端、价值
    accent: '#3b82f6', // 蓝色辅助色
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    
    // 中性色
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    
    // 文本色
    text: {
      primary: '#1a2930',
      secondary: '#64748b',
      disabled: '#94a3b8',
      inverse: '#ffffff'
    }
  },
  
  // 字体系统
  typography: {
    // 标题
    h1: 'text-5xl md:text-7xl font-bold tracking-tight leading-tight',
    h2: 'text-4xl md:text-6xl font-bold tracking-tight',
    h3: 'text-3xl font-bold',
    h4: 'text-2xl font-semibold',
    h5: 'text-xl font-semibold',
    h6: 'text-lg font-semibold',
    
    // 正文
    body: {
      large: 'text-lg leading-relaxed',
      base: 'text-base leading-relaxed',
      small: 'text-sm leading-relaxed',
      xsmall: 'text-xs leading-relaxed'
    },
    
    // 特殊
    caption: 'text-sm text-gray-600',
    label: 'text-sm font-medium text-gray-700'
  },
  
  // 间距系统
  spacing: {
    section: {
      large: 'py-24 md:py-32',
      medium: 'py-16 md:py-24',
      small: 'py-12 md:py-16'
    },
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    gutter: {
      large: 'gap-8',
      medium: 'gap-6',
      small: 'gap-4'
    }
  },
  
  // 效果系统
  effects: {
    shadow: {
      small: 'shadow-sm',
      medium: 'shadow-md',
      large: 'shadow-lg',
      xlarge: 'shadow-xl',
      xxlarge: 'shadow-2xl'
    },
    hoverShadow: 'hover:shadow-xl transition-shadow duration-300',
    cardRadius: 'rounded-3xl',
    buttonRadius: 'rounded-xl',
    inputRadius: 'rounded-lg'
  },
  
  // 动效系统
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
}

// 工具函数
export function getColor(colorPath: string): string {
  const paths = colorPath.split('.')
  let current: any = designSystem.colors
  for (const path of paths) {
    if (current[path] === undefined) {
      console.warn(`Color path "${colorPath}" not found in design system`)
      return '#000000'
    }
    current = current[path]
  }
  return current
}

// 媒体查询断点
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

export default designSystem