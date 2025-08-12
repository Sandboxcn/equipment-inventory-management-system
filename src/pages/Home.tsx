import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, DocumentTextIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { csvParser } from '../utils/csvParser';
import { Device } from '../types';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // 检查文件类型
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('请上传CSV格式的文件');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 解析CSV文件
      const rawData = await csvParser.parseFile(file);
      
      // 验证数据
      const validation = csvParser.validateData(rawData);
      if (!validation.isValid) {
        setError(`数据验证失败: ${validation.errors.join(', ')}`);
        setLoading(false);
        return;
      }

      // 处理数据
      const devices = csvParser.processInheritance(rawData);
      
      if (devices.length === 0) {
        setError('未找到有效的设备数据');
        setLoading(false);
        return;
      }

      // 存储数据到localStorage
      localStorage.setItem('deviceData', JSON.stringify(devices));
      localStorage.setItem('uploadTime', new Date().toISOString());
      localStorage.setItem('fileName', file.name);

      // 跳转到分析页面
      navigate('/analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const downloadSampleFile = () => {
    const sampleData = csvParser.generateSampleData();
    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '设备清单示例.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 relative overflow-hidden">
      {/* 3D背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.1),rgba(147,51,234,0.1),rgba(59,130,246,0.1))]" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 页面标题 */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            设备清单管理系统
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            上传CSV文件，快速分析设备和零部件数据
          </motion.p>
        </motion.div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6">
            <ErrorMessage
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {/* 文件上传区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm" title="上传CSV文件">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 scale-105'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
            {loading ? (
              <LoadingSpinner size="lg" text="正在处理文件..." />
            ) : (
              <>
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    拖拽CSV文件到此处，或
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    选择文件
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  支持CSV格式文件，最大10MB
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          </Card>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* 使用说明 */}
          <Card title="使用说明" className="h-fit shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">CSV文件格式要求</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    文件必须包含以下列：设备编号、工作部位、零部件名称、型号规格、数量及米数、电机功率、备注
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">数据格式说明</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    设备编号和工作部位只在第一行填写，后续空行自动继承该设备信息
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900">分析功能</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    系统将自动生成设备统计、零部件分析、电机功率汇总等报告
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 示例数据 */}
          <Card title="示例数据" className="h-fit shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                下载示例CSV文件，了解正确的数据格式：
              </p>
              
              <button
                onClick={downloadSampleFile}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                下载示例文件
              </button>
              
              <div className="bg-gray-50 rounded-md p-3 text-xs font-mono">
                <div className="text-gray-500 mb-2">示例数据预览：</div>
                <div className="space-y-1 text-gray-700">
                  <div>设备编号,工作部位,零部件名称,型号规格,数量及米数,电机功率,备注</div>
                  <div>HC-001,1#真空回潮机,密封圈,NJBφ65,2,,气动球阀用</div>
                  <div>,,密封圈,NJBφ100,1,,气动球阀用</div>
                  <div>,,加湿电磁阀,SMC VXD2260-10-5DZL,1,,加潮</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;