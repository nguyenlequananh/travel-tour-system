package com.travelhub.dto.filter;

import com.travelhub.dto.common.BasePaginationRequest;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewFilterRequest extends BasePaginationRequest {
    private String keyword;  // Tìm kiếm theo nội dung bình luận hoặc tên khách hàng
    private Integer rating;  // Lọc theo số sao cụ thể (VD: Lọc xem tất cả các review 1 sao, 5 sao...)
    private Long tourId;     // Lọc theo Tour cụ thể

    public ReviewFilterRequest() {
        setSortBy("createdAt"); 
        setOrder("DESC");    // Mặc định sắp xếp giảm dần
    }
}