import React, { useEffect, useState } from 'react';
import {
  Layout, Input, Button, Dropdown, Space, message, Modal, Form,
  Avatar
} from 'antd';
import {
  CompassOutlined, UserOutlined, DownOutlined, PhoneOutlined,
  MailOutlined, EnvironmentOutlined, GlobalOutlined, AppstoreOutlined,
  LogoutOutlined, ShoppingOutlined, LockOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const ClientLayout = () => {
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // State quản lý Modal Đăng nhập & Đăng ký
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const navigate = useNavigate();

  // 1. Kiểm tra tài khoản đã đăng nhập trong localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('travel_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('travel_user');
      }
    }
  }, []);

  // 2. Tải danh mục tour công khai (Dùng link chuẩn /categories)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
      }
    };
    fetchCategories();
  }, []);

  // 3. XỬ LÝ ĐĂNG NHẬP
  const handleLogin = async (values) => {
    try {
      const res = await axiosClient.post('/auth/login', values);
      const user = res.data;

      // Lưu user và token vào localStorage
      localStorage.setItem('travel_user', JSON.stringify(user));
      localStorage.setItem('token', user.token);
      setCurrentUser(user);
      setIsLoginOpen(false);
      loginForm.resetFields();

      // Phân quyền điều hướng thông minh
      const roles = user.roles || [];
      if (roles.includes('ROLE_ADMIN')) {
        message.success(`Xin chào Quản trị viên ${user.fullName}!`);
        navigate('/admin/dashboard'); // Admin vào Dashboard
      } else {
        message.success(`Chào mừng ${user.fullName} đã quay trở lại!`);
      }
    } catch (err) {
      message.error(err.message || 'Email hoặc mật khẩu không chính xác!');
    }
  };

  // 4. XỬ LÝ ĐĂNG KÝ
  const handleRegister = async (values) => {
    try {
      await axiosClient.post('/auth/register', values);
      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      setIsRegisterOpen(false);
      registerForm.resetFields();

      // Mở ngay form Đăng nhập và điền sẵn email vừa tạo
      loginForm.setFieldsValue({ email: values.email });
      setIsLoginOpen(true);
    } catch (err) {
      message.error(err.message || 'Đăng ký thất bại, email có thể đã tồn tại!');
    }
  };

  // 5. XỬ LÝ ĐĂNG XUẤT
  const handleLogout = () => {
    localStorage.removeItem('travel_user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    message.success('Đã đăng xuất tài khoản!');
    navigate('/');
  };

  // Menu xổ xuống khi bấm vào Avatar
  const userMenuItems = [
    {
      key: 'my-bookings',
      icon: <ShoppingOutlined />,
      label: 'Vé du lịch của tôi',
      onClick: () => navigate('/my-bookings'),
    },
    // CHỈ ADMIN MỚI THẤY DÒNG NÀY
    ...(currentUser?.roles?.includes('ROLE_ADMIN')
      ? [
        {
          key: 'admin',
          icon: <CompassOutlined />,
          label: 'Trang quản trị (Admin)',
          onClick: () => navigate('/admin/dashboard'),
        },
      ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  // Danh sách các mục trong dropdown Danh mục Tour
  const categoryMenuItems = categories.map((cat) => ({
    key: cat.id,
    label: (
      <div style={{ padding: '6px 12px' }} onClick={() => navigate(`/?categoryId=${cat.id}`)}>
        <AppstoreOutlined style={{ marginRight: 8, color: '#1677ff' }} />
        {cat.name}
      </div>
    ),
  }));

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* 1. TOP HEADER */}
      <Header
        style={{
          background: '#fff',
          padding: '0 50px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: 70,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{ fontSize: 22, fontWeight: 'bold', color: '#1677ff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate('/')}
        >
          <CompassOutlined style={{ fontSize: 26, marginRight: 8 }} /> TRAVELHUB
        </div>

        <div style={{ width: '40%' }}>
          <Search
            placeholder="Bạn muốn đi đâu? (Ví dụ: Phú Quốc, Đà Nẵng...)"
            allowClear
            enterButton="Tìm Tour"
            size="large"
            onSearch={(val) => navigate(val.trim() ? `/?keyword=${encodeURIComponent(val.trim())}` : '/')}
          />
        </div>

        {/* NÚT TÀI KHOẢN HOẶC ĐĂNG NHẬP / ĐĂNG KÝ */}
        {currentUser ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', background: '#f0f5ff', padding: '6px 14px', borderRadius: 20 }}>
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
              <span style={{ fontWeight: 'bold', color: '#0958d9' }}>{currentUser.fullName}</span>
              <DownOutlined style={{ fontSize: 10, color: '#0958d9' }} />
            </Space>
          </Dropdown>
        ) : (
          <Space size="middle">
            <Button icon={<UserOutlined />} onClick={() => setIsLoginOpen(true)}>
              Đăng nhập
            </Button>
            <Button type="primary" onClick={() => setIsRegisterOpen(true)}>
              Đăng ký
            </Button>
          </Space>
        )}
      </Header>

      {/* 2. THANH MENU NGANG MÀU XANH */}
      <div style={{ background: '#003a8c', padding: '0 50px', display: 'flex', alignItems: 'center', height: 48 }}>
        <Space size="large">
          <Button type="link" style={{ color: '#fff', fontWeight: 500, padding: 0 }} onClick={() => navigate('/')}>
            Trang chủ
          </Button>

          <Dropdown menu={{ items: categoryMenuItems }} trigger={['click']} placement="bottomLeft">
            <Button type="primary" style={{ background: '#0958d9', borderColor: '#0958d9', fontWeight: 'bold' }}>
              Danh mục Tour <DownOutlined style={{ fontSize: 11, marginLeft: 4 }} />
            </Button>
          </Dropdown>

          <Button type="link" style={{ color: '#fff', padding: 0 }} onClick={() => navigate('/my-bookings')}>
            Vé của tôi
          </Button>
          <Button type="link" style={{ color: '#fff', padding: 0 }} onClick={() => navigate('/custom-tour')}>
            Tour Khách Đoàn (B2B)
          </Button>
        </Space>
      </div>

      {/* 3. NỘI DUNG CHÍNH */}
      <Content style={{ padding: '30px 50px' }}>
        <Outlet />
      </Content>

      {/* 4. FOOTER */}
      <Footer style={{ background: '#001529', color: 'rgba(255, 255, 255, 0.65)', padding: '40px 50px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40, color: '#fff', marginBottom: 30 }}>
          <div>
            <h3 style={{ color: '#fff', marginBottom: 15 }}><CompassOutlined /> TRAVELHUB TOUR SYSTEM</h3>
            <p style={{ color: '#aaa' }}>Hệ thống đặt tour du lịch trực tuyến hàng đầu, mang đến những hành trình khám phá kỳ thú khắp Việt Nam và thế giới.</p>
            <p style={{ color: '#aaa' }}><EnvironmentOutlined /> Địa chỉ: 123 Đường Du Lịch, Quận 1, TP. Hồ Chí Minh</p>
            <p style={{ color: '#aaa' }}><PhoneOutlined /> Hotline: 1900 8888 (24/7)</p>
            <p style={{ color: '#aaa' }}><MailOutlined /> Email: contact@travelhub.vn</p>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: 15 }}>DỊCH VỤ KHÁCH HÀNG</h4>
            <p style={{ color: '#aaa' }}>Chính sách bảo mật</p>
            <p style={{ color: '#aaa' }}>Điều khoản sử dụng</p>
            <p style={{ color: '#aaa' }}>Chính sách hoàn hủy tour</p>
            <p style={{ color: '#aaa' }}>Hướng dẫn đặt vé</p>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: 15 }}>KẾT NỐI VỚI CHÚNG TÔI</h4>
            <p style={{ color: '#aaa' }}><GlobalOutlined /> Website: www.travelhub.vn</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, color: '#777', fontSize: 13 }}>
          © 2026 TravelHub System. Báo cáo Chuyên đề J2EE - Spring Boot & React.
        </div>
      </Footer>

      {/* MODAL ĐĂNG NHẬP (ĐÃ DÙNG destroyOnHidden) */}
      <Modal
        title="Đăng Nhập Tài Khoản"
        open={isLoginOpen}
        onCancel={() => setIsLoginOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}>
            <Input prefix={<MailOutlined />} placeholder="khachhang.le@gmail.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Nhập mật khẩu!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>
            Đăng Nhập
          </Button>
          <div style={{ textAlign: 'center', marginTop: 15, fontSize: 13 }}>
            Chưa có tài khoản?{' '}
            <a onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}>Đăng ký ngay</a>
          </div>
        </Form>
      </Modal>

      {/* MODAL ĐĂNG KÝ (ĐÃ DÙNG destroyOnHidden) */}
      <Modal
        title="Đăng Ký Tài Khoản Khách Hàng"
        open={isRegisterOpen}
        onCancel={() => setIsRegisterOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}>
            <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
            <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10 }}>
            Tạo Tài Khoản
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ClientLayout;