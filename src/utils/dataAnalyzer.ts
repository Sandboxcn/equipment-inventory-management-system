import { Device, Component, Statistics, FilterOptions, SortOptions, ChartData } from '../types';
import { groupBy, orderBy } from 'lodash';

export class DataAnalyzer {
  /**
   * 生成统计数据
   */
  generateStatistics(devices: Device[]): Statistics {
    const 设备总数 = devices.length;
    const 零部件总数 = devices.reduce((total, device) => total + device.零部件列表.length, 0);
    
    // 计算电机功率汇总
    let 电机功率汇总 = 0;
    devices.forEach(device => {
      device.零部件列表.forEach(component => {
        const power = this.extractPowerValue(component.电机功率);
        电机功率汇总 += power;
      });
    });

    // 设备分类统计（按工作部位）
    const 设备分类统计: Record<string, number> = {};
    devices.forEach(device => {
      const 部位 = device.工作部位 || '未分类';
      设备分类统计[部位] = (设备分类统计[部位] || 0) + 1;
    });

    // 零部件分类统计（按零部件名称）
    const 零部件分类统计: Record<string, number> = {};
    devices.forEach(device => {
      device.零部件列表.forEach(component => {
        const 名称 = component.零部件名称 || '未分类';
        零部件分类统计[名称] = (零部件分类统计[名称] || 0) + 1;
      });
    });

    return {
      设备总数,
      零部件总数,
      电机功率汇总,
      设备分类统计,
      零部件分类统计
    };
  }

  /**
   * 提取电机功率数值
   */
  private extractPowerValue(powerStr: string): number {
    if (!powerStr || powerStr.trim() === '') return 0;
    
    // 移除单位并提取数字
    const cleanStr = powerStr.replace(/[kw|KW|千瓦]/gi, '').trim();
    const value = parseFloat(cleanStr);
    return isNaN(value) ? 0 : value;
  }

  /**
   * 筛选设备数据
   */
  filterDevices(devices: Device[], filters: FilterOptions): Device[] {
    return devices.filter(device => {
      // 设备编号筛选
      if (filters.设备编号 && !device.设备编号.toLowerCase().includes(filters.设备编号.toLowerCase())) {
        return false;
      }

      // 工作部位筛选
      if (filters.工作部位 && !device.工作部位.toLowerCase().includes(filters.工作部位.toLowerCase())) {
        return false;
      }

      // 零部件名称筛选
      if (filters.零部件名称) {
        const hasMatchingComponent = device.零部件列表.some(component =>
          component.零部件名称.toLowerCase().includes(filters.零部件名称!.toLowerCase())
        );
        if (!hasMatchingComponent) return false;
      }

      // 型号规格筛选
      if (filters.型号规格) {
        const hasMatchingSpec = device.零部件列表.some(component =>
          component.型号规格.toLowerCase().includes(filters.型号规格!.toLowerCase())
        );
        if (!hasMatchingSpec) return false;
      }

      return true;
    });
  }

  /**
   * 搜索设备和零部件
   */
  searchDevices(devices: Device[], searchTerm: string): Device[] {
    if (!searchTerm || searchTerm.trim() === '') return devices;

    const term = searchTerm.toLowerCase().trim();
    
    return devices.filter(device => {
      // 搜索设备信息
      if (device.设备编号.toLowerCase().includes(term) ||
          device.工作部位.toLowerCase().includes(term)) {
        return true;
      }

      // 搜索零部件信息
      return device.零部件列表.some(component =>
        component.零部件名称.toLowerCase().includes(term) ||
        component.型号规格.toLowerCase().includes(term) ||
        component.数量及米数.toLowerCase().includes(term) ||
        component.电机功率.toLowerCase().includes(term) ||
        component.备注.toLowerCase().includes(term)
      );
    });
  }

  /**
   * 排序设备数据
   */
  sortDevices(devices: Device[], sortOptions: SortOptions): Device[] {
    const { field, direction } = sortOptions;
    
    return orderBy(devices, [field], [direction]);
  }

  /**
   * 分页处理
   */
  paginateDevices(devices: Device[], page: number, pageSize: number): {
    data: Device[];
    total: number;
    totalPages: number;
  } {
    const total = devices.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = devices.slice(startIndex, endIndex);

    return { data, total, totalPages };
  }

