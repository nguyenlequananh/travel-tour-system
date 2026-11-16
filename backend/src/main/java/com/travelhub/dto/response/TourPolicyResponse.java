package com.travelhub.dto.response;

import com.travelhub.entity.TourPolicy;
import com.travelhub.enums.PolicyType;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TourPolicyResponse {
    private Long id;
    private Long tourId;
    private String tourName;
    private PolicyType policyType;
    private String content;

    public static TourPolicyResponse fromEntity(TourPolicy p) {
        if (p == null) return null;
        return TourPolicyResponse.builder()
                .id(p.getId())
                .tourId(p.getTour() != null ? p.getTour().getId() : null)
                .tourName(p.getTour() != null ? p.getTour().getName() : null)
                .policyType(p.getPolicyType())
                .content(p.getContent())
                .build();
    }
}