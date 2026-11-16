import axiosClient from '../api/axiosClient';

const dashboardService = {
  // Lấy dữ liệu thống kê tổng quan doanh thu, số khách, biểu đồ tháng, top tour
  getStats: (year) => {
    return axiosClient.get('/admin/dashboard/stats', {
      params: year ? { year } : {},
    });
  },
};

export default dashboardService;
