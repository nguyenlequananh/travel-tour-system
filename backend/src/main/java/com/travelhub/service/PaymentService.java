package com.travelhub.service;

import com.travelhub.dto.request.PaymentCreateRequest;
import com.travelhub.dto.request.PaymentFilterRequest;
import com.travelhub.dto.response.PageResponse;
import com.travelhub.dto.response.PaymentResponse;
import java.util.List;

public interface PaymentService {
    
    PaymentResponse processPayment(PaymentCreateRequest request);
    PaymentResponse getPaymentById(Long id);
    List<PaymentResponse> getPaymentsByBookingId(Long bookingId);
    List<PaymentResponse> getAllPayments();
    PageResponse<PaymentResponse> getPaymentsWithFilter(PaymentFilterRequest request);
}