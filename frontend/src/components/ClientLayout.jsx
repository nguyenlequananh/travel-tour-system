import React, { useEffect, useState } from 'react';
import { Layout, Input, Button, Dropdown, Space } from 'antd';
import {
  CompassOutlined, UserOutlined, DownOutlined, PhoneOutlined,
  MailOutlined, EnvironmentOutlined, GlobalOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import AiChatWidget from './AiChatWidget';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const ClientLayout = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navigate = useNavigate();

  // Tải danh mục tour công khai
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getPublicCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  const openLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const categoryMenuItems = categories.map((cat) => ({
    key: cat.id,
    label: (
      <div style={{ padding: '6px 14px' }} onClick={() => navigate(`/?categoryId=${cat.id}`)}>
        <AppstoreOutlined style={{ marginRight: 8, color: '#1677ff' }} />
        {cat.name}
      </div>
    ),
  }));

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* 1. THANH HEADER CHÍNH */}
      <Header
        style={{
          background: '#ffffff',
          padding: '0 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          height: 72,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* LOGO THƯƠNG HIỆU */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#1677ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            letterSpacing: '0.5px',
          }}
          onClick={() => navigate('/')}
        >
          <CompassOutlined style={{ fontSize: 28, marginRight: 10, color: '#1677ff' }} />
          TRAVELHUB
        </div>

        {/* THANH TÌM KIẾM TOUR TOÀN CỤC */}
        <div style={{ width: '38%', maxWidth: 520 }}>
          <Search
            placeholder="Tìm điểm đến mơ ước (Phú Quốc, Đà Lạt, Sa Pa...)"
            allowClear
            enterButton="Tìm Kiếm"
            size="large"
            style={{ borderRadius: 8 }}
            onSearch={(val) => navigate(val.trim() ? `/?keyword=${encodeURIComponent(val.trim())}` : '/')}
          />
        </div>

        {/* KHU VỰC ĐIỀU HƯỚNG TÀI KHOẢN & THÔNG BÁO */}
        <Space size="middle" align="center">
          {isAuthenticated && <NotificationDropdown />}

          {isAuthenticated ? (
            <UserMenuDropdown onOpenProfile={() => setProfileModalOpen(true)} />
          ) : (
            <Space size="small">
              <Button icon={<UserOutlined />} size="middle" onClick={openLogin}>
                Đăng nhập
              </Button>
              <Button type="primary" size="middle" onClick={openRegister}>
                Đăng ký
              </Button>
            </Space>
          )}
        </Space>
      </Header>

      {/* 2. THANH ĐIỀU HƯỚNG DANH MỤC & DỊCH VỤ NHANH */}
      <div
        style={{
          background: '#003a8c',
          padding: '0 40px',
          display: 'flex',
          alignItems: 'center',
          height: 46,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Space size="large">
          <Button
            type="link"
            style={{ color: '#ffffff', fontWeight: 600, padding: 0 }}
            onClick={() => navigate('/')}
          >
            Trang chủ
          </Button>

          <Dropdown menu={{ items: categoryMenuItems }} trigger={['click']} placement="bottomLeft">
            <Button
              type="primary"
              style={{
                background: '#0958d9',
                borderColor: '#0958d9',
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 4,
              }}
            >
              Danh Mục Tour <DownOutlined style={{ fontSize: 10, marginLeft: 6 }} />
            </Button>
          </Dropdown>

          <Button
            type="link"
            style={{ color: 'rgba(255,255,255,0.9)', padding: 0, fontWeight: 500 }}
            onClick={() => navigate('/my-bookings')}
          >
            Vé của tôi
          </Button>

          <Button
            type="link"
            style={{ color: 'rgba(255,255,255,0.9)', padding: 0, fontWeight: 500 }}
            onClick={() => navigate('/custom-tour')}
          >
            Tour Khách Đoàn (B2B)
          </Button>
        </Space>
      </div>

      {/* 3. NỘI DUNG CHÍNH CỦA TRANG */}
      <Content style={{ padding: '24px 40px', minHeight: 'calc(100vh - 72px - 46px - 260px)' }}>
        <Outlet />
      </Content>

      {/* 4. FOOTER HIỆN ĐẠI */}
      <Footer style={{ background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '40px 40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, color: '#fff', marginBottom: 24 }}>
          <div>
            <h3 style={{ color: '#fff', marginBottom: 14, fontSize: 18, fontWeight: 700 }}>
              <CompassOutlined /> TRAVELHUB TOUR SYSTEM
            </h3>
            <p style={{ color: '#aaa', margin: '4px 0' }}>Hệ thống quản lý và đặt tour du lịch trực tuyến hiện đại hàng đầu.</p>
            <p style={{ color: '#aaa', margin: '4px 0' }}><EnvironmentOutlined /> Địa chỉ: 123 Đường Du Lịch, Quận 1, TP. Hồ Chí Minh</p>
            <p style={{ color: '#aaa', margin: '4px 0' }}><PhoneOutlined /> Hotline: 1900 8888 (Hỗ trợ 24/7)</p>
            <p style={{ color: '#aaa', margin: '4px 0' }}><MailOutlined /> Email: contact@travelhub.vn</p>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: 14, fontSize: 15 }}>DỊCH VỤ & CHÍNH SÁCH</h4>
            <p style={{ color: '#aaa', margin: '6px 0', cursor: 'pointer' }}>Chính sách bảo mật</p>
            <p style={{ color: '#aaa', margin: '6px 0', cursor: 'pointer' }}>Điều khoản sử dụng</p>
            <p style={{ color: '#aaa', margin: '6px 0', cursor: 'pointer' }}>Chính sách hoàn hủy tour</p>
            <p style={{ color: '#aaa', margin: '6px 0', cursor: 'pointer' }}>Bảo hiểm du lịch</p>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: 14, fontSize: 15 }}>KẾT NỐI VỚI CHÚNG TÔI</h4>
            <p style={{ color: '#aaa', margin: '6px 0' }}><GlobalOutlined /> Website: www.travelhub.vn</p>
            <p style={{ color: '#aaa', margin: '6px 0' }}>Facebook: TravelHub Official</p>
            <p style={{ color: '#aaa', margin: '6px 0' }}>Zalo OA: TravelHub Du Lịch</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 18, color: '#777', fontSize: 13 }}>
          © 2026 TravelHub System — Đồ Án Chuyên Đề J2EE (Spring Boot & React).
        </div>
      </Footer>

      {/* MODAL ĐĂNG NHẬP / ĐĂNG KÝ (ĐÃ ĐƯỢC TÁCH COMPONENT RIÊNG GỌN GÀNG) */}
      <AuthModal
        open={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* MODAL THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU */}
      <ProfileModal
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
      />

      {/* AI ASSISTANT WIDGET */}
      <AiChatWidget />
    </Layout>
  );
};

export default ClientLayout;
