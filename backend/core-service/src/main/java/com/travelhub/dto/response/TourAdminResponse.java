package com.travelhub.dto.response;

import com.travelhub.entity.Tour;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourAdminResponse {
    private Long id;
    
    // Đã làm phẳng từ đối tượng Category ra 2 trường riêng biệt:
    private Integer categoryId;
    private String categoryName;

    private String tourCode;
    private String name;
    private TourType tourType;
    private String departureCity;
    private String destinationCity;
    private Integer durationDays;
    private Integer durationNights;
    private String featuredImage;
    private String summary;
    private String description;
    private TourStatus status;
    private LocalDateTime createdAt;

    // HÀM CHUYỂN ĐỔI: Biến 1 Entity Tour thành 1 DTO Response
    public static TourAdminResponse fromEntity(Tour tour) {
        if (tour == null) return null;

        return TourAdminResponse.builder()
                .id(tour.getId())
                .categoryId(tour.getCategory() != null ? tour.getCategory().getId() : null)
                .categoryName(tour.getCategory() != null ? tour.getCategory().getName() : null)
                .tourCode(tour.getTourCode())
                .name(tour.getName())
                .tourType(tour.getTourType())
                .departureCity(tour.getDepartureCity())
                .destinationCity(tour.getDestinationCity())
                .durationDays(tour.getDurationDays())
                .durationNights(tour.getDurationNights())
                .featuredImage(tour.getFeaturedImage())
                .summary(tour.getSummary())
                .description(tour.getDescription())
                .status(tour.getStatus())
                .createdAt(tour.getCreatedAt())
                .build();
    }
}