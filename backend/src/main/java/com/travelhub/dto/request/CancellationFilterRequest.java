package com.travelhub.dto.request;

import com.travelhub.enums.CancellationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancellationFilterRequest extends BasePaginationRequest {
    private String keyword;               // Tìm kiếm theo mã đơn hoặc tên khách hàng
    private CancellationStatus status;    // Lọc theo trạng thái xử lý (PENDING, APPROVED, REFUNDED, REJECTED)
}