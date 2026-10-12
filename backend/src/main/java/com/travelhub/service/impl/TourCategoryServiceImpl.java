package com.travelhub.service.impl;

import com.travelhub.dto.request.CategoryRequest;
import com.travelhub.dto.response.TourCategoryResponse;
import com.travelhub.entity.TourCategory;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.repository.TourCategoryRepository;
import com.travelhub.service.TourCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TourCategoryServiceImpl implements TourCategoryService {

    private final TourCategoryRepository categoryRepository;

    @Override
    public List<TourCategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(TourCategoryResponse::fromEntity)
                .toList();
    }

    @Override
    public TourCategoryResponse getCategoryById(Integer id) {
        return TourCategoryResponse.fromEntity(findCategoryEntityById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourCategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new RuntimeException("Tên danh mục này đã tồn tại!");
        }
        if (categoryRepository.existsBySlug(request.getSlug().toLowerCase().trim())) {
            throw new RuntimeException("Slug này đã tồn tại!");
        }

        TourCategory category = TourCategory.builder()
                .name(request.getName().trim())
                .slug(request.getSlug().toLowerCase().trim())
                .description(request.getDescription())
                .status(CategoryStatus.ACTIVE) // Mặc định mở hoạt động
                .build();

        return TourCategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourCategoryResponse updateCategory(Integer id, CategoryRequest request) {
        TourCategory category = findCategoryEntityById(id);

        category.setName(request.getName().trim());
        category.setSlug(request.getSlug().toLowerCase().trim());
        category.setDescription(request.getDescription());

        return TourCategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Integer id) {
        TourCategory category = findCategoryEntityById(id);
        
        // XÓA MỀM (SOFT DELETE): Chỉ chuyển trạng thái sang INACTIVE
        category.setStatus(CategoryStatus.INACTIVE);
        categoryRepository.save(category);
    }

    // Hàm phụ trợ nội bộ lấy Entity
    private TourCategory findCategoryEntityById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
    }
}