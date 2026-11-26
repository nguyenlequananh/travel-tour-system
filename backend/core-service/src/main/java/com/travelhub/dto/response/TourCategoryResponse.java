package com.travelhub.dto.response;

import com.travelhub.entity.TourCategory;
import com.travelhub.enums.CategoryStatus;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TourCategoryResponse {
    private Integer id;
    private String name;
    private String slug;
    private String description;
    private CategoryStatus status;

    // HÀM CHUYỂN ĐỔI CHUẨN CỦA DỰ ÁN: Entity -> DTO Response
    public static TourCategoryResponse fromEntity(TourCategory c) {
        if (c == null) return null;
        return TourCategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .status(c.getStatus())
                .build();
    }
}