package com.travelhub.controller.admin;

import com.travelhub.dto.request.PromotionRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.PromotionAdminResponse;
import com.travelhub.service.PromotionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 1. Đánh dấu đây là Controller chuyên trả về JSON (dành cho React)
@RequestMapping("/api/v1/admin/promotions") // 2. Đường dẫn tiền tố chung cho tất cả các API bên dưới
@RequiredArgsConstructor // 3. Tự động tiêm PromotionService vào
public class AdminPromotionController {
    public final PromotionService promotionService;
    
    @GetMapping 
    public ResponseEntity<ApiResponse<List<PromotionAdminResponse>>> getAllPromotions(){
        ApiResponse<List<PromotionAdminResponse>> response =  ApiResponse.<List<PromotionAdminResponse>>builder()   
                .status(200)
                .message("Lấy danh sách giảm giá thành công")
                .data(promotionService.getAllPromotions())
                .build();
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionAdminResponse>> getPromotionById(@PathVariable Long id){
        ApiResponse<PromotionAdminResponse> response = ApiResponse.<PromotionAdminResponse>builder()
                .status(200)
                .message("Lấy giảm giá thành công")
                .data(promotionService.getPromotionById(id))
                .build();
        return ResponseEntity.ok(response);
    }
    @PostMapping
    public ResponseEntity<ApiResponse<PromotionAdminResponse>> createPromotion(@Valid @RequestBody PromotionRequest request){
        ApiResponse<PromotionAdminResponse> response = ApiResponse.<PromotionAdminResponse>builder()
                .status(201)
                .message("")
                .data(promotionService.createPromotion(request))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping ("/{id}")
    public ResponseEntity<ApiResponse<PromotionAdminResponse>> updatePromotion(@PathVariable Long id, @Valid @RequestBody PromotionRequest request){
        ApiResponse<PromotionAdminResponse> response = ApiResponse.<PromotionAdminResponse>builder()
                .status(200)
                .message("Sửa giảm giá thành công")
                .data( promotionService.updatePromotion(id, request))
                .build();
        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable Long id){
        promotionService.deletePromotion(id);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa giảm giá thành công")
                .data(null)
                .build();
        return ResponseEntity.ok(response);
    }
}
