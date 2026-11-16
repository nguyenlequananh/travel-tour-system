package com.travelhub.controller.admin;

import com.travelhub.dto.request.TourImageRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourImageResponse;
import com.travelhub.service.TourImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/images")
@RequiredArgsConstructor
public class AdminTourImageController {

    private final TourImageService imageService;

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<ApiResponse<List<TourImageResponse>>> getImagesByTourId(@PathVariable Long tourId) {
        return ResponseEntity.ok(ApiResponse.<List<TourImageResponse>>builder()
                .status(200)
                .message("Lấy danh sách hình ảnh thành công")
                .data(imageService.getImagesByTourId(tourId))
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourImageResponse>> getImageById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TourImageResponse>builder()
                .status(200)
                .message("Lấy thông tin hình ảnh thành công")
                .data(imageService.getImageById(id))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TourImageResponse>> createImage(
            @Valid @RequestBody TourImageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TourImageResponse>builder()
                .status(201)
                .message("Thêm hình ảnh mới thành công")
                .data(imageService.createImage(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourImageResponse>> updateImage(
            @PathVariable Long id,
            @Valid @RequestBody TourImageRequest request) {
        return ResponseEntity.ok(ApiResponse.<TourImageResponse>builder()
                .status(200)
                .message("Cập nhật hình ảnh thành công")
                .data(imageService.updateImage(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id) {
        imageService.deleteImage(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Xóa hình ảnh thành công")
                .data(null)
                .build());
    }
}