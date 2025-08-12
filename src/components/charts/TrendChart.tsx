import React from 'react';
import { motion } from 'framer-motion';
import { getChartColors, getGradientCSS } from '../../utils/colorSchemes';

interface TrendDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  showArea?: boolean;
  showPoints?: boolean;
  width?: number;
  height?: number;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  xAxisLabel = '',
  yAxisLabel = '',
  color,
  showArea = true,
  showPoints = true,
  width = 600,
  height = 400,
  colorScheme = 'modern'
}) => {
  // 使用专业配色方案
  const colors = getChartColors(colorScheme, 3);
  const primaryColor = color || colors[0];
  const secondaryColor = colors[1];
  const accentColor = colors[2];
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const xValues = data.map(d => typeof d.x === 'string' ? parseFloat(d.x) || 0 : d.x);
  const yValues = data.map(d => d.y);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  
  // 坐标转换函数
  const getX = (value: number) => padding.left + ((value - xMin) / xRange) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - yMin) / yRange) * chartHeight;
  
  // 生成路径
  const generatePath = () => {
    if (data.length === 0) return '';
    
    const points = data.map((point, index) => {
      const x = getX(xValues[index]);
      const y = getY(point.y);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return points.join(' ');
  };
  
  // 生成面积路径
  const generateAreaPath = () => {
    if (data.length === 0) return '';
    
    const linePath = generatePath();
    const firstX = getX(xValues[0]);
    const lastX = getX(xValues[xValues.length - 1]);
    const bottomY = getY(yMin);
    
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };
  
  // 生成网格线
  const generateGridLines = () => {
    const lines = [];
    const gridCount = 5;
    
    // 水平网格线
    for (let i = 0; i <= gridCount; i++) {
      const y = padding.top + (i * chartHeight) / gridCount;
      const value = yMax - (i * yRange) / gridCount;
      
      lines.push(
        <g key={`h-grid-${i}`}>
          <line
            x1={padding.left}
            y1={y}
            x2={padding.left + chartWidth}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth="1"
            opacity="0.5"
          />
          <text
            x={padding.left - 10}
            y={y}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {value.toFixed(1)}
          </text>
        </g>
      );
    }
    
    // 垂直网格线
    for (let i = 0; i <= gridCount; i++) {
      const x = padding.left + (i * chartWidth) / gridCount;
      const value = xMin + (i * xRange) / gridCount;
      
      lines.push(
        <g key={`v-grid-${i}`}>
          <line
            x1={x}
            y1={padding.top}
            x2={x}
            y2={padding.top + chartHeight}
            stroke="#E5E7EB"
            strokeWidth="1"
            opacity="0.5"
          />
          <text
            x={x}
            y={padding.top + chartHeight + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {value.toFixed(0)}
          </text>
        </g>
      );
    }
    
    return lines;
  };
  
  // 生成数据点
  const generateDataPoints = () => {
    return data.map((point, index) => {
      const x = getX(xValues[index]);
      const y = getY(point.y);
      
      return (
        <motion.g key={`point-${index}`}>
          <motion.circle
            cx={x}
            cy={y}
            r="5"
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth="3"
            filter={`url(#trend-glow-${Math.random()})`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 + 1, duration: 0.3 }}
            className="hover:r-6 cursor-pointer"
          />
          
          {/* 悬停时显示的数值 */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <rect
              x={x - 25}
              y={y - 35}
              width="50"
              height="25"
              fill="rgba(0,0,0,0.8)"
              rx="4"
              ry="4"
            />
            <text
              x={x}
              y={y - 20}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-white font-medium"
            >
              {point.y.toFixed(2)}
            </text>
          </motion.g>
        </motion.g>
      );
    });
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
      
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* 渐变定义 */}
          <defs>
            <linearGradient id={`trend-gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
            
            <filter id={`trend-glow-${title}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          {/* 网格线 */}
          <defs>
            <linearGradient id={`trend-grid-${Math.random()}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={secondaryColor} stopOpacity="0.1" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {generateGridLines()}
          
          {/* 面积填充 */}
          {showArea && (
            <>
              <defs>
                <linearGradient id={`trend-area-${Math.random()}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
                  <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={accentColor} stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <motion.path
                d={generateAreaPath()}
                fill={`url(#trend-area-${Math.random()})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </>
          )}
          
          {/* 趋势线 */}
          <defs>
            <linearGradient id={`trend-line-${Math.random()}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={primaryColor} />
              <stop offset="50%" stopColor={secondaryColor} />
              <stop offset="100%" stopColor={accentColor} />
            </linearGradient>
            <filter id={`trend-glow-${Math.random()}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          <motion.path
            d={generatePath()}
            fill="none"
            stroke={`url(#trend-line-${Math.random()})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#trend-glow-${Math.random()})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          
          {/* 数据点 */}
          {showPoints && generateDataPoints()}
          
          {/* 坐标轴标签 */}
          {xAxisLabel && (
            <text
              x={padding.left + chartWidth / 2}
              y={height - 10}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-700"
            >
              {xAxisLabel}
            </text>
          )}
          
          {yAxisLabel && (
            <text
              x={15}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-700"
              transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
            >
              {yAxisLabel}
            </text>
          )}
        </svg>
      </div>
      
      {/* 统计信息 */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="text-center">
          <div className="font-semibold text-gray-800">{yMax.toFixed(2)}</div>
          <div>最大值</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-800">{(yValues.reduce((a, b) => a + b, 0) / yValues.length).toFixed(2)}</div>
          <div>平均值</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-800">{yMin.toFixed(2)}</div>
          <div>最小值</div>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;