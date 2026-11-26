package com.travelhub.dto.response;

import com.travelhub.entity.TourGuide;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourGuideResponse {
    private Long id;
    private Long departureId;
    private Long guideId;
    private String guideName;
    private String guideEmail;
    private String guidePhone;
    private Boolean isLeadGuide;

    public static TourGuideResponse fromEntity(TourGuide tg) {
        if (tg == null) return null;
        return TourGuideResponse.builder()
                .id(tg.getId())
                .departureId(tg.getDeparture() != null ? tg.getDeparture().getId() : null)
                .guideId(tg.getGuide() != null ? tg.getGuide().getId() : null)
                .guideName(tg.getGuide() != null ? tg.getGuide().getFullName() : null)
                .guideEmail(tg.getGuide() != null ? tg.getGuide().getEmail() : null)
                .guidePhone(tg.getGuide() != null ? tg.getGuide().getPhoneNumber() : null)
                .isLeadGuide(tg.getIsLeadGuide())
                .build();
    }
}