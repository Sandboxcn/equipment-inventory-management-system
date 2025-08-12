import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getChartColors, generateRandomColors } from '../../utils/colorSchemes';

interface DonutDataPoint {
  label: string;
  value: number;
  color?: string;
  subData?: DonutDataPoint[];
}

interface DonutChartProps {
  data: DonutDataPoint[];
  title: string;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  showPercentages?: boolean;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool' | string[];
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  size = 300,
  innerRadius = 60,
  outerRadius = 120,
  showLabels = true,
  showPercentages = true,
  colorScheme = 'modern'
}) => {
  // 使用专业配色方案
  const colors = Array.isArray(colorScheme) ? colorScheme : getChartColors(colorScheme, data.length);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  
  const center = size / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // 生成路径
  const generatePath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = center + innerR * Math.cos(startAngleRad);
    const y1 = center + innerR * Math.sin(startAngleRad);
    const x2 = center + outerR * Math.cos(startAngleRad);
    const y2 = center + outerR * Math.sin(startAngleRad);
    
    const x3 = center + outerR * Math.cos(endAngleRad);
    const y3 = center + outerR * Math.sin(endAngleRad);
    const x4 = center + innerR * Math.cos(endAngleRad);
    const y4 = center + innerR * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', x1, y1,
      'L', x2, y2,
      'A', outerR, outerR, 0, largeArcFlag, 1, x3, y3,
      'L', x4, y4,
      'A', innerR, innerR, 0, largeArcFlag, 0, x1, y1,
      'Z'
    ].join(' ');
  };
  
  // 生成段落
  const generateSegments = () => {
    let currentAngle = -90; // 从顶部开始
    
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const segmentAngle = (item.value / total) * 360;
      const endAngle = currentAngle + segmentAngle;
      
      const color = item.color || colors[index] || (Array.isArray(colorScheme) ? colorScheme[index % colorScheme.length] : generateRandomColors(1, colorScheme)[0]);
      const isHovered = hoveredSegment === index;
      const isSelected = selectedSegment === index;
      
      const adjustedInnerRadius = isHovered || isSelected ? innerRadius - 5 : innerRadius;
      const adjustedOuterRadius = isHovered || isSelected ? outerRadius + 5 : outerRadius;
      
      const path = generatePath(currentAngle, endAngle, adjustedInnerRadius, adjustedOuterRadius);
      
      // 计算标签位置
      const labelAngle = (currentAngle + endAngle) / 2;
      const labelRadius = (adjustedInnerRadius + adjustedOuterRadius) / 2;
      const labelX = center + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
      const labelY = center + labelRadius * Math.sin((labelAngle * Math.PI) / 180);
      
      const segment = (
        <g key={`segment-${index}`}>
          <defs>
            <radialGradient id={`donut-gradient-${index}-${title}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="70%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.8" />
            </radialGradient>
            <filter id={`donut-glow-${index}-${title}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d={path}
            fill={`url(#donut-gradient-${index}-${title})`}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
            filter={isHovered ? `url(#donut-glow-${index}-${title})` : 'none'}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: selectedSegment === null || selectedSegment === index ? 1 : 0.6,
              scale: isHovered ? 1.08 : 1
            }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
            onMouseEnter={() => setHoveredSegment(index)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
            className="cursor-pointer"
          />
          
          {/* 标签 */}
          {showLabels && segmentAngle > 15 && (
            <motion.text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-bold fill-current pointer-events-none"
              style={{ 
                fill: '#ffffff',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              {showPercentages ? `${percentage.toFixed(1)}%` : item.value}
            </motion.text>
          )}
        </g>
      );
      
      currentAngle = endAngle;
      return segment;
    });
  };
  
  // 生成中心信息
  const generateCenterInfo = () => {
    const selectedItem = selectedSegment !== null ? data[selectedSegment] : null;
    
    return (
      <g>
        <motion.text
          x={center}
          y={center - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold fill-gray-800"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {selectedItem ? selectedItem.value : total}
        </motion.text>
        
        <motion.text
          x={center}
          y={center + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm fill-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {selectedItem ? selectedItem.label : '总计'}
        </motion.text>
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
      
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* 渐变定义 */}
          <defs>
            {(Array.isArray(colorScheme) ? colorScheme : getChartColors(colorScheme)).map((color, index) => (
              <radialGradient key={index} id={`donut-gradient-${index}-${title}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={color} stopOpacity="1" />
              </radialGradient>
            ))}
            
            <filter id={`donut-shadow-${title}`}>
              <feDropShadow dx="2" dy="2" stdDeviation="4" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* 背景圆环 */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="2"
          />
          
          {/* 段落 */}
          {generateSegments()}
          
          {/* 中心信息 */}
          {generateCenterInfo()}
        </svg>
      </div>
      
      {/* 图例 */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {data.map((item, index) => {
          const color = item.color || colors[index] || (Array.isArray(colorScheme) ? colorScheme[index % colorScheme.length] : generateRandomColors(1, colorScheme)[0]);
          const percentage = (item.value / total) * 100;
          const isSelected = selectedSegment === index;
          const isHovered = hoveredSegment === index;
          
          return (
            <motion.div
              key={index}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all backdrop-blur-sm border ${
                selectedSegment === null || selectedSegment === index 
                  ? 'opacity-100 border-white/20' 
                  : 'opacity-60 border-white/10'
              }`}
              style={{
                background: isHovered 
                  ? `linear-gradient(135deg, ${color}20, ${color}10)` 
                  : 'rgba(255,255,255,0.05)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 1 }}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
              onClick={() => setSelectedSegment(selectedSegment === index ? null : index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-4 h-4 rounded-full shadow-lg flex-shrink-0" 
                style={{ 
                  background: `radial-gradient(circle, ${color}, ${color}CC)`,
                  boxShadow: `0 0 8px ${color}60`
                }}
              />
              <div className="flex flex-col">
                <div className="text-sm font-semibold text-white truncate">
                  {item.label}
                </div>
                <div className="text-xs text-gray-300">
                  {item.value} ({percentage.toFixed(1)}%)
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* 操作提示 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        点击图例或图表段落查看详情
      </div>
    </div>
  );
};

export default DonutChart;