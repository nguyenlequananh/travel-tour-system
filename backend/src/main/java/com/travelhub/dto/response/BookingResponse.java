package com.travelhub.dto.response;

import com.travelhub.entity.Booking;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long userId;
    private String customerName; // Tên tài khoản đặt
    private Long departureId;
    private String tourName; // Tên tour đi
    private LocalDate departureDate;
    private LocalDate returnDate;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private String contactAddress;
    private String specialRequests;
    private Integer totalPassengers;
    private BigDecimal totalAmount;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private LocalDateTime bookingDate;

    // Kèm theo danh sách hành khách chi tiết
    private List<PassengerResponse> passengers;

    public static BookingResponse fromEntity(Booking b) {
        if (b == null) return null;

        List<PassengerResponse> passengerList = (b.getPassengers() != null)
                ? b.getPassengers().stream().map(PassengerResponse::fromEntity).toList()
                : List.of();

        return BookingResponse.builder()
                .id(b.getId())
                .bookingCode(b.getBookingCode())
                .userId(b.getUser() != null ? b.getUser().getId() : null)
                .customerName(b.getUser() != null ? b.getUser().getFullName() : null)
                .departureId(b.getDeparture() != null ? b.getDeparture().getId() : null)
                .tourName(b.getDeparture() != null && b.getDeparture().getTour() != null 
                        ? b.getDeparture().getTour().getName() : null)
                .departureDate(b.getDeparture() != null ? b.getDeparture().getDepartureDate() : null)
                .returnDate(b.getDeparture() != null ? b.getDeparture().getReturnDate() : null)
                .contactName(b.getContactName())
                .contactPhone(b.getContactPhone())
                .contactEmail(b.getContactEmail())
                .contactAddress(b.getContactAddress())
                .specialRequests(b.getSpecialRequests())
                .totalPassengers(b.getTotalPassengers())
                .totalAmount(b.getTotalAmount())
                .bookingStatus(b.getBookingStatus())
                .paymentStatus(b.getPaymentStatus())
                .bookingDate(b.getBookingDate())
                .passengers(passengerList)
                .build();
    }
}