import axiosClient from '../api/axiosClient';

const itineraryService = {
  // 1. Lấy toàn bộ lịch trình của một Tour
  getItinerariesByTourId: (tourId) => {
    return axiosClient.get(`/admin/itineraries/tour/${tourId}`);
  },

  // 2. Lấy chi tiết lịch trình theo ID
  getItineraryById: (id) => {
    return axiosClient.get(`/admin/itineraries/${id}`);
  },

  // 3. Tạo mới 1 ngày lịch trình
  createItinerary: (data) => {
    return axiosClient.post('/admin/itineraries', data);
  },

  // 4. Cập nhật ngày lịch trình
  updateItinerary: (id, data) => {
    return axiosClient.put(`/admin/itineraries/${id}`, data);
  },

  // 5. Xóa ngày lịch trình
  deleteItinerary: (id) => {
    return axiosClient.delete(`/admin/itineraries/${id}`);
  },
};

export default itineraryService;
