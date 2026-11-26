import React, { useState } from 'react';
import { Layout, Menu, Space, Button, Tag } from 'antd';
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
  StarOutlined,
  TeamOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';

const { Header, Sider, Content, Footer } = Layout;

const ROUTE_TITLES = {
  '/admin/dashboard': { group: 'Tổng quan', title: 'Báo cáo & Thống kê doanh thu' },
  '/admin/tours': { group: 'Sản phẩm & Lịch trình', title: 'Quản lý Tour du lịch' },
  '/admin/categories': { group: 'Sản phẩm & Lịch trình', title: 'Danh mục Tour' },
  '/admin/departures': { group: 'Sản phẩm & Lịch trình', title: 'Lịch khởi hành & Điểm đón' },
  '/admin/itineraries': { group: 'Sản phẩm & Lịch trình', title: 'Lịch trình chi tiết' },
  '/admin/promotions': { group: 'Sản phẩm & Lịch trình', title: 'Khuyến mãi & Voucher' },
  '/admin/bookings': { group: 'Đơn hàng & Tài chính', title: 'Đơn đặt tour' },
  '/admin/cancellations': { group: 'Đơn hàng & Tài chính', title: 'Xử lý hủy & hoàn tiền' },
  '/admin/payments': { group: 'Đơn hàng & Tài chính', title: 'Giao dịch thanh toán' },
  '/admin/custom-tours': { group: 'Đơn hàng & Tài chính', title: 'Yêu cầu tour đoàn (B2B)' },
  '/admin/users': { group: 'Người dùng & Phản hồi', title: 'Người dùng & Phân quyền' },
  '/admin/reviews': { group: 'Người dùng & Phản hồi', title: 'Đánh giá từ khách hàng' },
  '/admin/email-logs': { group: 'Người dùng & Phản hồi', title: 'Nhật ký gửi Email (Notification Service)' },
};

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // PROXIMITY: Nhóm 12 mục menu thành 4 khu vực nghiệp vụ rõ ràng, dễ quét mắt
  const menuItems = [
    {
      type: 'group',
      label: collapsed ? '' : 'Tổng quan',
      children: [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Bảng điều khiển' },
      ],
    },
    {
      type: 'group',
      label: collapsed ? '' : 'Sản phẩm & Lịch trình',
      children: [
        { key: '/admin/tours', icon: <CompassOutlined />, label: 'Quản lý Tour' },
        { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục Tour' },
        { key: '/admin/departures', icon: <CalendarOutlined />, label: 'Lịch Khởi Hành' },
        { key: '/admin/itineraries', icon: <ScheduleOutlined />, label: 'Lịch Trình Chi Tiết' },
        { key: '/admin/promotions', icon: <GiftOutlined />, label: 'Khuyến Mãi' },
      ],
    },
    {
      type: 'group',
      label: collapsed ? '' : 'Đơn hàng & Tài chính',
      children: [
        { key: '/admin/bookings', icon: <ShoppingOutlined />, label: 'Đơn Đặt Tour' },
        { key: '/admin/cancellations', icon: <RollbackOutlined />, label: 'Xử lý Hủy Tour' },
        { key: '/admin/payments', icon: <CreditCardOutlined />, label: 'Thanh Toán' },
        { key: '/admin/custom-tours', icon: <TeamOutlined />, label: 'Yêu Cầu Tour Đoàn' },
      ],
    },
    {
      type: 'group',
      label: collapsed ? '' : 'Người dùng & Phản hồi',
      children: [
        { key: '/admin/users', icon: <UserOutlined />, label: 'Người Dùng' },
        { key: '/admin/reviews', icon: <StarOutlined />, label: 'Đánh Giá Tour' },
        { key: '/admin/email-logs', icon: <MailOutlined />, label: 'Nhật Ký Email' },
      ],
    },
  ];

  const currentRouteMeta = ROUTE_TITLES[location.pathname] || {
    group: 'Quản trị',
    title: 'TravelHub Admin',
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--th-bg)' }}>
      {/* SIDEBAR XANH BIỂN SÂU ĐỒNG BỘ THƯƠNG HIỆU */}
      <Sider
        className="th-admin-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint="lg"
        width={256}
        collapsedWidth={76}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          boxShadow: '2px 0 14px rgba(11, 37, 69, 0.14)',
        }}
      >
        {/* LOGO BRAND */}
        <div
          onClick={() => navigate('/admin/dashboard')}
          style={{
            height: 72,
            padding: collapsed ? '0 16px' : '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 12,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0d6e6e 0%, #14b8a6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(13, 110, 110, 0.35)',
            }}
          >
            <CompassOutlined style={{ fontSize: 20 }} />
          </div>
          {!collapsed && (
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Travel<span style={{ color: '#5eead4' }}>Hub</span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                ADMIN WORKSPACE
              </div>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingBottom: 24 }}
        />
      </Sider>

      {/* KHUNG LÀM VIỆC CHÍNH */}
      <Layout style={{ background: 'var(--th-bg)', minWidth: 0 }}>
        {/* HEADER CỐ ĐỊNH RÕ ĐỊNH HƯỚNG */}
        <Header
          style={{
            padding: '0 24px',
            height: 72,
            lineHeight: 'normal',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--th-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, color: '#475569', width: 38, height: 38 }}
            />
            <div style={{ lineHeight: 1.25, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {currentRouteMeta.group}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentRouteMeta.title}
              </div>
            </div>
          </div>

          <Space size={12} align="center" style={{ flexShrink: 0 }}>
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={() => window.open('/', '_blank')}
              style={{ color: '#0d6e6e', fontWeight: 600 }}
            >
              Xem trang khách
            </Button>

            <NotificationDropdown isAdmin={true} />

            <UserMenuDropdown onOpenProfile={() => setIsProfileModalOpen(true)} />
          </Space>
        </Header>

        {/* NỘI DUNG TRANG CON — ĐẶT TRỰC TIẾP TRÊN NỀN ALABASTER THOÁNG ĐÃNG */}
        <Content
          className="th-portal-content"
          style={{
            padding: '24px 28px 32px',
            minHeight: 'calc(100vh - 72px - 56px)',
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </Content>

        <Footer
          style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: 13,
            background: 'transparent',
            padding: '14px 24px 20px',
          }}
        >
          © 2026 TravelHub Admin Portal — Quản trị hệ thống đặt tour du lịch ({user?.fullName || 'Administrator'})
        </Footer>
      </Layout>

      <ProfileModal open={isProfileModalOpen} onCancel={() => setIsProfileModalOpen(false)} />
    </Layout>
  );
};

export default AdminLayout;
