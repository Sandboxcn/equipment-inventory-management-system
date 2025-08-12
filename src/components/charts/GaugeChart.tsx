import React from 'react';
import { motion } from 'framer-motion';
import { getChartColors, gradientSchemes } from '../../utils/colorSchemes';

interface GaugeChartProps {
  value: number;
  max?: number;
  min?: number;
  size?: number;
  color?: string;
  backgroundColor?: string;
  title?: string;
  unit?: string;
  showValue?: boolean;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max = 100,
  min = 0,
  size = 200,
  color,
  backgroundColor = '#374151',
  title,
  unit = '',
  showValue = true,
  colorScheme = 'modern'
}) => {
  // 使用专业配色方案
  const colors = getChartColors(colorScheme, 3);
  const primaryColor = color || colors[0];
  const secondaryColor = colors[1];
  const accentColor = colors[2];
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDasharray = `${percentage * 2.51} 251`;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className="transform -rotate-90"
        >
          {/* 背景圆环 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={backgroundColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            opacity={0.3}
          />
          
          {/* 进度圆环 - 渐变效果 */}
          <defs>
            <linearGradient id={`gauge-gradient-${Math.random()}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="50%" stopColor={secondaryColor} />
              <stop offset="100%" stopColor={accentColor} />
            </linearGradient>
            <filter id={`glow-${Math.random()}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke={`url(#gauge-gradient-${Math.random()})`}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            filter={`url(#glow-${Math.random()})`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* 渐变定义 */}
          <defs>
            <linearGradient id={`gauge-gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* 中心数值 */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              className="text-3xl font-bold"
              style={{ color: primaryColor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {value.toFixed(1)}
            </motion.div>
            {unit && (
              <motion.div
                className="text-sm text-gray-300 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                {unit}
              </motion.div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {percentage.toFixed(1)}%
            </div>
          </div>
        )}
        
        {/* 刻度线 */}
        {Array.from({ length: 11 }, (_, i) => {
          const angle = (i * 36) - 90; // 0-360度，起始点在顶部
          const x1 = 100 + (radius - 15) * Math.cos((angle * Math.PI) / 180);
          const y1 = 100 + (radius - 15) * Math.sin((angle * Math.PI) / 180);
          const x2 = 100 + (radius - 5) * Math.cos((angle * Math.PI) / 180);
          const y2 = 100 + (radius - 5) * Math.sin((angle * Math.PI) / 180);
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}
      </div>
      
      {/* 范围指示器 */}
      <div className="flex items-center justify-between w-full mt-4 text-sm text-gray-500">
        <span>0</span>
        <span className="font-medium">{max} {unit}</span>
      </div>
    </div>
  );
};

export default GaugeChart;