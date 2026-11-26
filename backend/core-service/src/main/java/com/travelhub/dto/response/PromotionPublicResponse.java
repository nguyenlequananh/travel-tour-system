package com.travelhub.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PromotionPublicResponse {
    private String code;            // "HE2024"
    private String title;           // "Giảm 10% tối đa 1.000.000đ" (Tự format câu chữ cho đẹp)
    private BigDecimal minOrderAmount; // Đơn tối thiểu từ 5.000.000đ
    private LocalDateTime validTo;  // Hạn đến ngày nào
}