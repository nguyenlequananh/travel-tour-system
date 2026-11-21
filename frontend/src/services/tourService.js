import axiosClient from '../api/axiosClient';

const tourService = {
  // 1. Lấy danh sách tour phân trang & bộ lọc (Admin)
  getAdminTours: (params) => {
    return axiosClient.get('/admin/tours/filter', { params });
  },

  // 2. Lấy tất cả tour không phân trang (Admin)
  getAllAdminTours: () => {
    return axiosClient.get('/admin/tours');
  },

  // 3. Lấy chi tiết 1 tour theo ID (Admin)
  getAdminTourById: (id) => {
    return axiosClient.get(`/admin/tours/${id}`);
  },

  // 4. Tạo tour mới (Admin)
  createTour: (data) => {
    return axiosClient.post('/admin/tours', data);
  },

  // 5. Cập nhật thông tin tour (Admin)
  updateTour: (id, data) => {
    return axiosClient.put(`/admin/tours/${id}`, data);
  },

  // 6. Xóa mềm tour (chuyển sang INACTIVE)
  deleteTour: (id) => {
    return axiosClient.patch(`/admin/tours/${id}`);
  },

  // 7. Lấy danh sách tour công khai (Client)
  getPublicTours: (params) => {
    return axiosClient.get('/tours', { params });
  },

  // 8. Lấy chi tiết tour trọn gói (Tour + Departures + Itineraries + Images + Policies) (Client)
  getPublicTourDetail: (id) => {
    return axiosClient.get(`/tours/${id}`);
  },

  // ================= ALBUM ẢNH TOUR (TOUR IMAGES) =================
  getTourImages: (tourId) => {
    return axiosClient.get(`/admin/images/tour/${tourId}`);
  },
  createTourImage: (data) => {
    return axiosClient.post('/admin/images', data);
  },
  updateTourImage: (id, data) => {
    return axiosClient.put(`/admin/images/${id}`, data);
  },
  deleteTourImage: (id) => {
    return axiosClient.delete(`/admin/images/${id}`);
  },

  // ================= CHÍNH SÁCH TOUR (TOUR POLICIES) =================
  getTourPolicies: (tourId) => {
    return axiosClient.get(`/admin/policies/tour/${tourId}`);
  },
  createTourPolicy: (data) => {
    return axiosClient.post('/admin/policies', data);
  },
  updateTourPolicy: (id, data) => {
    return axiosClient.put(`/admin/policies/${id}`, data);
  },
  deleteTourPolicy: (id) => {
    return axiosClient.delete(`/admin/policies/${id}`);
  },
};

export default tourService;
