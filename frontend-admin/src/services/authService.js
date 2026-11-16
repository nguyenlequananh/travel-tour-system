import axiosClient from '../api/axiosClient';

const authService = {
  // 1. Đăng nhập bằng Email & Mật khẩu
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },

  // 2. Đăng ký tài khoản mới
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },
};

export default authService;
