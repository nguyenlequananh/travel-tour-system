import axiosClient from '../api/axiosClient';

const categoryService = {
  // 1. Lấy tất cả danh mục công khai (Client)
  getPublicCategories: () => {
    return axiosClient.get('/categories');
  },

  // 2. Lấy tất cả danh mục cho Admin
  getAllCategories: () => {
    return axiosClient.get('/admin/categories');
  },

  // 3. Lấy chi tiết 1 danh mục
  getCategoryById: (id) => {
    return axiosClient.get(`/admin/categories/${id}`);
  },

  // 4. Tạo danh mục mới
  createCategory: (data) => {
    return axiosClient.post('/admin/categories', data);
  },

  // 5. Cập nhật danh mục
  updateCategory: (id, data) => {
    return axiosClient.put(`/admin/categories/${id}`, data);
  },

  // 6. Xóa mềm danh mục (chuyển sang INACTIVE)
  deleteCategory: (id) => {
    return axiosClient.delete(`/admin/categories/${id}`);
  },
};

export default categoryService;
