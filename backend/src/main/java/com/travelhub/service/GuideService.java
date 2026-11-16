package com.travelhub.service;

import com.travelhub.dto.response.GuideDepartureResponse;
import com.travelhub.dto.response.GuidePassengerResponse;

import java.util.List;

public interface GuideService {

    // 1. HDV xem danh sách các chuyến đi mà mình được phân công phụ trách
    List<GuideDepartureResponse> getMyAssignedDepartures(Long guideId);

    // 2. HDV xem danh sách toàn bộ đoàn khách (kèm điểm đón và SĐT liên hệ)
    List<GuidePassengerResponse> getDeparturePassengers(Long departureId, Long guideId);
}