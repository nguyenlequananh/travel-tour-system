package com.travelhub.dto.request;

import com.travelhub.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PromotionRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    @Size(min = 3, max = 20, message = "Mã voucher từ 3 đến 20 ký tự")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Mã voucher chỉ được chứa chữ in hoa và số (vd: HE2024)")
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType; // PERCENTAGE hoặc FIXED_AMOUNT

    @NotNull(message = "Mức giảm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Mức giảm phải lớn hơn 0")
    private BigDecimal discountValue;

    // Có thể null nếu là giảm tiền mặt cố định
    private BigDecimal maxDiscountAmount;

    // Giá trị đơn hàng tối thiểu (nếu không nhập thì mặc định là 0)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime validFrom;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @Future(message = "Ngày kết thúc phải ở tương lai")
    private LocalDateTime validTo;

    @NotNull(message = "Giới hạn số lượt dùng không được để trống")
    @Min(value = 1, message = "Số lượt dùng tối thiểu là 1")
    private Integer usageLimit;
}