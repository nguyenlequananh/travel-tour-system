import axiosClient from '../api/axiosClient';

const notificationService = {
  // 1. Lấy danh sách thông báo của tài khoản (Phân trang)
  getMyNotifications: (userId, page = 0, size = 10) => {
    return axiosClient.get('/notifications/my-notifications', {
      params: { userId, page, size },
    });
  },

  // 2. Đếm số lượng thông báo chưa đọc
  getUnreadCount: (userId) => {
    return axiosClient.get('/notifications/unread-count', {
      params: { userId },
    });
  },

  // 3. Đánh dấu 1 thông báo là đã đọc
  markAsRead: (id) => {
    return axiosClient.patch(`/notifications/${id}/read`);
  },

  // 4. Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: (userId) => {
    return axiosClient.patch('/notifications/read-all', null, {
      params: { userId },
    });
  },
};

export default notificationService;
