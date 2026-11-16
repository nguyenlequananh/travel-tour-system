package com.travelhub.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TourDetailResponse {

    // 1. Thông tin chung của Tour (Tên, ảnh bìa, tóm tắt, mô tả, thành phố đi/đến, thời gian)
    private TourAdminResponse tour;

    // 2. Danh sách các đợt khởi hành đang mở bán kèm giá vé (Người lớn, trẻ em, số ghế trống)
    private List<TourDepartureResponse> departures;

    // 3. Lịch trình chi tiết từng ngày (Ngày 1, Ngày 2, Bữa ăn, Khách sạn)
    private List<TourItineraryResponse> itineraries;

    // 4. Bộ sưu tập album ảnh phụ của tour (Dùng làm Slider / Gallery ảnh cho khách xem)
    private List<TourImageResponse> images;

    // 5. Danh sách các chính sách và điều khoản (Bao gồm, Không bao gồm, Lưu ý chung)
    private List<TourPolicyResponse> policies;
}