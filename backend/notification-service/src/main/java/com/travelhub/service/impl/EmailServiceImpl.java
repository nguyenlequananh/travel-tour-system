package com.travelhub.service.impl;

import com.travelhub.dto.message.BookingEmailMessage;
import com.travelhub.dto.message.RefundEmailMessage;
import com.travelhub.entity.EmailLog;
import com.travelhub.repository.EmailLogRepository;
import com.travelhub.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;
    private final EmailLogRepository emailLogRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendBookingConfirmationEmail(BookingEmailMessage emailMsg) {
        String subject = "✈️ [TRAVELHUB] Xác nhận đặt tour thành công - Mã vé: " + emailMsg.getBookingCode();
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(emailMsg.getContactEmail());
            helper.setSubject(subject);
            helper.setText(buildBookingHtml(emailMsg), true);

            javaMailSender.send(message);

            saveLog(emailMsg.getBookingCode(), emailMsg.getContactEmail(),
                    "BOOKING_CONFIRMATION", subject, "SENT", null);
            log.info("📧 [NOTIFICATION-SERVICE] Đã gửi & lưu log email đặt tour tới: {}", emailMsg.getContactEmail());
        } catch (Exception e) {
            saveLog(emailMsg.getBookingCode(), emailMsg.getContactEmail(),
                    "BOOKING_CONFIRMATION", subject, "FAILED", e.getMessage());
            log.error("❌ [NOTIFICATION-SERVICE] Lỗi gửi email đặt tour tới: {}", emailMsg.getContactEmail(), e);
            throw new RuntimeException("Lỗi khi gửi email xác nhận đặt tour: " + e.getMessage(), e);
        }
    }

    @Override
    public void sendRefundConfirmationEmail(RefundEmailMessage refundMsg) {
        String subject = "💵 [TRAVELHUB] Xác nhận hoàn tiền thành công - Mã đơn: " + refundMsg.getBookingCode();
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(refundMsg.getContactEmail());
            helper.setSubject(subject);
            helper.setText(buildRefundHtml(refundMsg), true);

            javaMailSender.send(message);

            saveLog(refundMsg.getBookingCode(), refundMsg.getContactEmail(),
                    "REFUND_CONFIRMATION", subject, "SENT", null);
            log.info("📧 [NOTIFICATION-SERVICE] Đã gửi & lưu log email hoàn tiền tới: {}", refundMsg.getContactEmail());
        } catch (Exception e) {
            saveLog(refundMsg.getBookingCode(), refundMsg.getContactEmail(),
                    "REFUND_CONFIRMATION", subject, "FAILED", e.getMessage());
            log.error("❌ [NOTIFICATION-SERVICE] Lỗi gửi email hoàn tiền tới: {}", refundMsg.getContactEmail(), e);
            throw new RuntimeException("Lỗi khi gửi email hoàn tiền: " + e.getMessage(), e);
        }
    }

    private void saveLog(String bookingCode, String recipientEmail, String emailType,
                         String subject, String status, String errorMessage) {
        String truncatedError = (errorMessage != null && errorMessage.length() > 500)
                ? errorMessage.substring(0, 500)
                : errorMessage;

        EmailLog emailLog = EmailLog.builder()
                .bookingCode(bookingCode)
                .recipientEmail(recipientEmail)
                .emailType(emailType)
                .subject(subject)
                .status(status)
                .errorMessage(truncatedError)
                .sentAt(LocalDateTime.now())
                .build();
        emailLogRepository.save(emailLog);
    }

    private String buildBookingHtml(BookingEmailMessage emailMsg) {
        String departureDate = emailMsg.getDepartureDate() != null && !emailMsg.getDepartureDate().isEmpty()
                ? emailMsg.getDepartureDate() : "Chưa xác định";
        String returnDate = emailMsg.getReturnDate() != null && !emailMsg.getReturnDate().isEmpty()
                ? emailMsg.getReturnDate() : "Chưa xác định";

        return """
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #1677ff; text-align: center;">XÁC NHẬN ĐẶT TOUR THÀNH CÔNG</h2>
                <p>Kính chào quý khách <strong>%s</strong>,</p>
                <p>Cảm ơn quý khách đã đặt tour tại <strong>TravelHub</strong>. Dưới đây là thông tin chi tiết vé du lịch của quý khách:</p>
                <table style="width: 100%%; border-collapse: collapse; margin-top: 15px;">
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Mã đặt vé:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: #d4380d; font-weight: bold;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Chuyến đi:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Thời gian:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">%s ➔ %s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Số lượng vé:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">%d hành khách</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Tổng thanh toán:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: #52c41a; font-size: 18px; font-weight: bold;">%s VNĐ</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">Quý khách vui lòng kiểm tra lại thông tin. Nếu có bất kỳ thắc mắc nào, xin liên hệ Hotline: <strong>1900 8888</strong>.</p>
                <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #888;">
                    Trân trọng cảm ơn quý khách đã đồng hành cùng TravelHub!
                </div>
            </div>
            """.formatted(
                emailMsg.getContactName(),
                emailMsg.getBookingCode(),
                emailMsg.getTourName(),
                departureDate,
                returnDate,
                emailMsg.getTotalPassengers(),
                String.format("%,.0f", emailMsg.getTotalAmount())
        );
    }

    private String buildRefundHtml(RefundEmailMessage refundMsg) {
        return """
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                <h2 style="color: #52c41a; text-align: center;">XÁC NHẬN HOÀN TIỀN THÀNH CÔNG</h2>
                <p>Kính chào quý khách <strong>%s</strong>,</p>
                <p>Yêu cầu hủy tour và hoàn tiền cho đơn hàng của quý khách đã được ban quản trị <strong>TravelHub</strong> xử lý thành công.</p>
                <table style="width: 100%%; border-collapse: collapse; margin-top: 15px;">
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Mã đơn hàng:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: #d4380d; font-weight: bold;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Tour du lịch:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                    </tr>
                    <tr style="background-color: #f8f9fa;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Lý do hủy:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">%s</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Số tiền hoàn lại:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: #52c41a; font-size: 18px; font-weight: bold;">%s VNĐ</td>
                    </tr>
                </table>
                <p style="margin-top: 20px; color: #666; font-size: 13px;">
                    * Số tiền sẽ được hoàn về tài khoản gốc của quý khách trong vòng 1-3 ngày làm việc tùy thuộc vào ngân hàng thụ hưởng.
                </p>
                <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #888;">
                    Mọi thắc mắc xin vui lòng liên hệ Hotline hỗ trợ: <strong>1900 8888</strong>.
                </div>
            </div>
            """.formatted(
                refundMsg.getContactName(),
                refundMsg.getBookingCode(),
                refundMsg.getTourName(),
                refundMsg.getReason() != null ? refundMsg.getReason() : "Theo chính sách hủy tour",
                String.format("%,.0f", refundMsg.getRefundAmount())
        );
    }
}
