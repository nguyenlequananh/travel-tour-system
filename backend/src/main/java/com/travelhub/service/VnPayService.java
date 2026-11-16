package com.travelhub.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface VnPayService {
    // 1. Tạo đường dẫn sang cổng VNPay
    String createPaymentUrl(Long bookingId, HttpServletRequest request);

    // 2. Xử lý khi khách thanh toán xong từ VNPay quay trở về
    boolean processPaymentCallback(Map<String, String> queryParams);
}   