package com.travelhub.service.impl;
import com.travelhub.dto.request.PromotionRequest;
import com.travelhub.entity.Promotion;
import com.travelhub.repository.PromotionRepository;
import com.travelhub.service.PromotionService;
import org.springframework.transaction.annotation.Transactional; // <-- ĐÚNG LÀ CÁI NÀYimport lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import com.travelhub.dto.response.PromotionAdminResponse;
@RequiredArgsConstructor
@Service
public class PromotionServiceImpl implements PromotionService {
    private final PromotionRepository promotionRepository;
    
    @Override
    @Transactional( rollbackFor = Exception.class)
    public PromotionAdminResponse createPromotion(PromotionRequest request) {
        if(promotionRepository.existsByCode(request.getCode())){
            throw new RuntimeException("Mã giảm giá này đã tồn tại!");
        }
        Promotion promotion = Promotion.builder()
            .code(request.getCode())
            .discountType(request.getDiscountType())
            .discountValue(request.getDiscountValue())
            .maxDiscountAmount(request.getMaxDiscountAmount())
            .minOrderAmount(request.getMinOrderAmount())
            .validFrom(request.getValidFrom())
            .validTo(request.getValidTo())
            .usageLimit(request.getUsageLimit())
            .isActive(true)
            .build();
        return PromotionAdminResponse.fromEntity(promotionRepository.save(promotion));
    }
    @Override 
    @Transactional (rollbackFor = Exception.class)
    public void deletePromotion(Long id) {
        Promotion promotion = findPromotionEntityById(id);
        promotion.setIsActive(false);
        promotionRepository.save(promotion);
    }      
    @Override
    @Transactional (readOnly = true)
    public List<PromotionAdminResponse> getAllPromotions() {
        return promotionRepository.findAll()
        .stream()
        .map(PromotionAdminResponse::fromEntity)
        .toList();
    }
    @Override
    @Transactional (readOnly = true)
    public PromotionAdminResponse getPromotionById(Long id) {
        return PromotionAdminResponse.fromEntity(findPromotionEntityById(id));          
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public PromotionAdminResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = findPromotionEntityById(id);
        if(promotion.getDiscountType() != request.getDiscountType()){
            throw new RuntimeException("Loại giảm giá không thể thay đổi!");
        }
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setValidFrom(request.getValidFrom());
        promotion.setValidTo(request.getValidTo());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setIsActive(true);
        return PromotionAdminResponse.fromEntity(promotionRepository.save(promotion));
    }
    private Promotion findPromotionEntityById(Long id) {
        return promotionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá với ID: " + id));
    }
    @Override
    @Transactional(readOnly = true)
    public PromotionAdminResponse getPromotionByCode(String code) {
        Promotion promotion = promotionRepository.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));
        if(!promotion.getIsActive()){
            throw new RuntimeException("Mã giảm giá này đã bị vô hiệu hóa!");
        }
        LocalDateTime now = LocalDateTime.now();
        
        if (now.isBefore(promotion.getValidFrom()) || now.isAfter(promotion.getValidTo())) {
            throw new RuntimeException("Mã giảm giá này không còn hiệu lực!");
        }

        if (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit()  ) {
            throw new RuntimeException("Mã giảm giá này đã hết lượt sử dụng!");
        }
        return PromotionAdminResponse.fromEntity(promotion);
    }
}
