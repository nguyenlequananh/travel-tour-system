package com.travelhub.dto.request;

import com.travelhub.enums.PaymentMethod;
import com.travelhub.enums.PaymentType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class PaymentCreateRequest {
    @NotNull(message = "ID đơn đặt tour không được để trống")
    private Long bookingId;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Giai đoạn thanh toán không được để trống")
    private PaymentType paymentType;

    private String gatewayResponseCode;
}