package com.travelhub.service;

import com.travelhub.dto.request.CustomTourCreateRequest;
import com.travelhub.dto.response.CustomTourResponse;
import com.travelhub.enums.CustomTourStatus;

import java.util.List;

public interface CustomTourService {
    // Phía Khách hàng (Client gửi form)
    CustomTourResponse createCustomTourRequest(CustomTourCreateRequest request);

    // Phía Quản trị viên (Admin)
    List<CustomTourResponse> getAllRequests();
    CustomTourResponse getRequestById(Long id);
    CustomTourResponse updateStatus(Long id, CustomTourStatus status);
}