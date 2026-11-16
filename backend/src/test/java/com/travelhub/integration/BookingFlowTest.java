package com.travelhub.integration;

import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.request.PassengerRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PassengerType;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.service.BookingService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@Transactional // Đảm bảo sau khi test xong, DB tự động rollback lại như cũ, không làm rác dữ liệu
public class BookingFlowTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private TourDepartureRepository tourDepartureRepository;

    @Test
    public void testCompleteBookingAndPaymentFlow() {
        System.out.println("==============================================");
        System.out.println(" BẮT ĐẦU CHẠY TEST LUỒNG ĐẶT TOUR & THANH TOÁN");
        System.out.println("==============================================");

        // 1. CHỌN 1 ĐỢT KHỞI HÀNH CÓ SẴN TRONG DB (Ví dụ ID = 1 dựa theo file SQL mẫu của bạn)
        Long departureId = 1L;
        TourDeparture departureBefore = tourDepartureRepository.findById(departureId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành test"));

        int initialAvailableSeats = departureBefore.getAvailableSeats();
        System.out.println("1. Số ghế trống ban đầu của đợt khởi hành ID " + departureId + " là: " + initialAvailableSeats);

        // 2. TẠO REQUEST ĐẶT TOUR CHO 2 HÀNH KHÁCH (1 Người lớn, 1 Trẻ em)
        BookingCreateRequest request = new BookingCreateRequest();
        request.setUserId(3L); // ID của Lê Văn Khách trong DB mẫu
        request.setDepartureId(departureId);
        request.setContactName("Lê Văn Test");
        request.setContactPhone("0988888888");
        request.setContactEmail("levantest@gmail.com");
        request.setContactAddress("TP. Hồ Chí Minh");

        PassengerRequest adult = new PassengerRequest();
        adult.setFullName("Lê Văn Test");
        adult.setPassengerType(PassengerType.ADULT);
        // Đã xóa adult.setPrice() vì hệ thống tự tính toán giá trong Service

        PassengerRequest child = new PassengerRequest();
        child.setFullName("Lê Bé Test");
        child.setPassengerType(PassengerType.CHILD);
        // Đã xóa child.setPrice() vì hệ thống tự tính toán giá trong Service

        request.setPassengers(List.of(adult, child));

        // 3. GỌI HÀM TẠO BOOKING (ĐẶT TOUR)
        System.out.println("2. Đang tiến hành gọi Service đặt tour cho 2 hành khách...");
        BookingResponse bookingResponse = bookingService.createBooking(request);

        // Kiểm tra xem Booking đã tạo thành công chưa
        Assertions.assertNotNull(bookingResponse);
        Assertions.assertEquals(BookingStatus.PENDING, bookingResponse.getBookingStatus());
        Assertions.assertEquals(PaymentStatus.UNPAID, bookingResponse.getPaymentStatus());
        Assertions.assertEquals(2, bookingResponse.getTotalPassengers());
        System.out.println("   => Tạo đơn thành công! Mã đơn (BookingCode): " + bookingResponse.getBookingCode());
        System.out.println("   => Tổng tiền hệ thống tự tính: " + bookingResponse.getTotalAmount() + " VNĐ");

        // 4. KIỂM TRA XEM KHO GHẾ ĐÃ BỊ TRỪ CHƯA?
        TourDeparture departureAfterBooking = tourDepartureRepository.findById(departureId).get();
        int currentAvailableSeats = departureAfterBooking.getAvailableSeats();
        System.out.println("3. Số ghế trống sau khi đặt tour là: " + currentAvailableSeats);
        
        // Ghế trống phải giảm đúng bằng 2
        Assertions.assertEquals(initialAvailableSeats - 2, currentAvailableSeats);
        System.out.println("   => KIỂM TRA KHO GHẾ: CHUẨN XÁC! Đã tự động trừ 2 chỗ.");

        // 5. GIẢ LẬP KHÁCH THANH TOÁN THÀNH CÔNG (Cập nhật PaymentStatus thành PAID)
        System.out.println("4. Giả lập khách thanh toán thành công đơn hàng...");
        bookingService.updatePaymentStatus(bookingResponse.getId(), PaymentStatus.PAID);
        bookingService.updateBookingStatus(bookingResponse.getId(), BookingStatus.CONFIRMED);

        // 6. KIỂM TRA TRẠNG THÁI CUỐI CÙNG CỦA ĐƠN HÀNG
        BookingResponse finalBooking = bookingService.getBookingById(bookingResponse.getId());
        Assertions.assertEquals(PaymentStatus.PAID, finalBooking.getPaymentStatus());
        Assertions.assertEquals(BookingStatus.CONFIRMED, finalBooking.getBookingStatus());

        System.out.println("5. Trạng thái thanh toán hiện tại: " + finalBooking.getPaymentStatus());
        System.out.println("6. Trạng thái đơn hàng hiện tại: " + finalBooking.getBookingStatus());
        System.out.println("==============================================");
        System.out.println(" TEST LUỒNG THÀNH CÔNG MỸ MÃN (100% PASSED) ");
        System.out.println("==============================================");
    }
}