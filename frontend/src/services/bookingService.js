import axiosClient from '../api/axiosClient';

const bookingService = {
  // ================= DÀNH CHO KHÁCH HÀNG (CLIENT) =================
  // 1. Đặt tour mới
  createBooking: (data) => {
    return axiosClient.post('/bookings', data);
  },

  // 2. Lấy danh sách vé của khách theo User ID
  getMyBookings: (userId) => {
    return axiosClient.get('/bookings/my-bookings', { params: { userId } });
  },

  // 3. Tra cứu vé theo mã đơn BK-...
  trackBooking: (bookingCode) => {
    return axiosClient.get(`/bookings/track/${bookingCode}`);
  },

  // 4. Khách hàng gửi yêu cầu hủy vé
  requestCancel: (data) => {
    return axiosClient.post('/bookings/cancel', data);
  },

  // ================= DÀNH CHO QUẢN TRỊ VIÊN (ADMIN) =================
  // 5. Lọc danh sách đơn đặt tour (Phân trang, tìm kiếm, lọc trạng thái)
  getAdminBookings: (params) => {
    return axiosClient.get('/admin/bookings/filter', { params });
  },

  // 6. Lấy chi tiết đơn đặt tour theo ID
  getAdminBookingById: (id) => {
    return axiosClient.get(`/admin/bookings/${id}`);
  },

  // 7. Cập nhật tiến độ chuyến đi (PENDING, CONFIRMED, COMPLETED, CANCELLED)
  updateStatus: (id, status) => {
    return axiosClient.patch(`/admin/bookings/${id}/status`, null, {
      params: { status },
    });
  },

  // 8. Cập nhật trạng thái thanh toán (UNPAID, DEPOSITED, PAID, REFUNDED)
  updatePaymentStatus: (id, status) => {
    return axiosClient.patch(`/admin/bookings/${id}/payment-status`, null, {
      params: { status },
    });
  },

  // 9. Hủy đơn đặt tour (Nhả lại số ghế vào kho)
  cancelBooking: (id) => {
    return axiosClient.patch(`/admin/bookings/${id}/cancel`);
  },
};

export default bookingService;
