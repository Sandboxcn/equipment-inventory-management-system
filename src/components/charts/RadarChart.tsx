import React from 'react';
import { motion } from 'framer-motion';
import { getChartColors, gradientSchemes } from '../../utils/colorSchemes';

interface RadarDataPoint {
  label: string;
  value: number;
  maxValue: number;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  title: string;
  size?: number;
  color?: string;
  fillOpacity?: number;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  title,
  size = 300,
  color,
  fillOpacity = 0.3,
  colorScheme = 'modern'
}) => {
  // 使用专业配色方案
  const colors = getChartColors(colorScheme, 3);
  const primaryColor = color || colors[0];
  const secondaryColor = colors[1];
  const accentColor = colors[2];
  const center = size / 2;
  const radius = size * 0.35;
  const levels = 5;
  
  // 计算每个数据点的角度
  const angleStep = (2 * Math.PI) / data.length;
  
  // 生成网格线
  const generateGridLines = () => {
    const lines = [];
    
    // 同心圆
    for (let i = 1; i <= levels; i++) {
      const r = (radius * i) / levels;
      lines.push(
        <circle
          key={`circle-${i}`}
          cx={center}
          cy={center}
          r={r}
          fill={i === levels ? `${secondaryColor}10` : "none"}
          stroke={i % 2 === 0 ? secondaryColor : accentColor}
          strokeWidth={i === levels ? "2" : "1"}
          opacity={0.4}
        />
      );
    }
    
    // 射线
    data.forEach((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      lines.push(
        <line
          key={`line-${index}`}
          x1={center}
          y1={center}
          x2={x}
          y2={y}
          stroke="#E5E7EB"
          strokeWidth="1"
          opacity={0.5}
        />
      );
    });
    
    return lines;
  };
  
  // 生成数据多边形路径
  const generateDataPath = () => {
    const points = data.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const normalizedValue = point.value / point.maxValue;
      const r = radius * normalizedValue;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')} Z`;
  };
  
  // 生成标签
  const generateLabels = () => {
    return data.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      
      return (
        <g key={`label-${index}`}>
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm font-semibold"
            style={{ fill: secondaryColor }}
          >
            {point.label}
          </text>
          <text
            x={x}
            y={y + 16}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {point.value.toFixed(1)}
          </text>
        </g>
      );
    });
  };
  
  // 生成数据点
  const generateDataPoints = () => {
    return data.map((point, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const normalizedValue = point.value / point.maxValue;
      const r = radius * normalizedValue;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      
      return (
        <motion.circle
          key={`point-${index}`}
          cx={x}
          cy={y}
          r="5"
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="3"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
          style={{
            filter: `drop-shadow(0 2px 4px ${primaryColor}40)`
          }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
      
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* 渐变定义 */}
          <defs>
            <linearGradient id={`radar-gradient-${title}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={fillOpacity * 1.5} />
              <stop offset="50%" stopColor={secondaryColor} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={fillOpacity * 0.5} />
            </linearGradient>
            <filter id={`radar-glow-${title}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          {/* 网格线 */}
          {generateGridLines()}
          
          {/* 数据区域 */}
          <motion.path
            d={generateDataPath()}
            fill={`url(#radar-gradient-${title})`}
            stroke={primaryColor}
            strokeWidth="3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            filter={`url(#radar-glow-${title})`}
          />
          
          {/* 数据点 */}
          {generateDataPoints()}
          
          {/* 标签 */}
          {generateLabels()}
        </svg>
      </div>
      
      {/* 图例 */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
        {data.map((point, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: primaryColor }}
            />
            <span>{point.label}: {((point.value / point.maxValue) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChart;