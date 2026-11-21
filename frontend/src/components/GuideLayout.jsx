import React, { useState } from 'react';
import { Layout, Space, Button, Tag } from 'antd';
import { CompassOutlined, GlobalOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';

const { Header, Content, Footer } = Layout;

const GuideLayout = () => {
  const navigate = useNavigate();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--th-bg)' }}>
      {/* HEADER ĐỒNG BỘ THƯƠNG HIỆU & CĂN LƯỚI 1240PX */}
      <Header
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--th-border)',
          padding: 0,
          height: 72,
          lineHeight: 'normal',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="th-container"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* LOGO + NHÃN GUIDE PORTAL */}
          <div
            onClick={() => navigate('/guide')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0d6e6e 0%, #0b2545 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(13, 110, 110, 0.25)',
              }}
            >
              <CompassOutlined style={{ fontSize: 20 }} />
            </div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0b2545' }}>
                  Travel<span style={{ color: '#0d6e6e' }}>Hub</span>
                </span>
                <Tag
                  style={{
                    margin: 0,
                    background: '#e6f4f1',
                    color: '#0d6e6e',
                    borderColor: '#99d5cc',
                    fontWeight: 700,
                    fontSize: 11,
                    borderRadius: 999,
                  }}
                >
                  GUIDE PORTAL
                </Tag>
              </div>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 500 }}>
                Cổng tác nghiệp hướng dẫn viên
              </div>
            </div>
          </div>

          {/* TIỆN ÍCH PHẢI */}
          <Space size={12} align="center">
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={() => navigate('/')}
              style={{ color: '#475569', fontWeight: 600 }}
            >
              Trang khách hàng
            </Button>

            <NotificationDropdown isAdmin={false} />

            <UserMenuDropdown onOpenProfile={() => setIsProfileModalOpen(true)} />
          </Space>
        </div>
      </Header>

      {/* NỘI DUNG CHÍNH */}
      <Content className="th-portal-content" style={{ padding: '28px 0 48px', flex: 1 }}>
        <div className="th-container">
          <Outlet />
        </div>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          color: '#64748b',
          fontSize: 13,
          background: '#ffffff',
          borderTop: '1px solid var(--th-border)',
          padding: '16px 0',
        }}
      >
        © 2026 TravelHub Guide Portal — Hệ thống điều hành & điểm danh đoàn du lịch
      </Footer>

      <ProfileModal open={isProfileModalOpen} onCancel={() => setIsProfileModalOpen(false)} />
    </Layout>
  );
};

export default GuideLayout;
