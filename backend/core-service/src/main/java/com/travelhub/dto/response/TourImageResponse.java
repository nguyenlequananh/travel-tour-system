package com.travelhub.dto.response;

import com.travelhub.entity.TourImage;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourImageResponse {
    private Long id;
    private Long tourId;
    private String tourName;
    private String imageUrl;

    public static TourImageResponse fromEntity(TourImage img) {
        if (img == null) return null;
        return TourImageResponse.builder()
                .id(img.getId())
                .tourId(img.getTour() != null ? img.getTour().getId() : null)
                .tourName(img.getTour() != null ? img.getTour().getName() : null)
                .imageUrl(img.getImageUrl())
                .build();
    }
}