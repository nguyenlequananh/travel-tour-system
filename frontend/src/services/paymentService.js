import axiosClient from '../api/axiosClient';

const paymentService = {
  // 1. Tạo đường dẫn thanh toán VNPay Sandbox
  createVnPayUrl: (bookingId) => {
    return axiosClient.post('/payments/create-vnpay-url', null, {
      params: { bookingId },
    });
  },

  // 2. Xác thực kết quả VNPay callback
  verifyVnPayCallback: (queryString) => {
    return axiosClient.get(`/payments/vnpay-callback${queryString}`);
  },

  // 3. Lấy danh sách giao dịch thanh toán phân trang & lọc (Admin)
  getAdminPayments: (params) => {
    return axiosClient.get('/admin/payments/filter', { params });
  },

  // 4. Lấy lịch sử thanh toán của 1 đơn đặt tour cụ thể
  getPaymentsByBookingId: (bookingId) => {
    return axiosClient.get(`/admin/payments/booking/${bookingId}`);
  },

  // 5. Ghi nhận giao dịch thanh toán thủ công (Tiền mặt tại quầy / Chuyển khoản)
  processManualPayment: (data) => {
    return axiosClient.post('/admin/payments', data);
  },
};

export default paymentService;
