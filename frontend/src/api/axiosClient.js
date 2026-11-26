import axios from 'axios';

// Tự động nhận diện: Khi chạy dev cục bộ thì gọi qua API Gateway (port 8088), khi deploy Production qua Nginx thì gọi relative path /api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' ? 'http://localhost:8088/api/v1' : '/api/v1'
);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gán Token vào request nếu đã đăng nhập
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý dữ liệu trả về từ ApiResponse của Spring Boot
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data; // Bóc tách dữ liệu ra luôn
    }
    return response;
  },
  (error) => {
    // Bắt lỗi từ Backend trả về
    const message = error.response?.data?.message || 'Có lỗi xảy ra!';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;