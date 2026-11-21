import React from 'react';
import { Dropdown, Space, Avatar, Tag } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  CompassOutlined,
  DownOutlined,
  GlobalOutlined,
  ShoppingOutlined,
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
    ...(!isAdminPortal && !isGuidePortal
      ? [
          {
            key: 'my-bookings',
            icon: <ShoppingOutlined />,
            label: 'Vé du lịch của tôi',
            onClick: () => navigate('/my-bookings'),
          },
        ]
      : []),
    ...(isAdmin
      ? [
          isAdminPortal
            ? {
                key: 'client-view',
                icon: <GlobalOutlined />,
                label: 'Xem trang khách hàng',
                onClick: () => window.open('/', '_blank'),
              }
            : {
                key: 'admin-portal',
                icon: <CompassOutlined />,
                label: 'Trang quản trị (Admin)',
                onClick: () => navigate('/admin/dashboard'),
              },
        ]
      : []),
    ...(isGuide && !isGuidePortal
      ? [
          {
            key: 'guide-portal',
            icon: <CompassOutlined />,
            label: 'Cổng hướng dẫn viên',
            onClick: () => navigate('/guide'),
          },
        ]
      : []),
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
    if (isAdmin) return <Tag color="volcano" style={{ margin: 0, fontSize: 11, borderRadius: 999 }}>ADMIN</Tag>;
    if (isGuide) return <Tag color="green" style={{ margin: 0, fontSize: 11, borderRadius: 999 }}>GUIDE</Tag>;
    return (
      <Tag
        style={{
          margin: 0,
          fontSize: 11,
          borderRadius: 999,
          background: '#e6f4f1',
          color: '#0d6e6e',
          borderColor: '#99d5cc',
          fontWeight: 600,
        }}
      >
        KHÁCH HÀNG
      </Tag>
    );
  };

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
      <Space
        size={8}
        style={{
          cursor: 'pointer',
          padding: '4px 12px 4px 6px',
          borderRadius: 999,
          background: isAdminPortal ? '#f8fafc' : '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.2s',
        }}
      >
        <Avatar
          size={30}
          style={{
            backgroundColor: isAdminPortal ? '#dc2626' : '#0d6e6e',
            fontSize: 14,
          }}
          icon={<UserOutlined />}
        />
        <span
          style={{
            fontWeight: 600,
            color: '#0f172a',
            fontSize: 13.5,
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.fullName || user.email}
        </span>
        {getRoleTag()}
        <DownOutlined style={{ fontSize: 10, color: '#64748b' }} />
      </Space>
    </Dropdown>
  );
};

export default UserMenuDropdown;
