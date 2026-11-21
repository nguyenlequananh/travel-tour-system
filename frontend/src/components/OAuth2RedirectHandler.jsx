import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { message, Spin } from 'antd';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));

        const user = {
          id: decodedPayload.userId,
          email: decodedPayload.sub,
          fullName: decodedPayload.fullName,
          roles: decodedPayload.roles || ['ROLE_CUSTOMER'],
          token: token,
        };

        login(user, token);
        message.success(`Đăng nhập Google thành công! Chào mừng ${user.fullName}`);

        if (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ADMIN')) {
          navigate('/admin/dashboard');
        } else if (user.roles.includes('ROLE_GUIDE') || user.roles.includes('GUIDE')) {
          navigate('/guide');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Lỗi giải mã token OAuth2:', err);
        message.error('Lỗi khi xử lý token đăng nhập!');
        navigate('/');
      }
    } else {
      message.error('Đăng nhập Google thất bại!');
      navigate('/');
    }
  }, [location, navigate, login]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Spin size="large" />
      <div style={{ marginTop: 16, fontSize: 16, color: '#1677ff', fontWeight: 600 }}>
        Đang xác thực thông tin đăng nhập từ Google...
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
