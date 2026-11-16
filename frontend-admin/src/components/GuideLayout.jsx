import React, { useState } from 'react';
import { Layout, Space } from 'antd';
import { CompassOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';

const { Header, Content, Footer } = Layout;

const GuideLayout = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* HEADER CỔNG HƯỚNG DẪN VIÊN */}
      <Header
        style={{
          background: '#ffffff',
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: 68,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#52c41a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '0.5px',
          }}
          onClick={() => navigate('/guide')}
        >
          <CompassOutlined style={{ fontSize: 26, marginRight: 8, color: '#52c41a' }} />
          TRAVELHUB GUIDE PORTAL
        </div>

        <Space size="large" align="center">
          {/* THÔNG BÁO CHO HƯỚNG DẪN VIÊN */}
          <NotificationDropdown isAdmin={false} />

          {/* DROPDOWN USER */}
          <UserMenuDropdown onOpenProfile={() => setIsProfileModalOpen(false)} />
        </Space>
      </Header>

      {/* NỘI DUNG CHÍNH */}
      <Content style={{ padding: '24px 32px', minHeight: 'calc(100vh - 68px - 60px)' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 13, background: '#fff', borderTop: '1px solid #f0f0f0', padding: '16px 0' }}>
        © 2026 TravelHub Guide Portal — Cổng Tác Nghiệp Hiện Trường Hướng Dẫn Viên
      </Footer>

      <ProfileModal open={isProfileModalOpen} onCancel={() => setIsProfileModalOpen(false)} />
    </Layout>
  );
};

export default GuideLayout;
