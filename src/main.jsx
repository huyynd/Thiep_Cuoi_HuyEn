import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const isAdminRoute = window.location.pathname.replace(/\/$/, '') === '/huy_en/superadmin';
const Admin = lazy(() => import('./Admin.jsx'));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdminRoute ? <Suspense fallback={<main className="admin-page"><div className="admin-loading">Đang mở trang quản trị...</div></main>}><Admin /></Suspense> : <App />}
  </React.StrictMode>
);
