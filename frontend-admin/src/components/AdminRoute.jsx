import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    message.error('Bạn không có quyền truy cập vào khu vực Quản trị viên!');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
