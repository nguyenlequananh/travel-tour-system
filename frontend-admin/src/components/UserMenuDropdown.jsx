import React from 'react';
import { Dropdown, Space, Avatar, Tag } from 'antd';
import {
  UserOutlined, LogoutOutlined, LockOutlined,
  CompassOutlined, DownOutlined, GlobalOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserMenuDropdown = ({ onOpenProfile }) => {
  const { user, isAdmin, isGuide, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isAdminPortal = location.pathname.startsWith('/admin');
  const isGuidePortal = location.pathname.startsWith('/guide');

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: onOpenProfile,
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: 'Đổi mật khẩu',
      onClick: onOpenProfile,
    },
    ...(!isAdminPortal && !isGuidePortal ? [
      {
        key: 'my-bookings',
        icon: <ShoppingOutlined />,
        label: 'Vé du lịch của tôi',
        onClick: () => navigate('/my-bookings'),
      }
    ] : []),
    ...(isAdmin ? [
      isAdminPortal ? {
        key: 'client-view',
        icon: <GlobalOutlined />,
        label: 'Xem trang khách hàng',
        onClick: () => window.open('/', '_blank'),
      } : {
        key: 'admin-portal',
        icon: <CompassOutlined />,
        label: 'Trang quản trị (Admin)',
        onClick: () => navigate('/admin/dashboard'),
      }
    ] : []),
    ...(isGuide && !isGuidePortal ? [
      {
        key: 'guide-portal',
        icon: <CompassOutlined />,
        label: 'Cổng hướng dẫn viên',
        onClick: () => navigate('/guide'),
      }
    ] : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: () => {
        logout();
        navigate('/');
      },
    },
  ];

  const getRoleTag = () => {
    if (isAdmin) return <Tag color="volcano" style={{ margin: 0, fontSize: 11 }}>ADMIN</Tag>;
    if (isGuide) return <Tag color="green" style={{ margin: 0, fontSize: 11 }}>GUIDE</Tag>;
    return <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>KHÁCH HÀNG</Tag>;
  };

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
      <Space
        style={{
          cursor: 'pointer',
          padding: '4px 12px',
          borderRadius: 24,
          background: isAdminPortal ? '#f5f5f5' : '#f0f5ff',
          border: '1px solid #d6e4ff',
          transition: 'all 0.2s',
        }}
      >
        <Avatar style={{ backgroundColor: isAdminPortal ? '#ff4d4f' : '#1677ff' }} icon={<UserOutlined />} />
        <span style={{ fontWeight: 600, color: '#262626', fontSize: 14 }}>
          {user.fullName || user.email}
        </span>
        {getRoleTag()}
        <DownOutlined style={{ fontSize: 10, color: '#8c8c8c' }} />
      </Space>
    </Dropdown>
  );
};

export default UserMenuDropdown;
