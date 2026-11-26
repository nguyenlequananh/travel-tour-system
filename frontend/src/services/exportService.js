import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' ? 'http://localhost:8088/api/v1' : '/api/v1'
);

const downloadFile = async (endpoint, defaultFilename) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const blob = new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  const disposition = response.headers['content-disposition'];
  let filename = defaultFilename;
  if (disposition && disposition.includes('filename=')) {
    const matches = disposition.match(/filename="?([^"]+)"?/);
    if (matches && matches[1]) {
      filename = matches[1];
    }
  }

  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

const exportService = {
  // 1. Xuất Excel báo cáo tài chính tháng (Admin)
  exportFinancialReport: (month, year) => {
    return downloadFile(
      `/export/financial-report?month=${month}&year=${year}`,
      `BaoCaoTaiChinh_Thang${month}_${year}.xlsx`
    );
  },

  // 2. Xuất Excel danh sách hành khách đoàn cho Guide
  exportGuideManifest: (departureId, guideUserId) => {
    return downloadFile(
      `/export/guide/departures/${departureId}/manifest?guideUserId=${guideUserId}`,
      `DanhSachDoan_ChuyenDi_${departureId}.xlsx`
    );
  },

  // 3. Xuất Vé điện tử & Hóa đơn PDF cho Khách hàng
  exportBookingTicketPdf: (bookingId) => {
    return downloadFile(
      `/export/booking/${bookingId}/ticket-pdf`,
      `VeTour_TravelHub_${bookingId}.pdf`
    );
  },
};

export default exportService;
