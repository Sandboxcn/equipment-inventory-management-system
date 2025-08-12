import React from 'react';
import { Cpu, Database, BarChart3, Zap, Rocket, Trophy, Bot, Sparkles } from 'lucide-react';

const ProjectIntro: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Bot className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              智能设备清单管理系统
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              AI驱动的数据可视化分析平台
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full font-semibold">
              <Sparkles className="h-5 w-5 mr-2" />
              100% AI辅助开发
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Project Overview */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Bot className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">项目概述</h2>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              本项目是一个<strong>完全由AI辅助开发</strong>的智能设备清单管理系统，展现了人工智能在现代Web开发中的强大能力。
              通过AI代码生成、智能架构设计和自动化测试，我们构建了一个功能完整、用户体验优秀的数据分析平台。
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">AI制作特色</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• 100% AI辅助开发：从需求分析到代码实现，全程AI参与</li>
                  <li>• 智能代码生成：AI自动生成高质量的React组件和TypeScript代码</li>
                  <li>• 自动化架构设计：AI优化的项目结构和模块化设计</li>
                  <li>• 智能UI/UX设计：AI驱动的响应式界面和交互体验</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">核心功能特色</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <Database className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">数据处理与分析</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• CSV文件智能解析</li>
                <li>• 实时数据验证</li>
                <li>• 多维度数据分析</li>
                <li>• 动态数据筛选</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">可视化图表系统</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 多样化图表类型</li>
                <li>• 交互式数据探索</li>
                <li>• 实时动画效果</li>
                <li>• 响应式设计</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <Zap className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">智能分析功能</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• KPI指标监控</li>
                <li>• 趋势分析预测</li>
                <li>• 异常检测提醒</li>
                <li>• 设备详情管理</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Cpu className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">技术架构亮点</h2>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">前端技术栈</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>React 18</strong> + <strong>TypeScript</strong>：现代化前端开发框架</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Vite</strong>：极速构建工具，优化开发体验</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Tailwind CSS</strong>：原子化CSS框架</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Chart.js</strong>：专业级图表库</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">数据处理</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>PapaParse</strong>：高性能CSV解析库</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>Lodash</strong>：实用工具函数库</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                    <span className="text-gray-700"><strong>自定义数据分析器</strong>：智能数据统计</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Development Process */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Bot className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">AI辅助开发过程</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">需求分析阶段</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• AI分析用户需求，生成详细的功能规格说明</li>
                <li>• 自动创建技术架构文档和开发计划</li>
                <li>• 智能评估技术可行性和开发周期</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">代码开发阶段</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• AI生成高质量的React组件代码</li>
                <li>• 自动实现复杂的数据处理逻辑</li>
                <li>• 智能优化代码结构和性能</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">测试优化阶段</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• AI驱动的代码审查和bug修复</li>
                <li>• 自动化性能优化和用户体验提升</li>
                <li>• 智能生成测试用例和文档</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Future Plans */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Rocket className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">未来发展规划</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">短期目标（1-3个月）</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700">
                  <li>• 机器学习集成：添加智能数据预测和分析功能</li>
                  <li>• 实时数据处理：支持WebSocket实时数据更新</li>
                </ul>
                <ul className="space-y-2 text-gray-700">
                  <li>• 移动端优化：开发专门的移动端应用</li>
                  <li>• 多语言支持：国际化功能实现</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">中期目标（3-6个月）</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700">
                  <li>• 云端部署优化：完整的云原生架构</li>
                  <li>• 大数据处理：支持TB级数据分析</li>
                </ul>
                <ul className="space-y-2 text-gray-700">
                  <li>• AI智能助手：集成对话式数据查询</li>
                  <li>• 协作功能：多用户实时协作编辑</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">长期愿景（6-12个月）</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700">
                  <li>• 行业解决方案：针对不同行业的定制化方案</li>
                  <li>• AI自动化运维：智能监控和自动故障处理</li>
                </ul>
                <ul className="space-y-2 text-gray-700">
                  <li>• 边缘计算支持：支持IoT设备数据实时处理</li>
                  <li>• 区块链集成：数据安全和溯源功能</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Competition Advantages */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <Trophy className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">竞赛优势总结</h2>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">技术创新性</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• AI全程参与开发：展现AI在软件开发中的实际应用</li>
                  <li>• 现代化技术栈：使用最新的前端开发技术</li>
                  <li>• 高质量代码：AI生成的代码具有良好的可维护性</li>
                  <li>• 用户体验优秀：AI优化的界面设计和交互体验</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">实用价值</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 解决实际问题：设备管理是企业的真实需求</li>
                  <li>• 易于使用：直观的操作界面，无需专业培训</li>
                  <li>• 扩展性强：可适应不同规模和类型的企业</li>
                  <li>• 部署简单：支持多种部署方式</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-orange-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">市场前景</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-700">
                  <li>• 广阔的应用场景：适用于制造业、物流、医疗等多个行业</li>
                  <li>• 成本效益显著：提高设备管理效率，降低运营成本</li>
                </ul>
                <ul className="space-y-2 text-gray-700">
                  <li>• 技术趋势符合：符合数字化转型和智能化发展趋势</li>
                  <li>• 商业化潜力：具备良好的商业化前景</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="bg-gray-900 text-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">联系信息</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-2"><strong>项目名称：</strong>智能设备清单管理系统</p>
                <p className="mb-2"><strong>开发方式：</strong>AI辅助开发</p>
                <p className="mb-2"><strong>技术栈：</strong>React + TypeScript + AI</p>
              </div>
              <div>
                <p className="mb-2"><strong>部署地址：</strong>支持本地部署和云端访问</p>
                <p className="mb-2"><strong>开源协议：</strong>MIT License</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Quote */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
            <p className="text-lg italic leading-relaxed">
              本项目完全展现了AI在现代软件开发中的强大能力，从需求分析到代码实现，从界面设计到用户体验，
              AI的参与让开发过程更加高效、智能和创新。这不仅是一个功能完整的设备管理系统，
              更是AI驱动软件开发的成功实践案例。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProjectIntro;