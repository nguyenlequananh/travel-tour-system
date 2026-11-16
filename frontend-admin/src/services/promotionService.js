import axiosClient from '../api/axiosClient';

const promotionService = {
  // 1. Khách kiểm tra mã giảm giá
  checkPromotion: (code) => {
    return axiosClient.get('/promotions/check', { params: { code } });
  },

  // 2. Lấy danh sách voucher có phân trang & lọc (Admin)
  getAdminPromotions: (params) => {
    return axiosClient.get('/admin/promotions/filter', { params });
  },

  // 3. Lấy tất cả voucher
  getAllPromotions: () => {
    return axiosClient.get('/admin/promotions');
  },

  // 4. Tạo mã giảm giá mới
  createPromotion: (data) => {
    return axiosClient.post('/admin/promotions', data);
  },

  // 5. Cập nhật mã giảm giá
  updatePromotion: (id, data) => {
    return axiosClient.put(`/admin/promotions/${id}`, data);
  },

  // 6. Xóa / Vô hiệu hóa voucher (Soft delete bằng PATCH)
  deletePromotion: (id) => {
    return axiosClient.patch(`/admin/promotions/${id}`);
  },
};

export default promotionService;
