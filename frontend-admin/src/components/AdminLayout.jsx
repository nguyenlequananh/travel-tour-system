import React from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined,
  CompassOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  GiftOutlined,
  ShoppingOutlined,
  RollbackOutlined,
  CreditCardOutlined,
  UserOutlined,
  LogoutOutlined,
  StarOutlined, // <-- Đã thêm
  TeamOutlined, // <-- Đã thêm
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan (Dashboard)' },
    { key: '/admin/tours', icon: <CompassOutlined />, label: 'Quản lý Tour' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục Tour' },
    { key: '/admin/departures', icon: <CalendarOutlined />, label: 'Lịch Khởi Hành' },
    { key: '/admin/itineraries', icon: <ScheduleOutlined />, label: 'Lịch Trình Chi Tiết' },
    { key: '/admin/promotions', icon: <GiftOutlined />, label: 'Khuyến Mãi' },
    { key: '/admin/bookings', icon: <ShoppingOutlined />, label: 'Đơn Đặt Tour' },
    { key: '/admin/cancellations', icon: <RollbackOutlined />, label: 'Xử lý Hủy Tour' },
    { key: '/admin/payments', icon: <CreditCardOutlined />, label: 'Quản lý Thanh Toán' },
    { key: '/admin/users', icon: <UserOutlined />, label: 'Người Dùng' },
    { key: '/admin/reviews', icon: <StarOutlined />, label: 'Quản lý Đánh Giá' },
    { key: '/admin/custom-tours', icon: <TeamOutlined />, label: 'Yêu Cầu Tour Đoàn' }, 
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0" width={230}>
        <div style={{ height: 48, margin: 16, color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center', lineHeight: '48px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }}>
          TRAVEL ADMIN
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button type="text" icon={<LogoutOutlined />} danger onClick={() => alert('Đăng xuất')}>
            Đăng xuất
          </Button>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: '85vh', background: colorBgContainer, borderRadius: borderRadiusLG }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;