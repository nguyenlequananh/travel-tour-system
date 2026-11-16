import axiosClient from '../api/axiosClient';

const reviewService = {
  // 1. Khách xem danh sách đánh giá của 1 Tour
  getReviewsByTourId: (tourId) => {
    return axiosClient.get(`/reviews/tour/${tourId}`);
  },

  // 2. Lấy số sao trung bình của Tour
  getAverageRating: (tourId) => {
    return axiosClient.get(`/reviews/tour/${tourId}/rating`);
  },

  // 3. Khách gửi đánh giá mới
  createReview: (userId, data) => {
    return axiosClient.post('/reviews', data, { params: { userId } });
  },

  // 4. Admin lọc danh sách đánh giá
  getAdminReviews: (params) => {
    return axiosClient.get('/admin/reviews/filter', { params });
  },

  // 5. Admin xóa đánh giá vi phạm
  deleteReview: (id) => {
    return axiosClient.delete(`/admin/reviews/${id}`);
  },
};

export default reviewService;
