import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FunnelIcon, 
  ArrowsPointingOutIcon, 
  ArrowsPointingInIcon,
  ChartBarIcon,
  TableCellsIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { getChartColors } from '../../utils/colorSchemes';

interface DataPoint {
  id: string;
  label: string;
  value: number;
  category: string;
  subcategory?: string;
  metadata?: Record<string, any>;
}

interface FilterOption {
  key: string;
  label: string;
  values: string[];
}

interface InteractiveExplorerProps {
  data: DataPoint[];
  title: string;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
  onDataChange?: (filteredData: DataPoint[]) => void;
  onDrillDown?: (dataPoint: DataPoint) => void;
  enableDrillDown?: boolean;
  enableFiltering?: boolean;
  enableZoom?: boolean;
  chartType?: 'bar' | 'pie' | 'scatter' | 'heatmap';
}

const InteractiveExplorer: React.FC<InteractiveExplorerProps> = ({
  data,
  title,
  colorScheme = 'modern',
  onDataChange,
  onDrillDown,
  enableDrillDown = true,
  enableFiltering = true,
  enableZoom = true,
  chartType = 'bar'
}) => {
  const [filteredData, setFilteredData] = useState<DataPoint[]>(data);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<DataPoint | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [searchTerm, setSearchTerm] = useState('');

  const colors = getChartColors(colorScheme, 8);

  // 生成筛选选项
  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: '类别',
      values: [...new Set(data.map(d => d.category))]
    },
    {
      key: 'subcategory',
      label: '子类别',
      values: [...new Set(data.map(d => d.subcategory).filter(Boolean) as string[])]
    }
  ];

  // 应用筛选
  useEffect(() => {
    let filtered = data;

    // 应用搜索
    if (searchTerm) {
      filtered = filtered.filter(d => 
        d.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 应用筛选器
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(d => {
          const fieldValue = key === 'category' ? d.category : d.subcategory;
          return fieldValue && values.includes(fieldValue);
        });
      }
    });

    setFilteredData(filtered);
    onDataChange?.(filtered);
  }, [data, selectedFilters, searchTerm, onDataChange]);

  // 处理筛选器变化
  const handleFilterChange = (filterKey: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => {
      const currentValues = prev[filterKey] || [];
      const newValues = checked 
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value);
      
      return {
        ...prev,
        [filterKey]: newValues
      };
    });
  };

  // 处理数据点点击
  const handleDataPointClick = (dataPoint: DataPoint) => {
    setSelectedDataPoint(dataPoint);
    if (enableDrillDown && onDrillDown) {
      onDrillDown(dataPoint);
    }
  };

  // 渲染图表
  const renderChart = () => {
    const maxValue = Math.max(...filteredData.map(d => d.value));
    
    switch (chartType) {
      case 'bar':
        return (
          <div className="space-y-3">
            {filteredData.map((dataPoint, index) => (
              <motion.div
                key={dataPoint.id}
                className="relative cursor-pointer group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleDataPointClick(dataPoint)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-black">
                    {dataPoint.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: colors[index % colors.length] }}>
                    {dataPoint.value}
                  </span>
                </div>
                <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[(index + 1) % colors.length]})`,
                      boxShadow: `0 0 10px ${colors[index % colors.length]}40`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(dataPoint.value / maxValue) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    whileHover={{ 
                      boxShadow: `0 0 20px ${colors[index % colors.length]}60`,
                      scale: 1.02
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-medium text-black">
                      {dataPoint.category}
                    </span>
                  </div>
                </div>
                {selectedDataPoint?.id === dataPoint.id && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: colors[index % colors.length] }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        );
      
      case 'pie':
        const total = filteredData.reduce((sum, d) => sum + d.value, 0);
        let currentAngle = 0;
        
        return (
          <div className="flex items-center justify-center">
            <svg width={200} height={200} className="overflow-visible">
              <defs>
                {filteredData.map((_, index) => (
                  <radialGradient key={index} id={`pie-gradient-${index}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={colors[index % colors.length]} />
                    <stop offset="100%" stopColor={colors[(index + 1) % colors.length]} />
                  </radialGradient>
                ))}
              </defs>
              {filteredData.map((dataPoint, index) => {
                const percentage = (dataPoint.value / total) * 100;
                const angle = (dataPoint.value / total) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                currentAngle += angle;
                
                const startX = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                const startY = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                const endX = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                const endY = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M 100 100`,
                  `L ${startX} ${startY}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  'Z'
                ].join(' ');
                
                return (
                  <motion.path
                    key={dataPoint.id}
                    d={pathData}
                    fill={`url(#pie-gradient-${index})`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="2"
                    className="cursor-pointer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDataPointClick(dataPoint)}
                  />
                );
              })}
            </svg>
          </div>
        );
      
      default:
        return renderChart();
    }
  };

  // 渲染表格
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-3 px-4 text-sm font-medium text-black">标签</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-black">值</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-black">类别</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-black">操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((dataPoint, index) => (
            <motion.tr
              key={dataPoint.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <td className="py-3 px-4 text-sm text-black">{dataPoint.label}</td>
              <td className="py-3 px-4 text-sm font-bold" style={{ color: colors[index % colors.length] }}>
                {dataPoint.value}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{dataPoint.category}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleDataPointClick(dataPoint)}
                  className="text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-black transition-colors"
                >
                  查看详情
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <motion.div
      className="border rounded-xl p-6 relative overflow-hidden bg-white"
      style={{
        borderColor: `${colors[0]}30`,
        boxShadow: `0 8px 32px ${colors[0]}20`
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      layout={isZoomed}
    >


      {/* 头部控制栏 */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-black">{title}</h3>
          <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: colors[0] }} />
        </div>
        
        <div className="flex items-center gap-2">
          {/* 搜索 */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-black placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          
          {/* 视图切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <TableCellsIcon className="w-4 h-4" />
            </button>
          </div>
          
          {/* 缩放控制 */}
          {enableZoom && (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {isZoomed ? (
                <ArrowsPointingInIcon className="w-4 h-4" />
              ) : (
                <ArrowsPointingOutIcon className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 筛选器 */}
      {enableFiltering && (
        <motion.div
          className="mb-6 relative z-10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-black">筛选器</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map((option) => (
              <div key={option.key} className="space-y-2">
                <label className="text-xs font-medium text-gray-600">{option.label}</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {option.values.map((value) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters[option.key]?.includes(value) || false}
                        onChange={(e) => handleFilterChange(option.key, value, e.target.checked)}
                        className="w-3 h-3 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/20"
                      />
                      <span className="text-xs text-black">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 数据统计 */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-600 relative z-10">
        <span>显示 {filteredData.length} / {data.length} 项</span>
        {selectedDataPoint && (
          <motion.div
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 border border-gray-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <EyeIcon className="w-4 h-4" />
            <span className="text-black">已选择: {selectedDataPoint.label}</span>
          </motion.div>
        )}
      </div>

      {/* 主要内容区域 */}
      <motion.div
        className="relative z-10"
        layout
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {viewMode === 'chart' ? (
            <motion.div
              key="chart"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderChart()}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTable()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default InteractiveExplorer;