import React, { useState } from 'react';
import { Layout, Menu, theme, Space, Typography } from 'antd';
import {
  DashboardOutlined, CompassOutlined, AppstoreOutlined,
  CalendarOutlined, ScheduleOutlined, GiftOutlined,
  ShoppingOutlined, RollbackOutlined, CreditCardOutlined,
  UserOutlined, StarOutlined, TeamOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      {/* THANH SIDEBAR QUẢN TRỊ */}
      <Sider breakpoint="lg" collapsedWidth="0" width={240} style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.15)' }}>
        <div
          style={{
            height: 52,
            margin: '14px 16px',
            color: '#fff',
            fontWeight: 800,
            fontSize: 17,
            textAlign: 'center',
            lineHeight: '52px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            letterSpacing: '1px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/admin/dashboard')}
        >
          TRAVEL ADMIN
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      {/* KHUNG NỘI DUNG CHÍNH */}
      <Layout>
        {/* HEADER CỐ ĐỊNH CỦA ADMIN */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <div style={{ fontSize: 15, color: '#595959' }}>
            Xin chào, <Text strong style={{ color: '#1677ff' }}>{user?.fullName || 'Quản trị viên'}</Text>! 👋
          </div>

          <Space size="large" align="center">
            {/* CHUÔNG THÔNG BÁO CHO QUẢN TRỊ VIÊN */}
            <NotificationDropdown isAdmin={true} />

            {/* AVATAR & DROPDOWN MENU TÀI KHOẢN */}
            <UserMenuDropdown onOpenProfile={() => setIsProfileModalOpen(true)} />
          </Space>
        </Header>

        {/* NỘI DUNG TRANG CON */}
        <Content style={{ margin: '20px 20px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 64px - 60px)',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 13, padding: '16px 0' }}>
          © 2026 TravelHub System — Cổng Quản Trị Doanh Nghiệp Du Lịch (Admin Portal)
        </Footer>
      </Layout>

      {/* MODAL THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU */}
      <ProfileModal open={isProfileModalOpen} onCancel={() => setIsProfileModalOpen(false)} />
    </Layout>
  );
};

export default AdminLayout;
