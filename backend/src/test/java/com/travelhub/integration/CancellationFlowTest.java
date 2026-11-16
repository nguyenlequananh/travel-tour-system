package com.travelhub.integration;

import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.request.PassengerRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PassengerType;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.service.BookingCancellationService;
import com.travelhub.service.BookingService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@SpringBootTest
@Transactional // Rollback lại database sau khi test xong để không làm bẩn dữ liệu mẫu
public class CancellationFlowTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingCancellationService cancellationService;

    @Autowired
    private TourDepartureRepository tourDepartureRepository;

    @Test
    public void testBookingCancellationAndSeatRestoration() {
        System.out.println("==============================================");
        System.out.println(" BẮT ĐẦU TEST LUỒNG HỦY TOUR & HOÀN TRẢ GHẾ");
        System.out.println("==============================================");

        // BƯỚC 1: Lấy thông tin đợt khởi hành ban đầu
        Long departureId = 1L;
        TourDeparture departureBefore = tourDepartureRepository.findById(departureId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành"));
        
        int seatsBeforeBooking = departureBefore.getAvailableSeats();
        System.out.println("1. Số ghế trống ban đầu: " + seatsBeforeBooking);

        // BƯỚC 2: Khách tiến hành đặt tour (đặt 3 vé)
        BookingCreateRequest bookingRequest = new BookingCreateRequest();
        bookingRequest.setUserId(3L);
        bookingRequest.setDepartureId(departureId);
        bookingRequest.setContactName("Nguyễn Văn Hủy");
        bookingRequest.setContactPhone("0911223344");
        bookingRequest.setContactEmail("huytour@gmail.com");
        bookingRequest.setContactAddress("Hà Nội");

        PassengerRequest p1 = new PassengerRequest();
        p1.setFullName("Nguyễn Văn Hủy");
        p1.setPassengerType(PassengerType.ADULT);

        PassengerRequest p2 = new PassengerRequest();
        p2.setFullName("Trần Thị B");
        p2.setPassengerType(PassengerType.ADULT);

        PassengerRequest p3 = new PassengerRequest();
        p3.setFullName("Nguyễn Bé C");
        p3.setPassengerType(PassengerType.CHILD);

        bookingRequest.setPassengers(List.of(p1, p2, p3));

        BookingResponse booking = bookingService.createBooking(bookingRequest);
        System.out.println("2. Đã đặt thành công 3 vé. Mã đơn: " + booking.getBookingCode());

        // Kiểm tra ghế đã bị trừ đi 3 chỗ
        TourDeparture departureAfterBooking = tourDepartureRepository.findById(departureId).get();
        System.out.println("3. Số ghế trống sau khi đặt 3 vé: " + departureAfterBooking.getAvailableSeats());
        Assertions.assertEquals(seatsBeforeBooking - 3, departureAfterBooking.getAvailableSeats());

        // Giả lập khách đã thanh toán đơn này (PAID) để test tính năng hoàn tiền
        bookingService.updatePaymentStatus(booking.getId(), PaymentStatus.PAID);
        System.out.println("4. Đã cập nhật trạng thái đơn thành PAID (Đã thanh toán)");

        // BƯỚC 3: Khách gửi yêu cầu hủy tour
        System.out.println("5. Khách gửi yêu cầu hủy tour...");
        CancellationRequest cancelRequest = new CancellationRequest();
        cancelRequest.setBookingId(booking.getId());
        cancelRequest.setReason("Đột xuất có việc gia đình không thể tham gia chuyến đi.");

        CancellationResponse cancelResponse = cancellationService.requestCancellation(cancelRequest);

        // Kiểm tra thông tin trả về từ biên bản hủy
        Assertions.assertNotNull(cancelResponse);
        System.out.println("   => Tỷ lệ phí phạt hủy (%): " + cancelResponse.getCancellationFeePercentage() + "%");
        System.out.println("   => Số tiền thực tế được hoàn lại: " + cancelResponse.getRefundAmount() + " VNĐ");
        System.out.println("   => Trạng thái biên bản hủy: " + cancelResponse.getStatus());

        // BƯỚC 4: KIỂM TRA QUAN TRỌNG - GHẾ CÓ ĐƯỢC HOÀN TRẢ VÀO KHO KHÔNG?
        TourDeparture departureAfterCancel = tourDepartureRepository.findById(departureId).get();
        int seatsAfterCancel = departureAfterCancel.getAvailableSeats();
        System.out.println("6. Số ghế trống sau khi hủy tour: " + seatsAfterCancel);

        // Số ghế trống phải quay trở về con số ban đầu trước khi đặt!
        Assertions.assertEquals(seatsBeforeBooking, seatsAfterCancel);
        System.out.println("   => KIỂM TRA HOÀN TRẢ GHẾ: CHUẨN XÁC! Kho ghế đã được cộng lại đủ 3 chỗ.");

        // Kiểm tra trạng thái đơn hàng chuyển sang CANCELLED
        BookingResponse cancelledBooking = bookingService.getBookingById(booking.getId());
        Assertions.assertEquals(BookingStatus.CANCELLED, cancelledBooking.getBookingStatus());
        System.out.println("7. Trạng thái đơn hàng hiện tại: " + cancelledBooking.getBookingStatus());

        System.out.println("==============================================");
        System.out.println(" TEST LUỒNG HỦY TOUR THÀNH CÔNG MỸ MÃN (100%) ");
        System.out.println("==============================================");
    }
}