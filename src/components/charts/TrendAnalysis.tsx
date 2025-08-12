import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { getChartColors, getGradientCSS } from '../../utils/colorSchemes';
import { Device } from '../../types';

interface TrendPoint {
  date: string;
  value: number;
  predicted?: boolean;
  anomaly?: boolean;
}

interface TrendAnalysisProps {
  devices: Device[];
  colorScheme?: 'modern' | 'tech' | 'business' | 'warm' | 'cool';
}

interface Insight {
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ 
  devices, 
  colorScheme = 'modern' 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'devices' | 'components' | 'power'>('devices');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showPrediction, setShowPrediction] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);

  const colors = getChartColors(colorScheme);

  // 生成趋势数据
  const trendData = useMemo(() => {
    const generateTrendData = (metric: string, days: number): TrendPoint[] => {
      const data: TrendPoint[] = [];
      const now = new Date();
      
      // 生成历史数据
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        let baseValue = 0;
        switch (metric) {
          case 'devices':
            baseValue = devices.length;
            break;
          case 'components':
            baseValue = devices.reduce((sum, device) => sum + device.零部件列表.length, 0);
            break;
          case 'power':
            baseValue = devices.reduce((sum, device) => {
              return sum + device.零部件列表.reduce((componentSum, component) => {
                const power = parseFloat(component.电机功率.replace(/[^\d.]/g, '')) || 0;
                return componentSum + power;
              }, 0);
            }, 0);
            break;
        }
        
        // 添加随机波动
        const variation = (Math.random() - 0.5) * 0.2;
        const seasonality = Math.sin((i / days) * Math.PI * 2) * 0.1;
        const trend = i < days * 0.7 ? 0.05 : -0.02; // 前70%时间增长，后30%下降
        
        const value = baseValue * (1 + variation + seasonality + trend * (days - i) / days);
        
        // 检测异常值
        const isAnomaly = Math.random() < 0.05 && Math.abs(variation) > 0.15;
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.max(0, value),
          anomaly: isAnomaly
        });
      }
      
      // 生成预测数据
      if (showPrediction) {
        const lastValue = data[data.length - 1].value;
        const predictDays = Math.min(days * 0.3, 30); // 预测未来30%的时间，最多30天
        
        for (let i = 1; i <= predictDays; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          
          // 简单的线性预测加上一些随机性
          const trendSlope = (data[data.length - 1].value - data[data.length - 7].value) / 7;
          const prediction = lastValue + trendSlope * i + (Math.random() - 0.5) * lastValue * 0.05;
          
          data.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, prediction),
            predicted: true
          });
        }
      }
      
      return data;
    };

    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeRange];

    return generateTrendData(selectedMetric, days);
  }, [devices, selectedMetric, timeRange, showPrediction]);

  // 生成数据洞察
  const insights = useMemo((): Insight[] => {
    const historicalData = trendData.filter(point => !point.predicted);
    const predictedData = trendData.filter(point => point.predicted);
    const anomalies = historicalData.filter(point => point.anomaly);
    
    const insights: Insight[] = [];
    
    // 趋势分析
    if (historicalData.length >= 7) {
      const recent = historicalData.slice(-7);
      const earlier = historicalData.slice(-14, -7);
      const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, p) => sum + p.value, 0) / earlier.length;
      const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
      
      if (Math.abs(change) > 5) {
        insights.push({
          type: 'trend',
          title: change > 0 ? '上升趋势' : '下降趋势',
          description: `过去7天${selectedMetric === 'devices' ? '设备数量' : selectedMetric === 'components' ? '零部件数量' : '电机功率'}${change > 0 ? '增长' : '下降'}了${Math.abs(change).toFixed(1)}%`,
          severity: Math.abs(change) > 15 ? 'high' : Math.abs(change) > 10 ? 'medium' : 'low',
          icon: change > 0 ? <ArrowTrendingUpIcon className="h-5 w-5" /> : <ArrowTrendingDownIcon className="h-5 w-5" />
        });
      }
    }
    
    // 异常检测
    if (anomalies.length > 0) {
      insights.push({
        type: 'anomaly',
        title: '异常数据检测',
        description: `检测到${anomalies.length}个异常数据点，建议进一步调查`,
        severity: anomalies.length > 3 ? 'high' : anomalies.length > 1 ? 'medium' : 'low',
        icon: <ExclamationTriangleIcon className="h-5 w-5" />
      });
    }
    
    // 预测洞察
    if (predictedData.length > 0) {
      const lastHistorical = historicalData[historicalData.length - 1]?.value || 0;
      const lastPredicted = predictedData[predictedData.length - 1]?.value || 0;
      const predictedChange = ((lastPredicted - lastHistorical) / lastHistorical) * 100;
      
      insights.push({
        type: 'prediction',
        title: '未来趋势预测',
        description: `预计未来${predictedData.length}天内数值将${predictedChange > 0 ? '增长' : '下降'}${Math.abs(predictedChange).toFixed(1)}%`,
        severity: Math.abs(predictedChange) > 20 ? 'high' : Math.abs(predictedChange) > 10 ? 'medium' : 'low',
        icon: <LightBulbIcon className="h-5 w-5" />
      });
    }
    
    // 建议
    if (selectedMetric === 'power') {
      const avgPower = historicalData.reduce((sum, p) => sum + p.value, 0) / historicalData.length;
      if (avgPower > 1000) {
        insights.push({
          type: 'recommendation',
          title: '能耗优化建议',
          description: '当前电机功率较高，建议考虑节能改造或优化运行策略',
          severity: 'medium',
          icon: <LightBulbIcon className="h-5 w-5" />
        });
      }
    }
    
    return insights;
  }, [trendData, selectedMetric]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const maxValue = Math.max(...trendData.map(d => d.value));
  const minValue = Math.min(...trendData.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <motion.div 
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* 指标选择 */}
            <div className="flex space-x-2">
              {[
                { key: 'devices', label: '设备数量' },
                { key: 'components', label: '零部件数量' },
                { key: 'power', label: '电机功率' }
              ].map((metric) => (
                <motion.button
                  key={metric.key}
                  onClick={() => setSelectedMetric(metric.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedMetric === metric.key
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {metric.label}
                </motion.button>
              ))}
            </div>
            
            {/* 时间范围选择 */}
            <div className="flex space-x-2">
              {[
                { key: '7d', label: '7天' },
                { key: '30d', label: '30天' },
                { key: '90d', label: '90天' },
                { key: '1y', label: '1年' }
              ].map((range) => (
                <motion.button
                  key={range.key}
                  onClick={() => setTimeRange(range.key as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeRange === range.key
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {range.label}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* 显示选项 */}
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 text-sm text-black">
              <input
                type="checkbox"
                checked={showPrediction}
                onChange={(e) => setShowPrediction(e.target.checked)}
                className="rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500"
              />
              <span>显示预测</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-black">
              <input
                type="checkbox"
                checked={showAnomalies}
                onChange={(e) => setShowAnomalies(e.target.checked)}
                className="rounded border-gray-300 bg-white text-purple-600 focus:ring-purple-500"
              />
              <span>显示异常</span>
            </label>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 趋势图表 */}
        <motion.div 
          className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-black mb-4">
            {selectedMetric === 'devices' ? '设备数量' : selectedMetric === 'components' ? '零部件数量' : '电机功率'}趋势分析
          </h3>
          
          <div className="h-80 relative">
            <svg width="100%" height="100%" className="overflow-visible">
              <defs>
                <linearGradient id={`trendGradient-${colorScheme}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={colors[0]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors[0]} stopOpacity={0.05} />
                </linearGradient>
                <filter id={`glow-${colorScheme}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* 网格线 */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <g key={index}>
                  <line
                    x1="60"
                    y1={60 + (260 * ratio)}
                    x2="100%"
                    y2={60 + (260 * ratio)}
                    stroke="#374151"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x="50"
                    y={65 + (260 * ratio)}
                    fill="#9CA3AF"
                    fontSize="12"
                    textAnchor="end"
                  >
                    {(maxValue - (maxValue - minValue) * ratio).toFixed(0)}
                  </text>
                </g>
              ))}
              
              {/* 趋势线和面积 */}
              {trendData.length > 1 && (
                <g>
                  {/* 面积填充 */}
                  <path
                    d={`M 60 320 ${trendData.map((point, index) => {
                      const x = 60 + (index / (trendData.length - 1)) * (window.innerWidth * 0.6 - 120);
                      const y = 320 - ((point.value - minValue) / range) * 260;
                      return `L ${x} ${y}`;
                    }).join(' ')} L ${60 + (window.innerWidth * 0.6 - 120)} 320 Z`}
                    fill={`url(#trendGradient-${colorScheme})`}
                  />
                  
                  {/* 历史数据线 */}
                  <path
                    d={trendData.filter(point => !point.predicted).map((point, index) => {
                      const x = 60 + (index / (trendData.length - 1)) * (window.innerWidth * 0.6 - 120);
                      const y = 320 - ((point.value - minValue) / range) * 260;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    stroke={colors[0]}
                    strokeWidth="3"
                    fill="none"
                    filter={`url(#glow-${colorScheme})`}
                  />
                  
                  {/* 预测数据线 */}
                  {showPrediction && (
                    <path
                      d={trendData.filter(point => point.predicted).map((point, index, arr) => {
                        const totalIndex = trendData.findIndex(p => p === point);
                        const x = 60 + (totalIndex / (trendData.length - 1)) * (window.innerWidth * 0.6 - 120);
                        const y = 320 - ((point.value - minValue) / range) * 260;
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      stroke={colors[1]}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      fill="none"
                      opacity={0.8}
                    />
                  )}
                  
                  {/* 数据点 */}
                  {trendData.map((point, index) => {
                    const x = 60 + (index / (trendData.length - 1)) * (window.innerWidth * 0.6 - 120);
                    const y = 320 - ((point.value - minValue) / range) * 260;
                    
                    return (
                      <g key={index}>
                        {/* 异常点标记 */}
                        {point.anomaly && showAnomalies && (
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill="#EF4444"
                            stroke="#FEE2E2"
                            strokeWidth="2"
                            opacity={0.8}
                          />
                        )}
                        
                        {/* 普通数据点 */}
                        <circle
                          cx={x}
                          cy={y}
                          r={point.predicted ? "3" : "4"}
                          fill={point.predicted ? colors[1] : colors[0]}
                          stroke="white"
                          strokeWidth="2"
                          opacity={point.predicted ? 0.7 : 1}
                        />
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>
        </motion.div>
        
        {/* 数据洞察 */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-black mb-4">数据洞察</h3>
          
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-lg border backdrop-blur-md ${getSeverityColor(insight.severity)}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs opacity-90">{insight.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {insights.length === 0 && (
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-center">
              <p className="text-gray-600 text-sm">暂无数据洞察</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TrendAnalysis;