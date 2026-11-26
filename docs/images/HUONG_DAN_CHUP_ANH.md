# Hướng Dẫn Chụp Ảnh Giao Diện Nhúng Vào Báo Cáo Đồ Án (SGU)

Để **tự động nhúng ảnh chụp màn hình thật** vào Chương 4 của file `docs/BAO_CAO_DO_AN_CUOI_KY.pdf`, bạn chỉ cần chụp ảnh màn hình trình duyệt (khuyến nghị độ phân giải 1440×900 hoặc 1920×1080, lưu dạng `.png`) và đặt **đúng tên file** trong thư mục `docs/images/` này:

| STT | Tên file cần lưu trong `docs/images/` | Nội dung cần chụp |
| :-: | :--- | :--- |
| 1 | `01_trang_chu.png` | Trang chủ Customer (`/`) hiển thị Hero Banner, bộ lọc và danh sách tour |
| 2 | `02_chi_tiet_dat_tour.png` | Trang Chi tiết Tour (`/tours/:id`) hoặc Modal Đặt vé hiển thị tạm tính tổng tiền |
| 3 | `03_thanh_toan_vnpay.png` | Cổng thanh toán VNPay Sandbox hoặc trang kết quả thanh toán thành công (`/payment-callback`) |
| 4 | `04_ve_cua_toi_pdf.png` | Trang Vé của tôi (`/my-bookings`) hoặc file Vé điện tử PDF đã xuất |
| 5 | `05_ai_chatbot.png` | Khung Chat Trợ lý ảo Google Gemini AI đang gợi ý tour thực tế |
| 6 | `06_guide_diem_danh.png` | Cổng Hướng dẫn viên (`/guide`) mở Drawer điểm danh hành khách theo giờ đón |
| 7 | `07_admin_dashboard.png` | Trang Admin Dashboard (`/admin/dashboard`) hiển thị KPI và biểu đồ doanh thu |
| 8 | `08_admin_quan_tri.png` | Trang Quản trị Đơn đặt tour hoặc Xử lý Hủy & Hoàn tiền kèm thông báo WebSocket |
| 9 | `09_admin_spring_batch.png` | Modal **Import CSV (Spring Batch)** tại `/admin/departures` hiển thị kết quả Đọc / Thành công / Bỏ qua |
| 10 | `10_eureka_microservices.png` | Eureka Dashboard (`http://localhost:8761`) hiển thị đủ 3 dịch vụ xanh **UP**: `API-GATEWAY`, `CORE-SERVICE`, `NOTIFICATION-SERVICE` |
| 11 | `11_admin_email_logs.png` | Trang **Nhật Ký Email** (`/admin/email-logs`) hiển thị 3 thẻ KPI và bảng lịch sử email từ `notification-service` |

> Sau khi lưu các ảnh vào `docs/images/`, bạn chỉ cần nhắn **"xuất lại PDF có ảnh"** — hệ thống sẽ tự động nhúng toàn bộ ảnh sắc nét vào đúng vị trí từng hình (`Hình 4.1` → `Hình 4.11`) và cập nhật lại số trang Mục lục chuẩn xác!
