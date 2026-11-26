package com.travelhub.dto.filter;

import com.travelhub.dto.common.BasePaginationRequest;

import com.travelhub.enums.CancellationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancellationFilterRequest extends BasePaginationRequest {
    private String keyword;               // Tìm kiếm theo mã đơn hoặc tên khách hàng
    private CancellationStatus status;
    
    // Lọc theo trạng thái xử lý (PENDING, APPROVED, REFUNDED, REJECTED)

    public CancellationFilterRequest() {
        setSortBy("cancellationDate"); 
        setOrder("DESC");    // Mặc định sắp xếp giảm dần
    }
}