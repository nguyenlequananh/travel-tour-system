package com.travelhub.dto.response;

import com.travelhub.entity.Review;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long userId;
    private String userName;     // Tên người đánh giá
    private Long tourId;
    private String tourName;     // Tên tour
    private String tourCode;     // Mã tour
    private Integer rating;      // Số sao (1 - 5)
    private String comment;      // Bình luận
    private LocalDateTime createdAt;

    // HÀM CHUYỂN ĐỔI CHUẨN CỦA DỰ ÁN: Entity -> DTO Response
    public static ReviewResponse fromEntity(Review r) {
        if (r == null) return null;
        return ReviewResponse.builder()
                .id(r.getId())
                .userId(r.getUser() != null ? r.getUser().getId() : null)
                .userName(r.getUser() != null ? r.getUser().getFullName() : "Khách ẩn danh")
                .tourId(r.getTour() != null ? r.getTour().getId() : null)
                .tourName(r.getTour() != null ? r.getTour().getName() : null)
                .tourCode(r.getTour() != null ? r.getTour().getTourCode() : null)
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}