import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Device, Component } from '../types';
import { dataAnalyzer } from '../utils/dataAnalyzer';

const DeviceDetail: React.FC = () => {
  const { deviceId } = useParams<{ deviceId: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'model' | 'quantity' | 'power'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadDeviceData();
  }, [deviceId]);

  const loadDeviceData = () => {
    try {
      const savedData = localStorage.getItem('deviceData');
      if (!savedData) {
        setError('未找到数据，请先上传CSV文件');
        setLoading(false);
        return;
      }

      const devices: Device[] = JSON.parse(savedData);
      const foundDevice = devices.find(d => d.id === deviceId);
      
      if (!foundDevice) {
        setError('未找到指定设备');
        setLoading(false);
        return;
      }

      setDevice(foundDevice);
      setLoading(false);
    } catch (err) {
      setError('数据加载失败');
      setLoading(false);
    }
  };

  const exportDeviceData = () => {
    if (!device) return;
    
    const csvData = dataAnalyzer.exportToCSV([device]);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `设备_${device.设备编号}_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAndSortedComponents = React.useMemo(() => {
    if (!device) return [];
    
    let components = device.零部件列表;
    
    // 搜索过滤
    if (searchTerm) {
      components = components.filter(component => 
        component.零部件名称.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.型号规格.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.备注.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 排序
    components = [...components].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.零部件名称;
          bValue = b.零部件名称;
          break;
        case 'model':
          aValue = a.型号规格;
          bValue = b.型号规格;
          break;
        case 'quantity':
          aValue = parseFloat(a.数量及米数.replace(/[^\d.]/g, '')) || 0;
          bValue = parseFloat(b.数量及米数.replace(/[^\d.]/g, '')) || 0;
          break;
        case 'power':
          aValue = parseFloat(a.电机功率.replace(/[^\d.]/g, '')) || 0;
          bValue = parseFloat(b.电机功率.replace(/[^\d.]/g, '')) || 0;
          break;
        default:
          aValue = a.零部件名称;
          bValue = b.零部件名称;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue, 'zh-CN');
        return sortOrder === 'asc' ? result : -result;
      } else {
        const result = (aValue as number) - (bValue as number);
        return sortOrder === 'asc' ? result : -result;
      }
    });
    
    return components;
  }, [device, searchTerm, sortBy, sortOrder]);

  const deviceStatistics = React.useMemo(() => {
    if (!device) return null;
    
    const totalComponents = device.零部件列表.length;
    const totalPower = device.零部件列表.reduce((sum, component) => {
      const power = parseFloat(component.电机功率.replace(/[^\d.]/g, '')) || 0;
      return sum + power;
    }, 0);
    
    const componentTypes = new Set(device.零部件列表.map(c => c.零部件名称)).size;
    const hasRemarks = device.零部件列表.filter(c => c.备注.trim() !== '').length;
    
    return {
      totalComponents,
      totalPower,
      componentTypes,
      hasRemarks
    };
  }, [device]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载设备信息中..." />
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <ErrorMessage
            title="设备信息加载失败"
            message={error || '未找到设备信息'}
          />
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/analysis')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              返回数据分析
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/analysis')}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                返回分析页
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  设备详情 - {device.设备编号}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{device.工作部位}</p>
              </div>
            </div>
            
            <button
              onClick={exportDeviceData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              导出设备数据
            </button>
          </div>
        </div>

        {/* 设备概览统计 */}
        {deviceStatistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card padding="sm" className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CogIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{deviceStatistics.totalComponents}</div>
              <div className="text-sm text-gray-600">零部件总数</div>
            </Card>
            
            <Card padding="sm" className="text-center">
              <div className="flex items-center justify-center mb-2">
                <WrenchScrewdriverIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{deviceStatistics.componentTypes}</div>
              <div className="text-sm text-gray-600">零部件类型</div>
            </Card>
            
            <Card padding="sm" className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BoltIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {deviceStatistics.totalPower > 0 ? `${deviceStatistics.totalPower.toFixed(2)}KW` : '-'}
              </div>
              <div className="text-sm text-gray-600">电机功率汇总</div>
            </Card>
            
            <Card padding="sm" className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DocumentTextIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">{deviceStatistics.hasRemarks}</div>
              <div className="text-sm text-gray-600">有备注项目</div>
            </Card>
          </div>
        )}

        {/* 搜索和排序 */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 搜索框 */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="搜索零部件名称、型号规格、备注..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 排序选项 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">排序:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">零部件名称</option>
                  <option value="model">型号规格</option>
                  <option value="quantity">数量</option>
                  <option value="power">电机功率</option>
                </select>
              </div>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '升序 ↑' : '降序 ↓'}
              </button>
            </div>
          </div>
        </Card>

        {/* 零部件列表 */}
        <Card title={`零部件列表 (${filteredAndSortedComponents.length})`}>
          {filteredAndSortedComponents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '未找到匹配的零部件' : '该设备暂无零部件信息'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      零部件名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      型号规格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      数量及米数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      电机功率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      备注
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedComponents.map((component, index) => {
                    const power = parseFloat(component.电机功率.replace(/[^\d.]/g, '')) || 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {component.零部件名称}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {component.型号规格 || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {component.数量及米数 || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {power > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {power.toFixed(2)}KW
                              </span>
                            ) : (
                              '-'
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate" title={component.备注}>
                            {component.备注 || '-'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <Link
            to="/analysis"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回数据分析
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;