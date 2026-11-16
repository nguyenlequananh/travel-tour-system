import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';

const GuideRoute = () => {
  const { isAuthenticated, isGuide, isAdmin } = useAuth();

  if (!isAuthenticated || (!isGuide && !isAdmin)) {
    message.error('Bạn không có quyền truy cập vào cổng thông tin Hướng dẫn viên!');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuideRoute;
