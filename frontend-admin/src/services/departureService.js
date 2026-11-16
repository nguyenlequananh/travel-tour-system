import axiosClient from '../api/axiosClient';

const departureService = {
  // 1. Lấy tất cả đợt khởi hành theo Tour ID
  getDeparturesByTourId: (tourId) => {
    return axiosClient.get(`/admin/departures/tour/${tourId}`);
  },

  // 2. Lấy chi tiết 1 đợt khởi hành
  getDepartureById: (id) => {
    return axiosClient.get(`/admin/departures/${id}`);
  },

  // 3. Mở bán đợt khởi hành mới
  createDeparture: (data) => {
    return axiosClient.post('/admin/departures', data);
  },

  // 4. Cập nhật đợt khởi hành (giá vé, ngày, maxSeats, status)
  updateDeparture: (id, data) => {
    return axiosClient.put(`/admin/departures/${id}`, data);
  },

  // 5. Đổi trạng thái đợt khởi hành (OPEN, CLOSED, CANCELLED, SOLD_OUT)
  changeStatus: (id, status) => {
    return axiosClient.patch(`/admin/departures/${id}/status`, null, {
      params: { status },
    });
  },

  // 6. Lấy danh sách điểm đón công khai
  getPickupPoints: (departureId) => {
    return axiosClient.get(`/pickup-points/departure/${departureId}`);
  },

  // 7. Quản lý điểm đón (Admin)
  getAdminPickupPoints: (departureId) => {
    return axiosClient.get(`/admin/pickup-points/departure/${departureId}`);
  },
  createPickupPoint: (data) => {
    return axiosClient.post('/admin/pickup-points', data);
  },
  updatePickupPoint: (id, data) => {
    return axiosClient.put(`/admin/pickup-points/${id}`, data);
  },
  deletePickupPoint: (id) => {
    return axiosClient.delete(`/admin/pickup-points/${id}`);
  },
};

export default departureService;
