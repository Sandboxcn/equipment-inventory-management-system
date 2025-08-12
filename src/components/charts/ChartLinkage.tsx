import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { LinkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getChartColors } from '../../utils/colorSchemes';

// 联动数据类型
interface LinkageData {
  id: string;
  category: string;
  value: number;
  metadata?: Record<string, any>;
}

// 联动事件类型
interface LinkageEvent {
  type: 'filter' | 'highlight' | 'select' | 'drill';
  source: string;
  data: LinkageData[];
  filters?: Record<string, any>;
}

// 联动上下文
interface LinkageContextType {
  activeFilters: Record<string, any>;
  highlightedData: LinkageData[];
  selectedData: LinkageData[];
  registerChart: (chartId: string, onLinkageEvent: (event: LinkageEvent) => void) => void;
  unregisterChart: (chartId: string) => void;
  triggerLinkage: (event: LinkageEvent) => void;
  clearLinkage: () => void;
}

const LinkageContext = createContext<LinkageContextType | null>(null);

// 联动提供者组件
interface ChartLinkageProviderProps {
  children: React.ReactNode;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
}

export const ChartLinkageProvider: React.FC<ChartLinkageProviderProps> = ({ 
  children, 
  colorScheme = 'modern' 
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [highlightedData, setHighlightedData] = useState<LinkageData[]>([]);
  const [selectedData, setSelectedData] = useState<LinkageData[]>([]);
  const [chartCallbacks, setChartCallbacks] = useState<Map<string, (event: LinkageEvent) => void>>(new Map());
  const [linkageHistory, setLinkageHistory] = useState<LinkageEvent[]>([]);

  const colors = getChartColors(colorScheme, 6);

  // 注册图表
  const registerChart = (chartId: string, onLinkageEvent: (event: LinkageEvent) => void) => {
    setChartCallbacks(prev => new Map(prev.set(chartId, onLinkageEvent)));
  };

  // 注销图表
  const unregisterChart = (chartId: string) => {
    setChartCallbacks(prev => {
      const newMap = new Map(prev);
      newMap.delete(chartId);
      return newMap;
    });
  };

  // 触发联动
  const triggerLinkage = (event: LinkageEvent) => {
    // 记录联动历史
    setLinkageHistory(prev => [...prev.slice(-9), event]);

    // 更新状态
    switch (event.type) {
      case 'filter':
        setActiveFilters(event.filters || {});
        break;
      case 'highlight':
        setHighlightedData(event.data);
        break;
      case 'select':
        setSelectedData(event.data);
        break;
    }

    // 通知所有注册的图表（除了触发源）
    chartCallbacks.forEach((callback, chartId) => {
      if (chartId !== event.source) {
        callback(event);
      }
    });
  };

  // 清除联动
  const clearLinkage = () => {
    setActiveFilters({});
    setHighlightedData([]);
    setSelectedData([]);
    setLinkageHistory([]);
    
    // 通知所有图表清除状态
    const clearEvent: LinkageEvent = {
      type: 'filter',
      source: 'system',
      data: [],
      filters: {}
    };
    
    chartCallbacks.forEach(callback => callback(clearEvent));
  };

  const contextValue: LinkageContextType = {
    activeFilters,
    highlightedData,
    selectedData,
    registerChart,
    unregisterChart,
    triggerLinkage,
    clearLinkage
  };

  return (
    <LinkageContext.Provider value={contextValue}>
      <div className="relative">
        {children}
        
        {/* 联动状态指示器 */}
        {(Object.keys(activeFilters).length > 0 || highlightedData.length > 0 || selectedData.length > 0) && (
          <motion.div
            className="fixed top-4 right-4 z-50 backdrop-blur-sm border rounded-xl p-4 max-w-sm"
            style={{
              background: `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}10)`,
              borderColor: `${colors[0]}30`,
              boxShadow: `0 8px 32px ${colors[0]}20`
            }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" style={{ color: colors[0] }} />
                <span className="text-sm font-medium text-gray-300">图表联动</span>
              </div>
              <button
                onClick={clearLinkage}
                className="p-1 rounded-md hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 transition-colors"
                title="清除联动"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* 活动筛选器 */}
            {Object.keys(activeFilters).length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">活动筛选器:</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(activeFilters).map(([key, value]) => (
                    <span
                      key={key}
                      className="px-2 py-1 text-xs rounded-md bg-gray-700/50 text-gray-300"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* 高亮数据 */}
            {highlightedData.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">高亮数据: {highlightedData.length} 项</div>
              </div>
            )}
            
            {/* 选中数据 */}
            {selectedData.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1">选中数据: {selectedData.length} 项</div>
                <div className="max-h-20 overflow-y-auto space-y-1">
                  {selectedData.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="text-xs text-gray-300">
                      {item.category}: {item.value}
                    </div>
                  ))}
                  {selectedData.length > 3 && (
                    <div className="text-xs text-gray-400">... 还有 {selectedData.length - 3} 项</div>
                  )}
                </div>
              </div>
            )}
            
            {/* 联动历史 */}
            {linkageHistory.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">最近操作:</div>
                <div className="space-y-1 max-h-16 overflow-y-auto">
                  {linkageHistory.slice(-3).map((event, index) => (
                    <div key={index} className="text-xs text-gray-300 flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span>{event.type} from {event.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </LinkageContext.Provider>
  );
};

// 使用联动的Hook
export const useLinkage = () => {
  const context = useContext(LinkageContext);
  if (!context) {
    throw new Error('useLinkage must be used within a ChartLinkageProvider');
  }
  return context;
};

// 联动图表包装器
interface LinkageChartWrapperProps {
  chartId: string;
  children: React.ReactNode;
  data: LinkageData[];
  onDataFilter?: (filteredData: LinkageData[]) => void;
  onDataHighlight?: (highlightedData: LinkageData[]) => void;
  onDataSelect?: (selectedData: LinkageData[]) => void;
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
}

export const LinkageChartWrapper: React.FC<LinkageChartWrapperProps> = ({
  chartId,
  children,
  data,
  onDataFilter,
  onDataHighlight,
  onDataSelect,
  colorScheme = 'modern'
}) => {
  const linkage = useLinkage();
  const [isLinked, setIsLinked] = useState(false);
  const colors = getChartColors(colorScheme, 3);

  useEffect(() => {
    // 处理联动事件
    const handleLinkageEvent = (event: LinkageEvent) => {
      setIsLinked(true);
      
      switch (event.type) {
        case 'filter':
          if (onDataFilter) {
            const filteredData = data.filter(item => {
              return Object.entries(event.filters || {}).every(([key, value]) => {
                if (!value) return true;
                return item.metadata?.[key] === value || item.category === value;
              });
            });
            onDataFilter(filteredData);
          }
          break;
          
        case 'highlight':
          if (onDataHighlight) {
            const highlightIds = event.data.map(d => d.id);
            const highlightedData = data.filter(item => highlightIds.includes(item.id));
            onDataHighlight(highlightedData);
          }
          break;
          
        case 'select':
          if (onDataSelect) {
            const selectIds = event.data.map(d => d.id);
            const selectedData = data.filter(item => selectIds.includes(item.id));
            onDataSelect(selectedData);
          }
          break;
      }
      
      // 一段时间后重置联动状态
      setTimeout(() => setIsLinked(false), 1000);
    };

    // 注册图表
    linkage.registerChart(chartId, handleLinkageEvent);

    // 清理
    return () => {
      linkage.unregisterChart(chartId);
    };
  }, [chartId, data, linkage, onDataFilter, onDataHighlight, onDataSelect]);

  // 触发联动的辅助函数
  const triggerFilter = (filters: Record<string, any>) => {
    linkage.triggerLinkage({
      type: 'filter',
      source: chartId,
      data: [],
      filters
    });
  };

  const triggerHighlight = (highlightedData: LinkageData[]) => {
    linkage.triggerLinkage({
      type: 'highlight',
      source: chartId,
      data: highlightedData
    });
  };

  const triggerSelect = (selectedData: LinkageData[]) => {
    linkage.triggerLinkage({
      type: 'select',
      source: chartId,
      data: selectedData
    });
  };

  return (
    <motion.div
      className="relative"
      animate={{
        boxShadow: isLinked 
          ? `0 0 20px ${colors[0]}40, 0 0 40px ${colors[1]}20`
          : `0 0 0px ${colors[0]}00`
      }}
      transition={{ duration: 0.3 }}
    >
      {/* 联动状态指示器 */}
      {isLinked && (
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white z-10"
          style={{ backgroundColor: colors[0] }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: colors[0] }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      )}
      
      {/* 包装子组件并传递联动函数 */}
      {React.cloneElement(children as React.ReactElement, {
        onTriggerFilter: triggerFilter,
        onTriggerHighlight: triggerHighlight,
        onTriggerSelect: triggerSelect,
        isLinked
      })}
    </motion.div>
  );
};

// 联动控制面板
interface LinkageControlPanelProps {
  colorScheme?: 'modern' | 'business' | 'tech' | 'warm' | 'cool';
}

export const LinkageControlPanel: React.FC<LinkageControlPanelProps> = ({ 
  colorScheme = 'modern' 
}) => {
  const linkage = useLinkage();
  const colors = getChartColors(colorScheme, 3);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveState = Object.keys(linkage.activeFilters).length > 0 || 
                        linkage.highlightedData.length > 0 || 
                        linkage.selectedData.length > 0;

  if (!hasActiveState) return null;

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
    >
      <motion.div
        className="backdrop-blur-sm border rounded-xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors[0]}15, ${colors[1]}10)`,
          borderColor: `${colors[0]}30`,
          boxShadow: `0 8px 32px ${colors[0]}20`
        }}
        animate={{ height: isExpanded ? 'auto' : '60px' }}
        transition={{ duration: 0.3 }}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" style={{ color: colors[0] }} />
            <span className="text-sm font-medium text-gray-300">联动控制</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
        
        {/* 展开内容 */}
        {isExpanded && (
          <motion.div
            className="px-4 pb-4 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-gray-800/30">
                <div className="text-lg font-bold" style={{ color: colors[0] }}>
                  {Object.keys(linkage.activeFilters).length}
                </div>
                <div className="text-xs text-gray-400">筛选器</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-800/30">
                <div className="text-lg font-bold" style={{ color: colors[1] }}>
                  {linkage.highlightedData.length}
                </div>
                <div className="text-xs text-gray-400">高亮</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-800/30">
                <div className="text-lg font-bold" style={{ color: colors[2] }}>
                  {linkage.selectedData.length}
                </div>
                <div className="text-xs text-gray-400">选中</div>
              </div>
            </div>
            
            {/* 清除按钮 */}
            <button
              onClick={linkage.clearLinkage}
              className="w-full py-2 px-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              清除所有联动
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChartLinkageProvider;