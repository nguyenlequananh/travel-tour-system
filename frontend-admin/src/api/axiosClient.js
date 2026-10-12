import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
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