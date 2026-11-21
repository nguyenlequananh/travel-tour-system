import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Divider, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  PhoneOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ open, initialMode = 'login', onClose }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMode(initialMode);
    if (!open) {
      try { loginForm.resetFields(); } catch {}
      try { registerForm.resetFields(); } catch {}
    }
  }, [open, initialMode]);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await authService.login(values);
      const userData = res.data;
      login(userData, userData.token);
      message.success(`Chào mừng ${userData.fullName || 'bạn'} đã quay trở lại!`);
      onClose();

      const roles = userData.roles || [];
      if (roles.includes('ROLE_ADMIN') || roles.includes('ADMIN')) {
        navigate('/admin/dashboard');
      } else if (roles.includes('ROLE_GUIDE') || roles.includes('GUIDE')) {
        navigate('/guide');
      }
    } catch (err) {
      message.error(err.message || 'Email hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await authService.register(values);
      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      registerForm.resetFields();
      loginForm.setFieldsValue({ email: values.email });
      setMode('login');
    } catch (err) {
      message.error(err.message || 'Đăng ký thất bại, email có thể đã được sử dụng!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendBaseUrl =
      import.meta.env.VITE_BACKEND_URL ||
      (window.location.hostname === 'localhost' ? 'http://localhost:8081' : '');
    window.location.href = `${backendBaseUrl}/oauth2/authorization/google`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width={440}
      styles={{ body: { padding: '8px 8px 4px' } }}
    >
      {/* HEADER ĐỒNG NHẤT THƯƠNG HIỆU */}
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0d6e6e 0%, #0b2545 100%)',
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          <CompassOutlined style={{ fontSize: 22 }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
          {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản TravelHub'}
        </h2>
        <p style={{ color: '#64748b', fontSize: 13.5, margin: 0 }}>
          {mode === 'login'
            ? 'Đăng nhập để đặt tour nhanh và quản lý lịch sử chuyến đi'
            : 'Đăng ký miễn phí chỉ trong 30 giây để nhận ưu đãi thành viên'}
        </p>
      </div>

      {/* FORM ĐĂNG NHẬP */}
      <div style={{ display: mode === 'login' ? 'block' : 'none' }}>
        <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600 }}>Email</span>}
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="tenban@email.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{ marginTop: 6, height: 44, fontWeight: 700 }}
          >
            Đăng Nhập
          </Button>

          <Divider style={{ margin: '18px 0', fontSize: 12.5, color: '#94a3b8' }}>Hoặc tiếp tục với</Divider>

          <Button
            block
            size="large"
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: '#cbd5e1',
              color: '#0f172a',
              fontWeight: 600,
              height: 44,
              background: '#ffffff',
            }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              style={{ width: 18, height: 18, marginRight: 10 }}
            />
            Đăng nhập bằng Google
          </Button>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: '#475569' }}>
            Chưa có tài khoản?{' '}
            <a style={{ fontWeight: 700, color: '#0d6e6e' }} onClick={() => setMode('register')}>
              Đăng ký ngay
            </a>
          </div>
        </Form>
      </div>

      {/* FORM ĐĂNG KÝ */}
      <div style={{ display: mode === 'register' ? 'block' : 'none' }}>
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            name="fullName"
            label={<span style={{ fontWeight: 600 }}>Họ và tên</span>}
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600 }}>Email</span>}
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="tenban@email.com" size="large" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại liên hệ!' }]}
          >
            <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0912345678" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
            rules={[{ required: true, min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Tối thiểu 6 ký tự" size="large" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
            style={{ marginTop: 6, height: 44, fontWeight: 700 }}
          >
            Tạo Tài Khoản
          </Button>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13.5, color: '#475569' }}>
            Đã có tài khoản?{' '}
            <a style={{ fontWeight: 700, color: '#0d6e6e' }} onClick={() => setMode('login')}>
              Đăng nhập tại đây
            </a>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AuthModal;
