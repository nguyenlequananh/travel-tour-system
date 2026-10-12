package com.travelhub.dto.request;

import com.travelhub.enums.TourType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourFilterRequest extends BasePaginationRequest {
    private String keyword;
    private Integer categoryId;
    private String departureCity;
    private TourType tourType;
}
