import React from 'react';
import { motion } from 'framer-motion';
import { getHeatmapColor, getChartColors } from '../../utils/colorSchemes';

interface HeatmapDataPoint {
  x: string;
  y: string;
  value: number;
  label?: string;
}

interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  title: string;
  xLabels: string[];
  yLabels: string[];
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'modern' | 'business' | 'tech' | 'warm' | 'cool';
  cellSize?: number;
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  title,
  xLabels,
  yLabels,
  colorScheme = 'modern',
  cellSize = 40
}) => {
  // 使用专业配色方案
  const chartColors = getChartColors(colorScheme as any, 5);
  const primaryColor = chartColors[0];
  const secondaryColor = chartColors[1];
  const accentColor = chartColors[2];
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  const colorSchemes = {
    blue: {
      light: '#EBF8FF',
      medium: '#3182CE',
      dark: '#1A365D'
    },
    green: {
      light: '#F0FFF4',
      medium: '#38A169',
      dark: '#1A202C'
    },
    red: {
      light: '#FED7D7',
      medium: '#E53E3E',
      dark: '#742A2A'
    },
    purple: {
      light: '#FAF5FF',
      medium: '#805AD5',
      dark: '#44337A'
    },
    modern: {
      light: primaryColor,
      medium: secondaryColor,
      dark: accentColor
    }
  };
  
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.modern;
  
  const getColor = (value: number) => {
    if (maxValue === minValue) return colors.medium;
    
    const intensity = (value - minValue) / (maxValue - minValue);
    
    // 使用渐变色彩
    if (['modern', 'business', 'tech', 'warm', 'cool'].includes(colorScheme)) {
      const r = Math.round(255 * (1 - intensity) + parseInt(colors.dark.slice(1, 3), 16) * intensity);
      const g = Math.round(255 * (1 - intensity) + parseInt(colors.dark.slice(3, 5), 16) * intensity);
      const b = Math.round(255 * (1 - intensity) + parseInt(colors.dark.slice(5, 7), 16) * intensity);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    if (intensity < 0.3) {
      return colors.light;
    } else if (intensity < 0.7) {
      return colors.medium;
    } else {
      return colors.dark;
    }
  };
  
  const getOpacity = (value: number) => {
    if (maxValue === minValue) return 0.8;
    const intensity = (value - minValue) / (maxValue - minValue);
    return 0.3 + intensity * 0.7;
  };
  
  const width = xLabels.length * cellSize + 100;
  const height = yLabels.length * cellSize + 100;
  
  return (
    <div className="flex flex-col items-center p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
      
      <div className="relative overflow-auto">
        <svg width={width} height={height} className="overflow-visible">
          {/* 渐变定义 */}
          <defs>
            <linearGradient id={`heatmap-gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.light} stopOpacity="0.8" />
              <stop offset="100%" stopColor={colors.dark} stopOpacity="1" />
            </linearGradient>
            
            <filter id={`heatmap-shadow-${title}`}>
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Y轴标签 */}
          {yLabels.map((label, yIndex) => (
            <text
              key={`y-label-${yIndex}`}
              x="40"
              y={60 + yIndex * cellSize + cellSize / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-sm font-medium fill-current"
              style={{ fill: secondaryColor }}
            >
              {label}
            </text>
          ))}
          
          {/* X轴标签 */}
          {xLabels.map((label, xIndex) => (
            <text
              key={`x-label-${xIndex}`}
              x={60 + xIndex * cellSize + cellSize / 2}
              y="40"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium fill-current"
              style={{ fill: secondaryColor }}
              transform={`rotate(-45, ${60 + xIndex * cellSize + cellSize / 2}, 40)`}
            >
              {label}
            </text>
          ))}
          
          {/* 热力图单元格 */}
          {data.map((point, index) => {
            const xIndex = xLabels.indexOf(point.x);
            const yIndex = yLabels.indexOf(point.y);
            
            if (xIndex === -1 || yIndex === -1) return null;
            
            const x = 50 + xIndex * cellSize;
            const y = 50 + yIndex * cellSize;
            const color = getColor(point.value);
            const opacity = getOpacity(point.value);
            
            return (
              <g key={`cell-${index}`}>
                <motion.rect
                  x={x}
                  y={y}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={color}
                  opacity={opacity}
                  rx="4"
                  ry="4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity }}
                  transition={{ 
                    delay: (xIndex + yIndex) * 0.05,
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  filter={`url(#heatmap-shadow-${title})`}
                  className="hover:stroke-gray-800 hover:stroke-2 cursor-pointer"
                />
                
                {/* 数值标签 */}
                <motion.text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold pointer-events-none"
                  style={{ 
                    fill: opacity > 0.6 ? '#ffffff' : '#1f2937',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (xIndex + yIndex) * 0.05 + 0.2 }}
                >
                  {point.value}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* 颜色图例 */}
      <div className="mt-6 flex items-center space-x-4">
        <span className="text-sm text-gray-600">低</span>
        <div className="flex space-x-1">
          <div className="w-6 h-4 rounded" style={{ backgroundColor: colors.light }} />
          <div className="w-6 h-4 rounded" style={{ backgroundColor: colors.medium }} />
          <div className="w-6 h-4 rounded" style={{ backgroundColor: colors.dark }} />
        </div>
        <span className="text-sm text-gray-600">高</span>
        <div className="ml-4 text-sm text-gray-500">
          范围: {minValue} - {maxValue}
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;