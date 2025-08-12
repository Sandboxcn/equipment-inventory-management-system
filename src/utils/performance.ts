// 性能监控工具

// 组件渲染性能监控
export const measureComponentRender = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // 超过一帧的时间(16ms)
      console.warn(`⚠️ ${componentName} 渲染时间过长: ${renderTime.toFixed(2)}ms`);
    } else {
      console.log(`✅ ${componentName} 渲染时间: ${renderTime.toFixed(2)}ms`);
    }
    
    return renderTime;
  };
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 内存使用监控
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const used = Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100;
    const total = Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100;
    const limit = Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100;
    
    console.log(`📊 内存使用: ${used}MB / ${total}MB (限制: ${limit}MB)`);
    
    if (used / limit > 0.8) {
      console.warn('⚠️ 内存使用率过高，可能存在内存泄漏');
    }
    
    return { used, total, limit, usage: used / limit };
  }
  
  return null;
};

// 图表渲染性能优化
export const optimizeChartData = <T extends Record<string, any>>(
  data: T[],
  maxPoints: number = 100
): T[] => {
  if (data.length <= maxPoints) {
    return data;
  }
  
  const step = Math.ceil(data.length / maxPoints);
  const optimized: T[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    optimized.push(data[i]);
  }
  
  console.log(`📈 图表数据优化: ${data.length} -> ${optimized.length} 个数据点`);
  return optimized;
};

// 虚拟滚动辅助函数
export const calculateVisibleItems = (
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
  overscan: number = 5
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex, visibleCount: endIndex - startIndex + 1 };
};

// 图片懒加载
export const createImageObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  if (!('IntersectionObserver' in window)) {
    // 降级处理
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// 性能报告
export const generatePerformanceReport = () => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');
  
  const report = {
    // 页面加载时间
    pageLoad: {
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart),
      loadComplete: Math.round(navigation.loadEventEnd - navigation.fetchStart),
      firstByte: Math.round(navigation.responseStart - navigation.fetchStart)
    },
    
    // 渲染时间
    paint: {
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
    },
    
    // 内存使用
    memory: monitorMemoryUsage(),
    
    // 时间戳
    timestamp: new Date().toISOString()
  };
  
  console.table(report.pageLoad);
  console.table(report.paint);
  
  return report;
};

// 自动性能监控
export const startPerformanceMonitoring = (interval: number = 30000) => {
  const monitor = () => {
    generatePerformanceReport();
    monitorMemoryUsage();
  };
  
  // 立即执行一次
  monitor();
  
  // 定期监控
  const intervalId = setInterval(monitor, interval);
  
  // 返回清理函数
  return () => clearInterval(intervalId);
};