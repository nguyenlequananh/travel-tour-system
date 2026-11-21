import React, { useEffect, useState } from 'react';
import { Layout, Button, Dropdown, Space } from 'antd';
import {
  CompassOutlined,
  UserOutlined,
  DownOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import categoryService from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import AiChatWidget from './AiChatWidget';
import NotificationDropdown from './NotificationDropdown';
import UserMenuDropdown from './UserMenuDropdown';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';

const { Header, Content, Footer } = Layout;

const ClientLayout = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  const categoryMenuItems = [
    {
      key: 'all',
      label: (
        <div
          style={{ padding: '4px 6px', fontWeight: 600, color: '#0d6e6e' }}
          onClick={() => navigate('/')}
        >
          <AppstoreOutlined style={{ marginRight: 8 }} />
          Tất cả tour du lịch
        </div>
      ),
    },
    { type: 'divider' },
    ...categories.map((cat) => ({
      key: cat.id,
      label: (
        <div
          style={{ padding: '4px 6px', fontWeight: 500, color: '#0f172a' }}
          onClick={() => navigate(`/?categoryId=${cat.id}`)}
        >
          <EnvironmentOutlined style={{ marginRight: 8, color: '#0d6e6e' }} />
          {cat.name}
        </div>
      ),
    })),
  ];

  const isHome = location.pathname === '/' || location.pathname.startsWith('/tours');
  const isMyBookings = location.pathname === '/my-bookings';
  const isCustomTour = location.pathname === '/custom-tour';

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--th-bg)' }}>
      {/* 1. HEADER ĐƠN GỌN, THẲNG HÀNG (ALIGNMENT + PROXIMITY) */}
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
            gap: 20,
          }}
        >
          {/* NHÓM TRÁI: LOGO + ĐIỀU HƯỚNG CHÍNH */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, minWidth: 0 }}>
            <div
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                flexShrink: 0,
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
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0b2545', letterSpacing: '-0.02em' }}>
                  Travel<span style={{ color: '#0d6e6e' }}>Hub</span>
                </div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                  Khám phá Việt Nam & Thế giới
                </div>
              </div>
            </div>

            {/* THANH MENU ĐIỀU HƯỚNG */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`th-nav-link ${isHome ? 'active' : ''}`}
                onClick={() => navigate('/')}
              >
                Khám phá tour
              </button>

              <Dropdown menu={{ items: categoryMenuItems }} trigger={['click']} placement="bottomLeft">
                <button type="button" className="th-nav-link">
                  Danh mục <DownOutlined style={{ fontSize: 10 }} />
                </button>
              </Dropdown>

              <button
                type="button"
                className={`th-nav-link ${isMyBookings ? 'active' : ''}`}
                onClick={() => navigate('/my-bookings')}
              >
                <ShoppingOutlined /> Vé của tôi
              </button>

              <button
                type="button"
                className={`th-nav-link ${isCustomTour ? 'active' : ''}`}
                onClick={() => navigate('/custom-tour')}
              >
                <TeamOutlined /> Tour khách đoàn
              </button>
            </nav>
          </div>

          {/* NHÓM PHẢI: THÔNG BÁO & TÀI KHOẢN */}
          <Space size={12} align="center" style={{ flexShrink: 0 }}>
            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated ? (
              <UserMenuDropdown onOpenProfile={() => setProfileModalOpen(true)} />
            ) : (
              <Space size={8}>
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  onClick={openLogin}
                  style={{ color: '#0f172a', fontWeight: 600 }}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  onClick={openRegister}
                  style={{ borderRadius: 999, padding: '0 20px' }}
                >
                  Đăng ký
                </Button>
              </Space>
            )}
          </Space>
        </div>
      </Header>

      {/* 2. NỘI DUNG CHÍNH — CĂN THẲNG TRÊN CÙNG LƯỚI 1240PX */}
      <Content style={{ padding: '28px 0 56px', flex: 1 }}>
        <div className="th-container">
          <Outlet />
        </div>
      </Content>

      {/* 3. FOOTER CĂN LƯỚI ĐỒNG NHẤT */}
      <Footer style={{ background: '#0b2545', color: '#cbd5e1', padding: '48px 0 24px' }}>
        <div className="th-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 36,
              marginBottom: 36,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: '#0d6e6e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <CompassOutlined style={{ fontSize: 18 }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#ffffff' }}>TravelHub</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, marginBottom: 14 }}>
                Nền tảng đặt tour du lịch trọn gói minh bạch giá, xác nhận nhanh chóng và hỗ trợ đồng hành 24/7.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#5eead4', fontSize: 13, fontWeight: 600 }}>
                <SafetyCertificateOutlined /> Thanh toán an toàn qua VNPay
              </div>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                Khám phá
              </h4>
              <span className="th-footer-link" onClick={() => navigate('/')}>Tất cả tour du lịch</span>
              <span className="th-footer-link" onClick={() => navigate('/?tourType=DOMESTIC')}>Tour trong nước</span>
              <span className="th-footer-link" onClick={() => navigate('/?tourType=INTERNATIONAL')}>Tour quốc tế</span>
              <span className="th-footer-link" onClick={() => navigate('/custom-tour')}>Thiết kế tour khách đoàn</span>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                Hỗ trợ khách hàng
              </h4>
              <span className="th-footer-link" onClick={() => navigate('/my-bookings')}>Tra cứu & quản lý vé</span>
              <span className="th-footer-link">Chính sách hoàn hủy linh hoạt</span>
              <span className="th-footer-link">Điều khoản sử dụng</span>
              <span className="th-footer-link">Chính sách bảo mật</span>
            </div>

            <div>
              <h4 style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                Liên hệ 24/7
              </h4>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 10 }}>
                <EnvironmentOutlined style={{ marginRight: 8, color: '#5eead4' }} />
                123 Đường Du Lịch, Quận 1, TP. HCM
              </p>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 10 }}>
                <PhoneOutlined style={{ marginRight: 8, color: '#5eead4' }} />
                Hotline: <strong style={{ color: '#fff' }}>1900 8888</strong>
              </p>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 10 }}>
                <MailOutlined style={{ marginRight: 8, color: '#5eead4' }} />
                contact@travelhub.vn
              </p>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 0 }}>
                <GlobalOutlined style={{ marginRight: 8, color: '#5eead4' }} />
                www.travelhub.vn
              </p>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 13,
              color: '#64748b',
            }}
          >
            <span>© 2026 TravelHub Tour System. All rights reserved.</span>
            <span>Đồ Án Chuyên Đề J2EE — Spring Boot & React</span>
          </div>
        </div>
      </Footer>

      {/* MODAL ĐĂNG NHẬP / ĐĂNG KÝ */}
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

      {/* TRỢ LÝ ẢO AI */}
      <AiChatWidget />
    </Layout>
  );
};

export default ClientLayout;
