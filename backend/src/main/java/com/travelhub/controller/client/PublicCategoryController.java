package com.travelhub.controller.client;

import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourCategoryResponse;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.service.TourCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class PublicCategoryController {

    private final TourCategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TourCategoryResponse>>> getPublicCategories() {
        // Chỉ lấy những danh mục đang ACTIVE hiển thị lên Menu
        List<TourCategoryResponse> activeList = categoryService.getAllCategories().stream()
                .filter(c -> c.getStatus() == CategoryStatus.ACTIVE)
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<TourCategoryResponse>>builder()
                .status(200)
                .message("Lấy danh mục thành công")
                .data(activeList)
                .build());
    }
}