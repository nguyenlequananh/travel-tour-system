package com.travelhub.dto.filter;

import com.travelhub.dto.common.BasePaginationRequest;

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

    public TourFilterRequest() {
        setSortBy("id");
        setOrder("DESC"); // Mặc định hiển thị tour mới nhất lên đầu
    }
}
