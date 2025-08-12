import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChartColors } from '../../utils/colorSchemes';

interface TooltipData {
  x: number;
  y: number;
  content: React.ReactNode;
  visible: boolean;
}

interface ChartInteractionsProps {
  children: React.ReactNode;
  onHover?: (data: any) => void;
  onClick?: (data: any) => void;
  onDoubleClick?: (data: any) => void;
  enableZoom?: boolean;
  enablePan?: boolean;
  colorScheme?: 'modern' | 'tech' | 'business' | 'warm' | 'cool';
}

interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

const ChartInteractions: React.FC<ChartInteractionsProps> = ({
  children,
  onHover,
  onClick,
  onDoubleClick,
  enableZoom = true,
  enablePan = true,
  colorScheme = 'modern'
}) => {
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    content: null,
    visible: false
  });
  
  const [zoom, setZoom] = useState<ZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0
  });
  
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const colors = getChartColors(colorScheme);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning && enablePan) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      
      setZoom(prev => ({
        ...prev,
        translateX: prev.translateX + deltaX,
        translateY: prev.translateY + deltaY
      }));
      
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
    
    if (onHover) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        onHover({ x, y, event });
      }
    }
  }, [isPanning, lastPanPoint, onHover, enablePan]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (enablePan && event.button === 0) {
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    }
  }, [enablePan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (enableZoom) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.5, Math.min(3, zoom.scale * delta));
      
      setZoom(prev => ({
        ...prev,
        scale: newScale
      }));
    }
  }, [enableZoom, zoom.scale]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (onClick) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        onClick({ x, y, event });
      }
    }
  }, [onClick]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (onDoubleClick) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        onDoubleClick({ x, y, event });
      }
    }
    
    // 双击重置缩放
    if (enableZoom) {
      setZoom({ scale: 1, translateX: 0, translateY: 0 });
    }
  }, [onDoubleClick, enableZoom]);

  const showTooltip = useCallback((x: number, y: number, content: React.ReactNode) => {
    setTooltip({ x, y, content, visible: true });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 控制面板 */}
      {(enableZoom || enablePan) && (
        <motion.div 
          className="absolute top-4 right-4 z-20 flex space-x-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {enableZoom && (
            <>
              <motion.button
                onClick={() => setZoom(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))}
                className="p-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg text-white text-sm font-medium transition-all duration-200 backdrop-blur-md border border-gray-600/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                +
              </motion.button>
              <motion.button
                onClick={() => setZoom(prev => ({ ...prev, scale: Math.max(0.5, prev.scale * 0.8) }))}
                className="p-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg text-white text-sm font-medium transition-all duration-200 backdrop-blur-md border border-gray-600/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                -
              </motion.button>
              <motion.button
                onClick={resetZoom}
                className="px-3 py-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg text-white text-xs font-medium transition-all duration-200 backdrop-blur-md border border-gray-600/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                重置
              </motion.button>
            </>
          )}
        </motion.div>
      )}
      
      {/* 缩放指示器 */}
      {enableZoom && zoom.scale !== 1 && (
        <motion.div 
          className="absolute top-4 left-4 z-20 px-3 py-1 bg-gray-700/80 rounded-lg text-white text-xs font-medium backdrop-blur-md border border-gray-600/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {(zoom.scale * 100).toFixed(0)}%
        </motion.div>
      )}
      
      {/* 图表容器 */}
      <motion.div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{
          transform: `scale(${zoom.scale}) translate(${zoom.translateX}px, ${zoom.translateY}px)`,
          transformOrigin: 'center center'
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        animate={{
          scale: zoom.scale,
          x: zoom.translateX,
          y: zoom.translateY
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {React.cloneElement(children as React.ReactElement, {
          showTooltip,
          hideTooltip,
          colors
        })}
      </motion.div>
      
      {/* 工具提示 */}
      <AnimatePresence>
        {tooltip.visible && (
          <motion.div
            className="absolute z-30 pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-gray-800/95 backdrop-blur-md rounded-lg px-3 py-2 text-white text-sm shadow-2xl border border-gray-600/30 max-w-xs">
              {tooltip.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 交互提示 */}
      <motion.div 
        className="absolute bottom-4 left-4 z-20 text-xs text-gray-400 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {enableZoom && <div>滚轮缩放</div>}
        {enablePan && <div>拖拽平移</div>}
        <div>双击重置</div>
      </motion.div>
    </div>
  );
};

// 增强的图表包装器组件
interface EnhancedChartProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  colorScheme?: 'modern' | 'tech' | 'business' | 'warm' | 'cool';
  enableInteractions?: boolean;
  enableAnimations?: boolean;
  className?: string;
}

export const EnhancedChart: React.FC<EnhancedChartProps> = ({
  children,
  title,
  subtitle,
  colorScheme = 'modern',
  enableInteractions = true,
  enableAnimations = true,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = getChartColors(colorScheme);

  return (
    <motion.div
      className={`bg-gradient-to-br from-gray-800/80 to-gray-700/80 backdrop-blur-md rounded-xl border border-gray-600/30 shadow-2xl overflow-hidden ${className}`}
      initial={enableAnimations ? { opacity: 0, y: 20 } : {}}
      animate={enableAnimations ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={enableAnimations ? { 
        scale: 1.02,
        boxShadow: `0 25px 50px -12px ${colors[0]}20`
      } : {}}
    >
      {/* 标题区域 */}
      {(title || subtitle) && (
        <motion.div 
          className="px-6 py-4 border-b border-gray-600/30"
          style={{
            background: `linear-gradient(135deg, ${colors[0]}10, ${colors[1]}10)`
          }}
        >
          {title && (
            <motion.h3 
              className="text-lg font-semibold text-white"
              animate={isHovered ? { x: 5 } : { x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h3>
          )}
          {subtitle && (
            <motion.p 
              className="text-sm text-gray-400 mt-1"
              animate={isHovered ? { x: 5 } : { x: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      )}
      
      {/* 图表内容 */}
      <div className="p-6 relative">
        {enableInteractions ? (
          <ChartInteractions colorScheme={colorScheme}>
            {children}
          </ChartInteractions>
        ) : (
          children
        )}
        
        {/* 装饰性元素 */}
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colors[0]}, transparent 70%)`
          }}
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.1 : 0.05
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default ChartInteractions;