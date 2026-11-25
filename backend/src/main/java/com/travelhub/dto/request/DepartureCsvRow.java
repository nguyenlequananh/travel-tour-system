package com.travelhub.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO hứng dữ liệu thô từng dòng từ file CSV khi chạy Spring Batch Import Đợt khởi hành.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartureCsvRow {
    private String tourCode;
    private String departureDate;
    private String adultPrice;
    private String childPrice;
    private String singleRoomSupplement;
    private String maxSeats;
}
