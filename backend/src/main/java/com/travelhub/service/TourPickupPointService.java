package com.travelhub.service;

import com.travelhub.dto.request.TourPickupPointRequest;
import com.travelhub.dto.response.TourPickupPointResponse;

import java.util.List;

public interface TourPickupPointService {

    // 1. Lấy danh sách điểm đón của 1 đợt khởi hành cụ thể
    List<TourPickupPointResponse> getPickupPointsByDepartureId(Long departureId);

    // 2. Lấy chi tiết 1 điểm đón theo ID
    TourPickupPointResponse getPickupPointById(Long id);

    // 3. Thêm mới 1 điểm đón cho đợt khởi hành
    TourPickupPointResponse createPickupPoint(TourPickupPointRequest request);

    // 4. Cập nhật thông tin điểm đón
    TourPickupPointResponse updatePickupPoint(Long id, TourPickupPointRequest request);

    // 5. Xóa 1 điểm đón
    void deletePickupPoint(Long id);
}