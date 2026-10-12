import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { message } from 'antd';

const AdminRoute = () => {
  // 1. Đọc thông tin người dùng từ localStorage
  const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');
  const roles = savedUser.roles || [];

  // 2. KIỂM TRA QUYỀN HẠN
  const isAdmin = roles.includes('ROLE_ADMIN');

  if (!isAdmin) {
    // Nếu chưa đăng nhập hoặc không phải Admin -> Báo lỗi đỏ và đá về Trang chủ!
    message.error('Bạn không có quyền truy cập vào khu vực Quản trị viên!');
    return <Navigate to="/" replace />;
  }

  // 3. Nếu ĐÚNG LÀ ADMIN -> Cho phép vào các trang quản trị bên trong!
  return <Outlet />;
};

export default AdminRoute;