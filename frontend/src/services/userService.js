import axiosClient from '../api/axiosClient';

const userService = {
  // 1. Lọc danh sách người dùng phân trang (Admin)
  getAdminUsers: (params) => {
    return axiosClient.get('/admin/users/filter', { params });
  },

  // 2. Lấy tất cả người dùng
  getAllUsers: () => {
    return axiosClient.get('/admin/users');
  },

  // 3. Lấy thông tin người dùng theo ID
  getUserById: (id) => {
    return axiosClient.get(`/admin/users/${id}`);
  },

  // 4. Tạo tài khoản mới từ Admin
  createUser: (data) => {
    return axiosClient.post('/admin/users', data);
  },

  // 5. Cập nhật thông tin người dùng
  updateUser: (id, data) => {
    return axiosClient.put(`/admin/users/${id}`, data);
  },

  // 6. Xóa / Khóa tài khoản người dùng
  deleteUser: (id) => {
    return axiosClient.patch(`/admin/users/${id}`);
  },

  // 7. Cập nhật quyền hạn (Roles)
  updateUserRoles: (id, data) => {
    return axiosClient.patch(`/admin/users/${id}/roles`, data);
  },

  // ================= THÔNG TIN CÁ NHÂN (PROFILE) =================
  getProfile: () => {
    return axiosClient.get('/profile');
  },

  updateProfile: (data) => {
    return axiosClient.put('/profile', data);
  },

  changePassword: (data) => {
    return axiosClient.put('/profile/change-password', data);
  },
};

export default userService;
