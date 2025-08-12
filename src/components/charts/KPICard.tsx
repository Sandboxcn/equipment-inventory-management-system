import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { getChartColors, getStatusColor, getGradientCSS } from '../../utils/colorSchemes';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'percentage' | 'absolute';
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  showSparkline?: boolean;
  sparklineData?: number[];
  target?: number;
  description?: string;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit = '',
  change,
  changeType = 'percentage',
  trend = 'neutral',
  icon,
  color = 'blue',
  size = 'md',
  showSparkline = false,
  sparklineData = [],
  target,
  description,
  colorScheme = 'modern'
}) => {
  // 使用专业配色方案
  const colors = getChartColors(colorScheme, 3);
  const primaryColor = colors[0];
  const secondaryColor = colors[1];
  const accentColor = colors[2];
  
  // 获取趋势颜色
  const trendColor = trend === 'up' ? getStatusColor('success') : 
                    trend === 'down' ? getStatusColor('error') : 
                    getStatusColor('warning');
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      accent: 'text-blue-800',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-600',
      accent: 'text-green-800',
      gradient: 'from-green-500 to-green-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      accent: 'text-red-800',
      gradient: 'from-red-500 to-red-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      accent: 'text-yellow-800',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      accent: 'text-purple-800',
      gradient: 'from-purple-500 to-purple-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      accent: 'text-indigo-800',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  };

  const sizeClasses = {
    sm: {
      container: 'p-4',
      title: 'text-sm',
      value: 'text-2xl',
      icon: 'w-8 h-8'
    },
    md: {
      container: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      icon: 'w-10 h-10'
    },
    lg: {
      container: 'p-8',
      title: 'text-lg',
      value: 'text-4xl',
      icon: 'w-12 h-12'
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    
    if (change > 0) {
      return <ArrowUpIcon className="w-3 h-3 text-green-500" />;
    } else if (change < 0) {
      return <ArrowDownIcon className="w-3 h-3 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = () => {
    if (change === undefined) return 'text-gray-500';
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
  };

  const generateSparkline = () => {
    if (!showSparkline || sparklineData.length === 0) return null;

    const width = 80;
    const height = 20;
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((value, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-2">
        <svg width={width} height={height} className="overflow-visible">
          <motion.polyline
            fill="none"
            stroke={`url(#sparkline-gradient-${color})`}
            strokeWidth="2"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={colorClasses[color].text} />
              <stop offset="100%" className={colorClasses[color].accent} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const generateProgressBar = () => {
    if (target === undefined || typeof value !== 'number') return null;

    const progress = Math.min((value / target) * 100, 100);
    const isOverTarget = value > target;

    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>进度</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full bg-gradient-to-r ${
              isOverTarget ? 'from-green-400 to-green-600' : colorClasses[color].gradient
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        {isOverTarget && (
          <div className="text-xs text-green-600 mt-1 flex items-center">
            <ArrowUpIcon className="w-3 h-3 mr-1" />
            超出目标 {((value - target) / target * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className={`
        ${colorClasses[color].bg} ${colorClasses[color].border}
        ${sizeClasses[size].container}
        border rounded-xl shadow-sm hover:shadow-md transition-all duration-300
        relative overflow-hidden backdrop-blur-sm
      `}
      style={{
        background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}10, ${accentColor}05)`,
        borderColor: `${primaryColor}30`,
        boxShadow: `0 8px 32px ${primaryColor}20, inset 0 1px 0 ${primaryColor}20`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        scale: 1.03, 
        y: -4,
        boxShadow: `0 12px 40px ${primaryColor}30, inset 0 1px 0 ${primaryColor}30`
      }}
    >
      {/* 背景装饰 */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${primaryColor}40, transparent 50%),
                      radial-gradient(circle at 80% 80%, ${accentColor}30, transparent 50%)`
        }}
      />
      
      {/* 头部 */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          {icon && (
            <motion.div 
              className={`p-3 rounded-xl backdrop-blur-sm border ${sizeClasses[size].icon} flex-shrink-0`}
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}15)`,
                borderColor: `${primaryColor}30`,
                boxShadow: `0 4px 12px ${primaryColor}20`,
                color: primaryColor
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
          <div className="flex-1">
            <h3 className={`${sizeClasses[size].title} font-medium text-black mb-1`}>
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-400">{description}</p>
            )}
            <div className="w-8 h-0.5 rounded-full mt-1" style={{ backgroundColor: primaryColor }} />
          </div>
        </div>
      </div>

      {/* 主要数值 */}
      <div className="flex items-end justify-between mb-2 relative z-10">
        <div className="flex items-baseline">
          <motion.span
            className={`${sizeClasses[size].value} font-bold`}
            style={{ 
              color: primaryColor,
              textShadow: `0 0 20px ${primaryColor}40`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.span>
          {unit && (
            <span 
              className="ml-2 text-sm"
              style={{ color: secondaryColor }}
            >
              {unit}
            </span>
          )}
        </div>
        
        {getTrendIcon()}
      </div>

      {/* 变化指标 */}
      {change !== undefined && (
        <motion.div 
          className="flex items-center text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm border mb-2 relative z-10"
          style={{
            background: `linear-gradient(135deg, ${trendColor}15, ${trendColor}10)`,
            borderColor: `${trendColor}30`,
            color: trendColor.text
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {getChangeIcon()}
          <span className="ml-1 font-bold">
            {change > 0 ? '+' : ''}{change}
            {changeType === 'percentage' ? '%' : ''}
          </span>
          <span className="ml-1 text-gray-400">vs 上期</span>
        </motion.div>
      )}

      {/* 迷你图表 */}
      {showSparkline && sparklineData.length > 0 && (
        <div className="mt-2 relative z-10">
          <svg width={80} height={20} className="overflow-visible">
            <defs>
              <linearGradient id={`sparkline-gradient-${color}-${title}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={primaryColor} />
                <stop offset="50%" stopColor={secondaryColor} />
                <stop offset="100%" stopColor={accentColor} />
              </linearGradient>
              <filter id={`sparkline-glow-${color}-${title}`}>
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
            </defs>
            <motion.polyline
              fill="none"
              stroke={`url(#sparkline-gradient-${color}-${title})`}
              strokeWidth="3"
              filter={`url(#sparkline-glow-${color}-${title})`}
              points={sparklineData.map((value, index) => {
                const width = 80;
                const height = 20;
                const max = Math.max(...sparklineData);
                const min = Math.min(...sparklineData);
                const range = max - min || 1;
                const x = (index / (sparklineData.length - 1)) * width;
                const y = height - ((value - min) / range) * height;
                return `${x},${y}`;
              }).join(' ')}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </svg>
        </div>
      )}

      {/* 进度条 */}
      {target !== undefined && typeof value === 'number' && (
        <div className="mt-3 relative z-10">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-black font-medium">进度</span>
            <span className="font-bold" style={{ color: primaryColor }}>
              {Math.min((value / target) * 100, 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 backdrop-blur-sm border border-gray-600/30">
            <motion.div
              className="h-3 rounded-full relative overflow-hidden"
              style={{ 
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${accentColor})`,
                boxShadow: `0 0 10px ${primaryColor}60`
              }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((value / target) * 100, 100)}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            >
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.1) 10px,
                    rgba(255,255,255,0.1) 20px
                  )`
                }}
              />
            </motion.div>
          </div>
          {value > target && (
            <div className="text-xs mt-1 flex items-center" style={{ color: getStatusColor('success').text }}>
              <ArrowUpIcon className="w-3 h-3 mr-1" />
              超出目标 {((value - target) / target * 100).toFixed(1)}%
            </div>
          )}
        </div>
      )}

      {/* 目标信息 */}
      {target !== undefined && (
        <div className="mt-2 text-xs text-gray-500">
          目标: {target.toLocaleString()}{unit}
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;