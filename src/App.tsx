import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

// 懒加载页面组件以优化性能
const Home = React.lazy(() => import('./pages/Home'));
const Analysis = React.lazy(() => import('./pages/Analysis'));
const DeviceDetail = React.lazy(() => import('./pages/DeviceDetail'));
const ProjectIntro = React.lazy(() => import('./pages/ProjectIntro'));

// 加载组件
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 font-medium">加载中...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/device/:deviceId" element={<DeviceDetail />} />
              <Route path="/project-intro" element={<ProjectIntro />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
