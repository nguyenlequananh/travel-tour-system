package com.travelhub.service;

import com.travelhub.dto.request.CategoryRequest;
import com.travelhub.dto.response.TourCategoryResponse;
import java.util.List;

public interface TourCategoryService {
    List<TourCategoryResponse> getAllCategories();
    TourCategoryResponse getCategoryById(Integer id);
    TourCategoryResponse createCategory(CategoryRequest request);
    TourCategoryResponse updateCategory(Integer id, CategoryRequest request);
    void deleteCategory(Integer id); // Xóa mềm: Chuyển sang INACTIVE
}