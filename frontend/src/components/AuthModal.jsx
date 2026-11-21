import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
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

  // Xử lý đăng nhập
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

  // Xử lý đăng ký
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
    const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || (
      window.location.hostname === 'localhost' ? 'http://localhost:8081' : ''
    );
    window.location.href = `${backendBaseUrl}/oauth2/authorization/google`;
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#1677ff', padding: '6px 0' }}>
          {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width={420}
    >
      <div style={{ display: mode === 'login' ? 'block' : 'none' }}>
        <Form form={loginForm} layout="vertical" onFinish={handleLogin}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined style={{ color: '#8c8c8c' }} />} placeholder="tenban@email.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#8c8c8c' }} />} placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginTop: 8, height: 42, fontWeight: 600 }}>
            Đăng Nhập
          </Button>

          <Divider style={{ margin: '18px 0', fontSize: 13, color: '#8c8c8c' }}>Hoặc</Divider>

          <Button
            block
            size="large"
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: '#4285F4',
              color: '#4285F4',
              fontWeight: 600,
              height: 42,
            }}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              style={{ width: 18, height: 18, marginRight: 10 }}
            />
            Đăng nhập với Google
          </Button>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#595959' }}>
            Chưa có tài khoản?{' '}
            <a style={{ fontWeight: 600, color: '#1677ff' }} onClick={() => setMode('register')}>
              Đăng ký ngay
            </a>
          </div>
        </Form>
      </div>

      <div style={{ display: mode === 'register' ? 'block' : 'none' }}>
        <Form form={registerForm} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#8c8c8c' }} />} placeholder="Nguyễn Văn A" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
          >
            <Input prefix={<MailOutlined style={{ color: '#8c8c8c' }} />} placeholder="tenban@email.com" size="large" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại liên hệ!' }]}
          >
            <Input prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />} placeholder="0912345678" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#8c8c8c' }} />} placeholder="Tối thiểu 6 ký tự" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginTop: 8, height: 42, fontWeight: 600 }}>
            Tạo Tài Khoản
          </Button>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#595959' }}>
            Đã có tài khoản?{' '}
            <a style={{ fontWeight: 600, color: '#1677ff' }} onClick={() => setMode('login')}>
              Đăng nhập tại đây
            </a>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AuthModal;
