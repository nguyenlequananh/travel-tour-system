package com.travelhub.dto.response;

import com.travelhub.enums.DepartureStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GuideDepartureResponse {
    private Long departureId;
    private Long tourId;
    private String tourCode;
    private String tourName;
    private String departureCity;
    private String destinationCity;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private Integer totalGuests;      // Tổng số khách thực tế đã chốt đi
    private Boolean isLeadGuide;      // HDV này có phải Trưởng đoàn không?
    private DepartureStatus status;

    // Danh sách điểm đón xe của chuyến này
    private List<TourPickupPointResponse> pickupPoints;
}