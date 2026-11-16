package com.travelhub.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserFilterRequest extends BasePaginationRequest {
    private String keyword;    // Tìm kiếm theo Họ tên, Email, hoặc Số điện thoại
    private Boolean isActive;  // Lọc theo trạng thái: true (đang hoạt động), false (bị khóa)
}