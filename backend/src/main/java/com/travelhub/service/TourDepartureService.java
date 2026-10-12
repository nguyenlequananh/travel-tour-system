package com.travelhub.service;

import com.travelhub.dto.request.TourDepartureCreateRequest;
import com.travelhub.dto.request.TourDepartureUpdateRequest;
import com.travelhub.dto.response.TourDepartureResponse;
import com.travelhub.enums.DepartureStatus;

import java.util.List;

public interface TourDepartureService {

    // 1. Lấy tất cả các đợt đi của 1 Tour cụ thể
    List<TourDepartureResponse> getDeparturesByTourId(Long tourId);

    // 2. Lấy chi tiết 1 đợt khởi hành theo ID
    TourDepartureResponse getDepartureById(Long id);

    // 3. Mở bán 1 đợt khởi hành mới (Tự động gán availableSeats = maxSeats)
    TourDepartureResponse createDeparture(TourDepartureCreateRequest request);

    // 4. Cập nhật đợt khởi hành (Giá vé, ngày đi, trạng thái)
    TourDepartureResponse updateDeparture(Long id, TourDepartureUpdateRequest request);

    // 5. Đổi trạng thái chuyến đi (vd: Chuyển sang CANCELLED hoặc CLOSED)
    void changeDepartureStatus(Long id, DepartureStatus status);
}