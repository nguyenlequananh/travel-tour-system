package com.travelhub.scheduler;

import com.travelhub.entity.Booking;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.TourDepartureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingScheduler {
    private final BookingRepository bookingRepository;
    private final TourDepartureRepository tourDepartureRepository;

    @Scheduled (fixedRate = 60000)
    @Transactional (rollbackFor = Exception.class)
    public void autoCancelExpiredBookings() {
       LocalDateTime expirationTime = LocalDateTime.now().minusMinutes(15);
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(
                BookingStatus.PENDING,
                PaymentStatus.UNPAID,
                expirationTime
        );
        if(expiredBookings.isEmpty()){
            return;
        }
        for (Booking booking : expiredBookings) {
            booking.setBookingStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            log.info("Đơn đặt tour ID {} đã được tự động hủy do quá hạn thanh toán.", booking.getId());

            TourDeparture departure = booking.getDeparture();

            if (departure != null) {
                departure.setAvailableSeats(departure.getAvailableSeats() + booking.getTotalPassengers());;
            
                if(departure.getStatus() == DepartureStatus.SOLD_OUT && departure.getDepartureDate().isAfter(LocalDate.now())) {
                    departure.setStatus(DepartureStatus.OPEN);
                     log.info("   -> Chuyến đi ID {} đã có ghế trống trở lại, tự động đổi sang OPEN!", departure.getId());
                }
                tourDepartureRepository.save(departure);
                log.info("Cập nhật số lượng chỗ trống cho chuyến đi ID {} sau khi hủy đơn đặt tour.", departure.getId());
            }

        }
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void autoClosePastDepartures() {
        LocalDate today = LocalDate.now();
        List<TourDeparture> pastDepartures = tourDepartureRepository.findPastDeparturesWithStatus(DepartureStatus.OPEN, today);
        List<TourDeparture> pastSoldOutDepartures = tourDepartureRepository.findPastDeparturesWithStatus(
                DepartureStatus.SOLD_OUT,
                today
        );
        pastDepartures.addAll(pastSoldOutDepartures);
        if (pastDepartures.isEmpty()) {
            return;
        }
        log.info("⏰ [ROBOT CRON-JOB] Phát hiện {} chuyến đi đã qua ngày khởi hành! Đang tự động đóng...", pastDepartures.size());
        for (TourDeparture departure : pastDepartures) {
            // Đổi trạng thái sang CLOSED
            departure.setStatus(DepartureStatus.CLOSED);
            tourDepartureRepository.save(departure);
            log.info("   -> Đã đóng chuyến đi ID: {} (Ngày đi: {}, Trạng thái cũ đã chuyển sang CLOSED)", 
                    departure.getId(), departure.getDepartureDate());
        }
    }
}
