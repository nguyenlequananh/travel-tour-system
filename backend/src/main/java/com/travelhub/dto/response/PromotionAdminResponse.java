package com.travelhub.dto.response;

import com.travelhub.enums.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.travelhub.entity.Promotion;
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PromotionAdminResponse {
    private Long id;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isActive;

    // Trường tính toán sẵn cho React hiển thị badge màu (Còn hạn / Hết hạn)
    private Boolean isExpired;      // true nếu validTo < hiện tại
    private Integer remainingUsage; // Số lượt còn lại = usageLimit - usedCount
    public static PromotionAdminResponse fromEntity(Promotion promotion) {
        return PromotionAdminResponse.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .discountType(promotion.getDiscountType())
                .discountValue(promotion.getDiscountValue())
                .maxDiscountAmount(promotion.getMaxDiscountAmount())
                .minOrderAmount(promotion.getMinOrderAmount())
                .validFrom(promotion.getValidFrom())
                .validTo(promotion.getValidTo())
                .usageLimit(promotion.getUsageLimit())
                .usedCount(promotion.getUsedCount())
                .isActive(promotion.getIsActive())
                .isExpired(promotion.getValidTo().isBefore(LocalDateTime.now()))
                .remainingUsage(promotion.getUsageLimit() - promotion.getUsedCount())
                .build();
    }
}