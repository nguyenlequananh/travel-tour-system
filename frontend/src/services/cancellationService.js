import axiosClient from '../api/axiosClient';

const cancellationService = {
  // 1. Lấy danh sách yêu cầu hủy có phân trang và bộ lọc
  getCancellations: (params) => {
    return axiosClient.get('/admin/cancellations/filter', { params });
  },

  // 2. Lấy tất cả yêu cầu hủy không phân trang
  getAllCancellations: () => {
    return axiosClient.get('/admin/cancellations');
  },

  // 3. Admin tạo yêu cầu hủy tour thủ công
  requestCancellation: (data) => {
    return axiosClient.post('/admin/cancellations', data);
  },

  // 4. Admin duyệt hoàn tiền (Kích hoạt RabbitMQ gửi mail & đổi trạng thái)
  confirmRefund: (id) => {
    return axiosClient.patch(`/admin/cancellations/${id}/confirm-refund`);
  },
};

export default cancellationService;
