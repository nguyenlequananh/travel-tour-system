package com.travelhub.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TourDetailResponse {
    // 1. Thông tin chung của Tour (Tên, ảnh bìa, tóm tắt, mô tả)
    private TourAdminResponse tour;

    // 2. Danh sách các ngày khởi hành và giá vé của từng đợt
    private List<TourDepartureResponse> departures;

    // 3. Lịch trình chi tiết từng ngày (Ngày 1, Ngày 2, Ngày 3...)
    private List<TourItineraryResponse> itineraries;
}