package com.travelhub.controller.client;

import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.PromotionAdminResponse;
import com.travelhub.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
public class PublicPromotionController {

    private final PromotionService promotionService;

    // Khách kiểm tra mã giảm giá
    // URL: GET http://localhost:8081/api/v1/promotions/check?code=HE2024
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<PromotionAdminResponse>> checkPromotion(
            @RequestParam String code) {

        // Controller siêu mỏng: Chỉ ủy quyền cho Service xử lý đúng 1 dòng!
        PromotionAdminResponse response = promotionService.getPromotionByCode(code);

        return ResponseEntity.ok(ApiResponse.<PromotionAdminResponse>builder()
                .status(200)
                .message("Áp dụng mã giảm giá thành công!")
                .data(response)
                .build());
    }
}