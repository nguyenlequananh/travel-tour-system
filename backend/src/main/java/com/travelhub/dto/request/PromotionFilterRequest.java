package com.travelhub.dto.request;

import com.travelhub.enums.DiscountType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PromotionFilterRequest extends BasePaginationRequest {
    private String keyword;           // Tìm kiếm theo mã code (VD: HE2026)
    private DiscountType discountType; // Lọc theo loại giảm giá (PERCENTAGE hoặc FIXED_AMOUNT)
    private Boolean isActive;         // Lọc theo trạng thái (true: đang hoạt động, false: đã khóa/hết hạn)
}