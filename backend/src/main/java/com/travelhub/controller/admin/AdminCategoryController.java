package com.travelhub.controller.admin;

import com.travelhub.dto.request.CategoryRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.TourCategoryResponse;
import com.travelhub.service.TourCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final TourCategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TourCategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.<List<TourCategoryResponse>>builder()
                .status(200)
                .message("Lấy danh sách danh mục thành công")
                .data(categoryService.getAllCategories())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourCategoryResponse>> getCategoryById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.<TourCategoryResponse>builder()
                .status(200)
                .message("Lấy thông tin danh mục thành công")
                .data(categoryService.getCategoryById(id))
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TourCategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<TourCategoryResponse>builder()
                .status(201)
                .message("Tạo danh mục mới thành công")
                .data(categoryService.createCategory(request))
                .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TourCategoryResponse>> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.<TourCategoryResponse>builder()
                .status(200)
                .message("Cập nhật danh mục thành công")
                .data(categoryService.updateCategory(id, request))
                .build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("Ẩn danh mục thành công")
                .data(null)
                .build());
    }
}