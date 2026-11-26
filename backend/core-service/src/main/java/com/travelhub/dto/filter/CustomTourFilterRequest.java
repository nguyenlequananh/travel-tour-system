package com.travelhub.dto.filter;

import com.travelhub.dto.common.BasePaginationRequest;

import com.travelhub.enums.CustomTourStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomTourFilterRequest extends BasePaginationRequest {
    private String keyword;           // Tìm kiếm theo tên khách, email, sdt, hoặc điểm đến
    private CustomTourStatus status;  // Lọc theo trạng thái xử lý (NEW, CONTACTED, QUOTED, CLOSED)

    public CustomTourFilterRequest() {
        setSortBy("createdAt"); 
        setOrder("DESC");    // Mặc định sắp xếp giảm dần
    }
}