  /**
   * 生成图表数据 - 设备分类饼图
   */
  generateDeviceChartData(statistics: Statistics): ChartData {
    const labels = Object.keys(statistics.设备分类统计);
    const data = Object.values(statistics.设备分类统计);
    
    return {
      labels,
      datasets: [{
        label: '设备数量',
        data,
        backgroundColor: [
          '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe',
          '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }

  /**
   * 生成图表数据 - 零部件分类柱状图
   */
  generateComponentChartData(statistics: Statistics): ChartData {
    // 取前10个最常见的零部件
    const sortedComponents = Object.entries(statistics.零部件分类统计)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    const labels = sortedComponents.map(([name]) => name);
    const data = sortedComponents.map(([,count]) => count);
    
    return {
      labels,
      datasets: [{
        label: '零部件数量',
        data,
        backgroundColor: '#3b82f6',
        borderColor: '#1e40af',
        borderWidth: 1
      }]
    };
  }

  /**
   * 生成图表数据 - 电机功率分布
   */
  generatePowerChartData(devices: Device[]): ChartData {
    const powerRanges = {
      '0-1KW': 0,
      '1-5KW': 0,
      '5-10KW': 0,
      '10-20KW': 0,
      '20KW以上': 0
    };

    devices.forEach(device => {
      device.零部件列表.forEach(component => {
        const power = this.extractPowerValue(component.电机功率);
        
        // 只统计有功率的设备，过滤掉无功率的设备
        if (power > 0) {
          if (power <= 1) {
            powerRanges['0-1KW']++;
          } else if (power <= 5) {
            powerRanges['1-5KW']++;
          } else if (power <= 10) {
            powerRanges['5-10KW']++;
          } else if (power <= 20) {
            powerRanges['10-20KW']++;
          } else {
            powerRanges['20KW以上']++;
          }
        }
      });
    });

    // 过滤掉数量为0的功率范围
    const filteredLabels: string[] = [];
    const filteredData: number[] = [];
    const filteredColors: string[] = [];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
    
    Object.entries(powerRanges).forEach(([label, count], index) => {
      if (count > 0) {
        filteredLabels.push(label);
        filteredData.push(count);
        filteredColors.push(colors[index]);
      }
    });

    return {
      labels: filteredLabels,
      datasets: [{
        label: '零部件数量',
        data: filteredData,
        backgroundColor: filteredColors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }

  /**
   * 导出数据为CSV格式
   */
  exportToCSV(devices: Device[]): string {
    const headers = ['设备编号', '工作部位', '零部件名称', '型号规格', '数量及米数', '电机功率', '备注'];
    const rows = [headers];

    devices.forEach(device => {
      if (device.零部件列表.length === 0) {
        // 如果没有零部件，只显示设备信息
        rows.push([
          device.设备编号,
          device.工作部位,
          '', '', '', '', ''
        ]);
      } else {
        // 第一个零部件显示设备信息
        const firstComponent = device.零部件列表[0];
        rows.push([
          device.设备编号,
          device.工作部位,
          firstComponent.零部件名称,
          firstComponent.型号规格,
          firstComponent.数量及米数,
          firstComponent.电机功率,
          firstComponent.备注
        ]);

        // 其他零部件不显示设备信息
        device.零部件列表.slice(1).forEach(component => {
          rows.push([
            '', '',
            component.零部件名称,
            component.型号规格,
            component.数量及米数,
            component.电机功率,
            component.备注
          ]);
        });
      }
    });

    return rows.map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * 导出统计报告
   */
  exportStatisticsReport(statistics: Statistics): string {
    const report = [
      '设备清单统计报告',
      '==================',
      '',
      '基本统计:',
      `设备总数: ${statistics.设备总数}`,
      `零部件总数: ${statistics.零部件总数}`,
      `电机功率汇总: ${statistics.电机功率汇总.toFixed(2)}KW`,
      '',
      '设备分类统计:',
      ...Object.entries(statistics.设备分类统计).map(([name, count]) => `${name}: ${count}`),
      '',
      '零部件分类统计:',
      ...Object.entries(statistics.零部件分类统计)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([name, count]) => `${name}: ${count}`),
      '',
      `报告生成时间: ${new Date().toLocaleString('zh-CN')}`
    ];

    return report.join('\n');
  }
}

export const dataAnalyzer = new DataAnalyzer();