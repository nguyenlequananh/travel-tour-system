package com.travelhub.service.impl;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.travelhub.dto.message.BookingEmailMessage;
import com.travelhub.dto.message.RefundEmailMessage;
import com.travelhub.service.EmailService;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendBookingConfirmationEmail(BookingEmailMessage emailMsg) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(emailMsg.getContactEmail());
            helper.setSubject("✈️ [TRAVELHUB] Xác nhận đặt tour thành công - Mã vé: " + emailMsg.getBookingCode());
            
            String emailContent = buildBookingHtml(emailMsg);
            helper.setText(emailContent, true);
            
            javaMailSender.send(message);
            log.info("📧 [MAIL SERVICE] Đã gửi email xác nhận thành công tới: {}", emailMsg.getContactEmail());
        } catch (Exception e) {
            log.error("❌ [MAIL SERVICE] Lỗi khi gửi email tới: {}", emailMsg.getContactEmail(), e);
            throw new RuntimeException("Lỗi khi gửi email xác nhận đặt tour: " + e.getMessage(), e);
        }
    }

    private String buildBookingHtml(BookingEmailMessage emailMsg) {
       String departureDate = emailMsg.getDepartureDate() != null && !emailMsg.getDepartureDate().isEmpty() ? emailMsg.getDepartureDate() : "Chưa xác định";
        String returnDate = emailMsg.getReturnDate() != null && !emailMsg.getReturnDate().isEmpty() ? emailMsg.getReturnDate() : "Chưa xác định";

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
    @Override
    public void sendRefundConfirmationEmail(RefundEmailMessage refundEmailMessage) {
        try {
            jakarta.mail.internet.MimeMessage message = javaMailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                    new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(refundEmailMessage.getContactEmail());
            helper.setSubject("💵 [TRAVELHUB] Xác nhận hoàn tiền thành công - Mã đơn: " + refundEmailMessage.getBookingCode());
            String emailContent = """
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
                    refundEmailMessage.getContactName(),
                    refundEmailMessage.getBookingCode(),
                    refundEmailMessage.getTourName(),
                    refundEmailMessage.getReason() != null ? refundEmailMessage.getReason() : "Theo chính sách hủy tour",
                    String.format("%,.0f", refundEmailMessage.getRefundAmount())
            );
            helper.setText(emailContent, true);
            javaMailSender.send(message);
            log.info("📧 [MAIL SERVICE] Đã gửi email xác nhận hoàn tiền tới: {}", refundEmailMessage.getContactEmail());
        } catch (Exception e) {
            log.error("❌ [MAIL SERVICE] Lỗi khi gửi email hoàn tiền tới: {}", refundEmailMessage.getContactEmail(), e);
            throw new RuntimeException("Lỗi khi gửi email hoàn tiền: " + e.getMessage(), e);
        }
        
    }
}