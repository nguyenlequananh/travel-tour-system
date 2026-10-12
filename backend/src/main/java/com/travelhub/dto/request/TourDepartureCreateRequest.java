package com.travelhub.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class TourDepartureCreateRequest {

    @NotNull(message = "ID của Tour không được để trống")
    private Long tourId;

    @NotNull(message = "Ngày khởi hành không được để trống")
    @FutureOrPresent(message = "Ngày khởi hành phải ở hiện tại hoặc tương lai")
    private LocalDate departureDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate returnDate;

    @NotNull(message = "Giá người lớn không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá người lớn phải lớn hơn 0")
    private BigDecimal adultPrice;

    @NotNull(message = "Giá trẻ em không được để trống")
    @DecimalMin(value = "0.0", message = "Giá trẻ em không được âm")
    private BigDecimal childPrice;

    private BigDecimal singleRoomSupplement = BigDecimal.ZERO;

    @NotNull(message = "Tổng số chỗ mở bán không được để trống")
    @Min(value = 1, message = "Tổng số chỗ mở bán tối thiểu là 1")
    private Integer maxSeats;
}