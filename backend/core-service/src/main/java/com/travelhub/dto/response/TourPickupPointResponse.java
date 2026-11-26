package com.travelhub.dto.response;

import com.travelhub.entity.TourPickupPoint;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourPickupPointResponse {
    private Long id;
    private Long departureId;
    private String locationName;
    private LocalTime pickupTime;

    public static TourPickupPointResponse fromEntity(TourPickupPoint p) {
        if (p == null) return null;
        return TourPickupPointResponse.builder()
                .id(p.getId())
                .departureId(p.getDeparture() != null ? p.getDeparture().getId() : null)
                .locationName(p.getLocationName())
                .pickupTime(p.getPickupTime())
                .build();
    }
}