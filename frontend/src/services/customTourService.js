import axiosClient from '../api/axiosClient';

const customTourService = {
  // 1. Khách gửi yêu cầu thiết kế tour đoàn riêng (Public)
  submitRequest: (data) => {
    return axiosClient.post('/custom-tours', data);
  },

  // 2. Admin lấy danh sách yêu cầu tour đoàn có phân trang & lọc
  getAdminRequests: (params) => {
    return axiosClient.get('/admin/custom-tours/filter', { params });
  },

  // 3. Lấy chi tiết 1 yêu cầu
  getRequestById: (id) => {
    return axiosClient.get(`/admin/custom-tours/${id}`);
  },

  // 4. Cập nhật trạng thái xử lý (NEW, CONTACTED, PROPOSED, CONFIRMED, CANCELLED)
  updateStatus: (id, status) => {
    return axiosClient.patch(`/admin/custom-tours/${id}/status`, null, {
      params: { status },
    });
  },
};

export default customTourService;
