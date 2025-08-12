import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  TableCellsIcon,
  EyeIcon,
  PresentationChartBarIcon,
  CpuChipIcon,
  BoltIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import KPICard from '../components/charts/KPICard';
import GaugeChart from '../components/charts/GaugeChart';
import RadarChart from '../components/charts/RadarChart';
import HeatmapChart from '../components/charts/HeatmapChart';
import TrendChart from '../components/charts/TrendChart';
import DonutChart from '../components/charts/DonutChart';
import { Device, FilterOptions, Statistics } from '../types';
import { dataAnalyzer } from '../utils/dataAnalyzer';
import InteractiveExplorer from '../components/charts/InteractiveExplorer';
import { ChartLinkageProvider, LinkageControlPanel } from '../components/charts/ChartLinkage';
import TrendAnalysis from '../components/charts/TrendAnalysis';

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analysis: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'advanced' | 'interactive'>('table');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [devices, searchTerm, filters]);

  const loadData = () => {
    try {
      const savedData = localStorage.getItem('deviceData');
      if (!savedData) {
        setError('未找到数据，请先上传CSV文件');
        setLoading(false);
        return;
      }

      const deviceData: Device[] = JSON.parse(savedData);
      setDevices(deviceData);
      
      // 生成统计数据
      const stats = dataAnalyzer.generateStatistics(deviceData);
      setStatistics(stats);
      
      setLoading(false);
    } catch (err) {
      setError('数据加载失败');
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let result = devices;

    // 应用搜索
    if (searchTerm) {
      result = dataAnalyzer.searchDevices(result, searchTerm);
    }

    // 应用筛选
    result = dataAnalyzer.filterDevices(result, filters);

    setFilteredDevices(result);
    setCurrentPage(1); // 重置到第一页
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const exportData = () => {
    const csvData = dataAnalyzer.exportToCSV(filteredDevices);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `设备清单_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReport = () => {
    if (!statistics) return;
    
    const report = dataAnalyzer.exportStatisticsReport(statistics);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `统计报告_${new Date().toLocaleDateString()}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 分页数据
  const paginatedData = useMemo(() => {
    return dataAnalyzer.paginateDevices(filteredDevices, currentPage, pageSize);
  }, [filteredDevices, currentPage, pageSize]);

  // 图表数据
  const chartData = useMemo(() => {
    if (!statistics) return null;
    
    return {
      deviceChart: dataAnalyzer.generateDeviceChartData(statistics),
      componentChart: dataAnalyzer.generateComponentChartData(statistics),
      powerChart: dataAnalyzer.generatePowerChartData(devices)
    };
  }, [statistics, devices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载数据中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ErrorMessage
            title="数据加载失败"
            message={error}
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 页面标题和统计概览 */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-black mb-2">数据分析</h1>
          <p className="text-gray-600">深入分析设备数据，发现潜在问题和优化机会（部分数据为演示数据）</p>
          
          {statistics && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <KPICard
                title="设备总数"
                value={statistics.设备总数}
                unit="台"
                change={5.2}
                trend="up"
                icon={<CpuChipIcon />}
                colorScheme="tech"
                size="sm"
                target={1500}
                description="系统中注册的设备数量"
              />
              <KPICard
                title="零部件总数"
                value={statistics.零部件总数}
                unit="个"
                change={8.7}
                trend="up"
                icon={<Cog6ToothIcon />}
                colorScheme="modern"
                size="sm"
                sparklineData={[2800, 2950, 3100, 3200, 3350, statistics.零部件总数]}
                showSparkline={true}
              />
              <KPICard
                title="电机功率汇总"
                value={statistics.电机功率汇总.toFixed(2)}
                unit="KW"
                change={-2.1}
                trend="down"
                icon={<BoltIcon />}
                colorScheme="warm"
                size="sm"
                target={10000}
              />
              <KPICard
                title="筛选结果"
                value={filteredDevices.length}
                unit="条"
                change={0}
                trend="neutral"
                icon={<MagnifyingGlassIcon />}
                colorScheme="business"
                size="sm"
                description="当前筛选条件下的结果"
              />
            </motion.div>
          )}
        </motion.div>

        {/* 搜索和筛选 */}
        <motion.div 
          className="mb-6 bg-white rounded-lg shadow-lg p-6 border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索设备编号、零部件名称等..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                  showFilters ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-gray-700'
                } hover:bg-gray-50`}
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                筛选
              </button>
              
              <button
                onClick={exportData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                导出数据
              </button>
              
              <button
                onClick={exportReport}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                导出报告
              </button>
            </div>
          </div>

          {/* 筛选面板 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">设备编号</label>
                  <input
                    type="text"
                    value={filters.设备编号 || ''}
                    onChange={(e) => handleFilterChange('设备编号', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工作部位</label>
                  <input
                    type="text"
                    value={filters.工作部位 || ''}
                    onChange={(e) => handleFilterChange('工作部位', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">零部件名称</label>
                  <input
                    type="text"
                    value={filters.零部件名称 || ''}
                    onChange={(e) => handleFilterChange('零部件名称', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    清除筛选
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* 标签页切换 */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <motion.button
                onClick={() => setActiveTab('table')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'table'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <TableCellsIcon className="h-5 w-5 inline mr-2" />
                数据表格
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('charts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'charts'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                统计图表
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('advanced')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'advanced'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PresentationChartBarIcon className="h-5 w-5 inline mr-2" />
                高级分析（演示）
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('interactive')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'interactive'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CpuChipIcon className="h-5 w-5 inline mr-2" />
                交互探索（演示）
              </motion.button>
            </nav>
          </div>
        </motion.div>

        {/* 内容区域 */}
        {activeTab === 'table' ? (
          /* 数据表格 */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="bg-white shadow-lg overflow-hidden sm:rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">设备编号</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">工作部位</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">零部件数量</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">电机功率</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.data.map((device, index) => {
                        const totalPower = device.零部件列表.reduce((sum, component) => {
                          const power = parseFloat(component.电机功率.replace(/[^\d.]/g, '')) || 0;
                          return sum + power;
                        }, 0);
                        
                        return (
                          <motion.tr 
                            key={device.id} 
                            className="hover:bg-gray-50 transition-all duration-300"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.01, x: 5 }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                              {device.设备编号}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {device.工作部位}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {device.零部件列表.length}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                              {totalPower > 0 ? `${totalPower.toFixed(2)}KW` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                to={`/device/${device.id}`}
                                className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors duration-200"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                查看详情
                              </Link>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {paginatedData.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, currentPage + 1))}
                        disabled={currentPage === paginatedData.totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        下一页
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="text-sm text-gray-700">
                        显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, paginatedData.total)} 条，
                        共 {paginatedData.total} 条记录
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          上一页
                        </motion.button>
                        <span className="px-3 py-2 text-sm text-gray-700">
                          第 {currentPage} 页，共 {paginatedData.totalPages} 页
                        </span>
                        <motion.button
                          onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, currentPage + 1))}
                          disabled={currentPage === paginatedData.totalPages}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          下一页
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
) : activeTab === 'charts' ? (
          /* 统计图表 */
          chartData && (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-96">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">设备分类分布</h3>
                <div className="h-64">
                  <Pie 
                    data={chartData.deviceChart} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                </div>
              </Card>
              
              <Card className="h-96">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">零部件分类统计</h3>
                <div className="h-64">
                  <Bar 
                    data={chartData.componentChart} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </div>
              </Card>
              
              <Card className="h-96 lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">电机功率分布</h3>
                <div className="h-64">
                  <Pie 
                    data={chartData.powerChart} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }} 
                  />
                </div>
              </Card>
            </motion.div>
          )
        ) : activeTab === 'advanced' ? (
          /* 高级分析 */
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* 第一行：仪表盘和雷达图 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4 text-black">设备运行效率</h3>
                <div className="h-64 flex items-center justify-center">
                  <GaugeChart
                    value={85}
                    min={0}
                    max={100}
                    unit="%"
                    size={200}
                    colorScheme="tech"
                  />
                </div>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold mb-4 text-black">设备性能雷达图</h3>
                <div className="h-64">
                  <RadarChart
                    title="设备性能雷达图"
                    data={[
                      { label: '效率', value: 85, maxValue: 100 },
                      { label: '稳定性', value: 92, maxValue: 100 },
                      { label: '能耗', value: 78, maxValue: 100 },
                      { label: '维护性', value: 88, maxValue: 100 },
                      { label: '安全性', value: 95, maxValue: 100 },
                      { label: '可靠性', value: 90, maxValue: 100 }
                    ]}
                    size={240}
                    colorScheme="modern"
                    fillOpacity={0.3}
                  />
                </div>
              </Card>
            </div>

            {/* 第二行：热力图和趋势图 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold mb-4 text-black">设备运行时间热力图</h3>
                <div className="h-64">
                  <HeatmapChart
                    title="设备运行时间热力图"
                    data={[
                      { x: '0', y: '0', value: 8, label: '周一 00-04' },
                      { x: '1', y: '0', value: 12, label: '周二 00-04' },
                      { x: '2', y: '0', value: 15, label: '周三 00-04' },
                      { x: '3', y: '0', value: 18, label: '周四 00-04' },
                      { x: '4', y: '0', value: 22, label: '周五 00-04' },
                      { x: '5', y: '0', value: 25, label: '周六 00-04' },
                      { x: '6', y: '0', value: 28, label: '周日 00-04' },
                      { x: '0', y: '1', value: 10, label: '周一 04-08' },
                      { x: '1', y: '1', value: 14, label: '周二 04-08' },
                      { x: '2', y: '1', value: 17, label: '周三 04-08' },
                      { x: '3', y: '1', value: 20, label: '周四 04-08' },
                      { x: '4', y: '1', value: 24, label: '周五 04-08' },
                      { x: '5', y: '1', value: 27, label: '周六 04-08' },
                      { x: '6', y: '1', value: 30, label: '周日 04-08' },
                      { x: '0', y: '2', value: 12, label: '周一 08-12' },
                      { x: '1', y: '2', value: 16, label: '周二 08-12' },
                      { x: '2', y: '2', value: 17, label: '周三 08-12' },
                      { x: '3', y: '2', value: 22, label: '周四 08-12' },
                      { x: '4', y: '2', value: 26, label: '周五 08-12' },
                      { x: '5', y: '2', value: 29, label: '周六 08-12' },
                      { x: '6', y: '2', value: 32, label: '周日 08-12' }
                    ]}
                    xLabels={['周一', '周二', '周三', '周四', '周五', '周六', '周日']}
                    yLabels={['00-04', '04-08', '08-12', '12-16', '16-20', '20-24']}
                    colorScheme="warm"
                    cellSize={30}
                  />
                </div>
              </Card>
              <Card>
                <h3 className="text-lg font-semibold mb-4 text-black">设备数量趋势</h3>
                <div className="h-64">
                  <TrendChart
                    title="设备数量趋势"
                    data={[
                      { x: '1月', y: 120, label: '1月设备数量' },
                      { x: '2月', y: 135, label: '2月设备数量' },
                      { x: '3月', y: 148, label: '3月设备数量' },
                      { x: '4月', y: 142, label: '4月设备数量' },
                      { x: '5月', y: 156, label: '5月设备数量' },
                      { x: '6月', y: 168, label: '6月设备数量' },
                      { x: '7月', y: 175, label: '7月设备数量' },
                      { x: '8月', y: 182, label: '8月设备数量' },
                      { x: '9月', y: 178, label: '9月设备数量' },
                      { x: '10月', y: 190, label: '10月设备数量' },
                      { x: '11月', y: 195, label: '11月设备数量' },
                      { x: '12月', y: 203, label: '12月设备数量' }
                    ]}
                    colorScheme="cool"
                    showArea={true}
                    showPoints={true}
                  />
                </div>
              </Card>
            </div>

            {/* 第三行：环形图和更多KPI */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-1">
                <h3 className="text-lg font-semibold mb-4 text-black">设备状态分布</h3>
                <div className="h-64 flex items-center justify-center">
                  <DonutChart
                    title="设备状态分布"
                    data={[
                      { label: '正常运行', value: 156, color: '#10B981' },
                      { label: '维护中', value: 23, color: '#F59E0B' },
                      { label: '故障', value: 8, color: '#EF4444' },
                      { label: '停机', value: 15, color: '#6B7280' }
                    ]}
                    size={200}
                    innerRadius={60}
                    outerRadius={90}
                    showLabels={true}
                    showPercentages={true}
                    colorScheme="business"
                  />
                </div>
              </Card>
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <KPICard
                  title="平均运行时间"
                  value={18.5}
                  unit="小时/天"
                  change={2.3}
                  trend="up"
                  icon={<BoltIcon />}
                  colorScheme="modern"
                  size="md"
                  target={20}
                />
                <KPICard
                  title="故障率"
                  value={3.2}
                  unit="%"
                  change={-0.8}
                  trend="down"
                  icon={<CpuChipIcon />}
                  colorScheme="warm"
                  size="md"
                  target={2}
                />
                <KPICard
                  title="维护成本"
                  value={45.8}
                  unit="万元"
                  change={-5.2}
                  trend="down"
                  icon={<Cog6ToothIcon />}
                  colorScheme="tech"
                  size="md"
                  sparklineData={[52, 48, 51, 47, 49, 45.8]}
                  showSparkline={true}
                />
                <KPICard
                  title="能耗效率"
                  value={92.3}
                  unit="%"
                  change={1.5}
                  trend="up"
                  icon={<BoltIcon />}
                  colorScheme="business"
                  size="md"
                  target={95}
                />
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'interactive' ? (
          /* 交互探索 */
           <ChartLinkageProvider>
             <motion.div 
               className="space-y-6"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.1 }}
             >
               <LinkageControlPanel />
               <InteractiveExplorer 
                 data={filteredDevices.map(device => ({
                   id: device.id,
                   label: device.设备编号,
                   value: device.零部件列表.length,
                   category: device.工作部位,
                   subcategory: device.零部件列表[0]?.零部件名称 || '未知',
                   metadata: { 
                     totalPower: device.零部件列表.reduce((sum, component) => {
                       const power = parseFloat(component.电机功率.replace(/[^\d.]/g, '')) || 0;
                       return sum + power;
                     }, 0)
                   }
                 }))}
                 title="设备交互探索"
                 colorScheme="tech"
               />
               
               {/* 趋势分析 */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: 0.3 }}
               >
                 <h2 className="text-xl font-semibold text-gray-900 mb-4">趋势分析与预测</h2>
                 <TrendAnalysis devices={filteredDevices} colorScheme="tech" />
               </motion.div>
             </motion.div>
           </ChartLinkageProvider>
        ) : null}
      </div>
    </div>
  );
};

export default Analysis;