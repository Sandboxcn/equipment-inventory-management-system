// 专业数据可视化配色方案

// 主要配色方案 - 基于现代设计趋势
export const primaryColors = {
  purple: {
    50: '#F3F4F6',
    100: '#E5E7EB',
    200: '#D1D5DB',
    300: '#9CA3AF',
    400: '#6B7280',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95'
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A'
  },
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B'
  },
  yellow: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F'
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D'
  }
};

// 图表专用配色方案
export const chartColorSchemes = {
  // 现代渐变配色
  modern: [
    '#8B5CF6', // 紫色
    '#3B82F6', // 蓝色
    '#10B981', // 绿色
    '#F59E0B', // 黄色
    '#EF4444', // 红色
    '#EC4899', // 粉色
    '#06B6D4', // 青色
    '#84CC16'  // 青绿色
  ],
  
  // 商务专业配色
  business: [
    '#1E40AF', // 深蓝
    '#059669', // 深绿
    '#DC2626', // 深红
    '#D97706', // 深橙
    '#7C2D12', // 深棕
    '#4C1D95', // 深紫
    '#0F766E', // 深青
    '#365314'  // 深绿黄
  ],
  
  // 科技感配色
  tech: [
    '#00D9FF', // 电光蓝
    '#FF6B6B', // 珊瑚红
    '#4ECDC4', // 薄荷绿
    '#45B7D1', // 天空蓝
    '#96CEB4', // 薄荷绿
    '#FFEAA7', // 香草黄
    '#DDA0DD', // 梅花紫
    '#98D8C8'  // 水绿色
  ],
  
  // 温暖配色
  warm: [
    '#FF6B6B', // 暖红
    '#FFE66D', // 暖黄
    '#FF8E53', // 暖橙
    '#FF6B9D', // 暖粉
    '#C44569', // 暖紫红
    '#F8B500', // 金黄
    '#FF7675', // 浅红
    '#FDCB6E'  // 浅橙
  ],
  
  // 冷色调配色
  cool: [
    '#74B9FF', // 冷蓝
    '#0984E3', // 深蓝
    '#00CEC9', // 青绿
    '#6C5CE7', // 紫色
    '#A29BFE', // 浅紫
    '#81ECEC', // 浅青
    '#55A3FF', // 中蓝
    '#5F27CD'  // 深紫
  ]
};

// 状态指示配色
export const statusColors = {
  success: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/30',
    solid: '#10B981'
  },
  warning: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    solid: '#F59E0B'
  },
  error: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30',
    solid: '#EF4444'
  },
  info: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    solid: '#3B82F6'
  },
  neutral: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-400',
    border: 'border-gray-500/30',
    solid: '#6B7280'
  }
};

// 渐变配色
export const gradientSchemes = {
  // 紫蓝渐变
  purpleBlue: {
    from: 'from-purple-600',
    via: 'via-purple-500',
    to: 'to-blue-500',
    css: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
  },
  
  // 蓝绿渐变
  blueGreen: {
    from: 'from-blue-500',
    via: 'via-teal-500',
    to: 'to-green-500',
    css: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)'
  },
  
  // 橙红渐变
  orangeRed: {
    from: 'from-orange-500',
    via: 'via-red-500',
    to: 'to-pink-500',
    css: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
  },
  
  // 深色渐变
  dark: {
    from: 'from-gray-900',
    via: 'via-gray-800',
    to: 'to-gray-700',
    css: 'linear-gradient(135deg, #111827 0%, #374151 100%)'
  }
};

// 热力图配色
export const heatmapColors = {
  // 蓝色系
  blue: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1'],
  
  // 绿色系
  green: ['#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D'],
  
  // 红色系
  red: ['#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C'],
  
  // 紫色系
  purple: ['#FAF5FF', '#F3E8FF', '#E9D5FF', '#D8B4FE', '#C084FC', '#A855F7', '#9333EA', '#7C3AED'],
  
  // 彩虹色系
  rainbow: ['#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF']
};

// 获取图表配色的工具函数
export const getChartColors = (scheme: keyof typeof chartColorSchemes = 'modern', count?: number) => {
  const colors = chartColorSchemes[scheme];
  if (count && count <= colors.length) {
    return colors.slice(0, count);
  }
  return colors;
};

// 获取渐变CSS的工具函数
export const getGradientCSS = (scheme: keyof typeof gradientSchemes) => {
  return gradientSchemes[scheme].css;
};

// 获取状态颜色的工具函数
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info' | 'neutral') => {
  return statusColors[status];
};

// 生成随机配色的工具函数
export const generateRandomColors = (count: number, scheme: keyof typeof chartColorSchemes = 'modern') => {
  const colors = chartColorSchemes[scheme];
  const result = [];
  
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
};

// 根据数值生成热力图颜色
export const getHeatmapColor = (value: number, min: number, max: number, scheme: keyof typeof heatmapColors = 'blue') => {
  const colors = heatmapColors[scheme];
  const normalizedValue = (value - min) / (max - min);
  const colorIndex = Math.floor(normalizedValue * (colors.length - 1));
  return colors[Math.max(0, Math.min(colorIndex, colors.length - 1))];
};

export default {
  primaryColors,
  chartColorSchemes,
  statusColors,
  gradientSchemes,
  heatmapColors,
  getChartColors,
  getGradientCSS,
  getStatusColor,
  generateRandomColors,
  getHeatmapColor
};