import axiosClient from '../api/axiosClient';

const guideService = {
  // ================= DÀNH CHO HƯỚNG DẪN VIÊN =================
  // 1. HDV xem các chuyến đi được phân công
  getMyAssignedDepartures: (userId) => {
    return axiosClient.get('/guide/my-departures', { params: { userId } });
  },

  // 2. HDV xem danh sách hành khách chi tiết (Manifest điểm danh)
  getDeparturePassengers: (departureId, userId) => {
    return axiosClient.get(`/guide/departures/${departureId}/passengers`, {
      params: { userId },
    });
  },

  // ================= DÀNH CHO ADMIN ĐIỀU HÀNH =================
  // 3. Admin lấy danh sách HDV phân công cho 1 đợt khởi hành
  getGuidesByDepartureId: (departureId) => {
    return axiosClient.get(`/admin/tour-guides/departure/${departureId}`);
  },

  // 4. Admin lấy danh sách tài khoản HDV khả dụng (Dropdown)
  getAvailableGuides: () => {
    return axiosClient.get('/admin/tour-guides/available-guides');
  },

  // 5. Admin phân công HDV cho chuyến đi
  assignGuide: (data) => {
    return axiosClient.post('/admin/tour-guides', data);
  },

  // 6. Admin cập nhật phân công (Trưởng đoàn / Phụ đoàn)
  updateGuideAssignment: (id, data) => {
    return axiosClient.put(`/admin/tour-guides/${id}`, data);
  },

  // 7. Admin gỡ phân công HDV khỏi chuyến đi
  removeGuideAssignment: (id) => {
    return axiosClient.delete(`/admin/tour-guides/${id}`);
  },
};

export default guideService;
