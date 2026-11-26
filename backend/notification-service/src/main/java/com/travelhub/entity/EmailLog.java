package com.travelhub.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Khóa liên kết mềm (không dùng Foreign Key sang DB của core-service)
    @Column(nullable = false, length = 50)
    private String bookingCode;

    // Địa chỉ email khách hàng nhận thư
    @Column(nullable = false, length = 150)
    private String recipientEmail;

    // Phân loại: "BOOKING_CONFIRMATION" hoặc "REFUND_CONFIRMATION"
    @Column(nullable = false, length = 40)
    private String emailType;

    // Tiêu đề email đã gửi
    @Column(nullable = false, length = 255)
    private String subject;

    // Trạng thái: "SENT" (thành công) hoặc "FAILED" (lỗi)
    @Column(nullable = false, length = 20)
    private String status;

    // Lưu thông báo lỗi nếu FAILED (cho phép null khi SENT)
    @Column(length = 500)
    private String errorMessage;

    // Thời điểm gửi (dùng để sắp xếp mới nhất lên đầu)
    @Column(nullable = false)
    private LocalDateTime sentAt;
}