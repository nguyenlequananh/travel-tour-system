package com.travelhub.service;

import com.travelhub.dto.request.TourItineraryRequest;
import com.travelhub.dto.response.TourItineraryResponse;
import java.util.List;

public interface TourItineraryService {

    // 1. GET ALL: Lấy toàn bộ lịch trình của một Tour (xếp Ngày 1 -> 2 -> 3)
    List<TourItineraryResponse> getItinerariesByTourId(Long tourId);

    // 2. GET BY ID: Lấy chi tiết lịch trình của 1 ngày cụ thể
    TourItineraryResponse getItineraryById(Long id);

    // 3. CREATE: Thêm lịch trình 1 ngày mới
    TourItineraryResponse createItinerary(TourItineraryRequest request);

    // 4. UPDATE: Chỉnh sửa lịch trình của 1 ngày
    TourItineraryResponse updateItinerary(Long id, TourItineraryRequest request);

    // 5. DELETE: Xóa 1 ngày lịch trình (Xóa cứng)
    void deleteItinerary(Long id);
}