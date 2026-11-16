package com.travelhub.service;

import com.travelhub.dto.request.CancellationFilterRequest;
import com.travelhub.dto.request.CancellationRequest;
import com.travelhub.dto.response.CancellationResponse;
import com.travelhub.dto.response.PageResponse;

import java.util.List;

public interface BookingCancellationService {

    CancellationResponse requestCancellation(CancellationRequest request);

    CancellationResponse confirmRefund(Long cancellationId);

    CancellationResponse getCancellationByBookingId(Long bookingId);

    List<CancellationResponse> getAllCancellations();
    PageResponse<CancellationResponse> getCancellationsWithFilter(CancellationFilterRequest request);
}