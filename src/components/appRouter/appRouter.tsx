import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { routerConfig } from './routeConfig';
import NotFoundPage from '../pages/error404';
import { Spin } from 'antd';

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <Spin size="large" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {Object.values(routerConfig).map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
