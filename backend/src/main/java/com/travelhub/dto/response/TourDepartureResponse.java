package com.travelhub.dto.response;

import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.TourGuide;
import com.travelhub.enums.DepartureStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourDepartureResponse {
    private Long id;
    private Long tourId;
    private String tourCode;
    private String tourName;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal singleRoomSupplement;
    private Integer maxSeats;
    private Integer availableSeats;
    private DepartureStatus status;
    // Bổ sung thêm 2 trường này vào TourDepartureResponse:
    private String leadGuideName; // Tên Trưởng đoàn
    private String leadGuidePhone; // Số điện thoại Trưởng đoàn

    public static TourDepartureResponse fromEntity(TourDeparture departure) {
        if (departure == null)
            return null;

        return TourDepartureResponse.builder()
                .id(departure.getId())
                .tourId(departure.getTour() != null ? departure.getTour().getId() : null)
                .tourCode(departure.getTour() != null ? departure.getTour().getTourCode() : null)
                .tourName(departure.getTour() != null ? departure.getTour().getName() : null)
                .departureDate(departure.getDepartureDate())
                .returnDate(departure.getReturnDate())
                .adultPrice(departure.getAdultPrice())
                .childPrice(departure.getChildPrice())
                .singleRoomSupplement(departure.getSingleRoomSupplement())
                .maxSeats(departure.getMaxSeats())
                .availableSeats(departure.getAvailableSeats())
                .status(departure.getStatus())
                .build();
    }
     // 2. Hàm fromEntity kèm thông tin Trưởng đoàn (Overload)
    public static TourDepartureResponse fromEntity(TourDeparture departure, TourGuide leadGuide) {
        TourDepartureResponse response = fromEntity(departure);
        if (response != null && leadGuide != null && leadGuide.getGuide() != null) {
            response.setLeadGuideName(leadGuide.getGuide().getFullName());
            response.setLeadGuidePhone(leadGuide.getGuide().getPhoneNumber());
        }
        return response;
    }
}