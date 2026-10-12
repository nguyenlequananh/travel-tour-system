package com.travelhub.service;
import com.travelhub.dto.request.PromotionRequest;
import com.travelhub.entity.Promotion;
import java.util.List;
import com.travelhub.dto.response.PromotionAdminResponse;
public interface PromotionService {
    List<PromotionAdminResponse> getAllPromotions();
    PromotionAdminResponse getPromotionById(Long id);
    PromotionAdminResponse createPromotion(PromotionRequest request);
    PromotionAdminResponse updatePromotion(Long id, PromotionRequest request);
    void deletePromotion(Long id);
    PromotionAdminResponse getPromotionByCode(String code);
}
