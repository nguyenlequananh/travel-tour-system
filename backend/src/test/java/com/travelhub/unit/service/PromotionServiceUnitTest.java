package com.travelhub.unit.service;

import com.travelhub.dto.request.PromotionRequest;
import com.travelhub.dto.response.PromotionAdminResponse;
import com.travelhub.entity.Promotion;
import com.travelhub.enums.DiscountType;
import com.travelhub.repository.PromotionRepository;
import com.travelhub.service.impl.PromotionServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Mã khuyến mãi (PromotionServiceImpl)")
class PromotionServiceUnitTest {

    @Mock
    private PromotionRepository promotionRepository;

    @InjectMocks
    private PromotionServiceImpl promotionService;

    @Test
    @DisplayName("createPromotion - Khi mã voucher chưa tồn tại phải lưu thành công và mặc định isActive = true")
    void createPromotion_KhiMaKhuyenMaiMoi_LuuThanhCongVoiTrangThaiActive() {
        // GIVEN
        PromotionRequest request = new PromotionRequest();
        request.setCode("HE2026");
        request.setDiscountType(DiscountType.PERCENTAGE);
        request.setDiscountValue(new BigDecimal("15"));
        request.setMaxDiscountAmount(new BigDecimal("500000"));
        request.setMinOrderAmount(new BigDecimal("2000000"));
        request.setValidFrom(LocalDateTime.now().minusDays(1));
        request.setValidTo(LocalDateTime.now().plusDays(30));
        request.setUsageLimit(100);

        when(promotionRepository.existsByCode("HE2026")).thenReturn(false);
        when(promotionRepository.save(any(Promotion.class))).thenAnswer(inv -> {
            Promotion p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        // WHEN
        PromotionAdminResponse response = promotionService.createPromotion(request);

        // THEN
        assertEquals(1L, response.getId());
        assertEquals("HE2026", response.getCode());
        assertTrue(response.getIsActive());
        verify(promotionRepository, times(1)).save(any(Promotion.class));
    }

    @Test
    @DisplayName("getPromotionByCode - Khi mã giảm giá đã hết hạn phải ném RuntimeException")
    void getPromotionByCode_KhiMaDaHetHan_NemRaRuntimeException() {
        // GIVEN
        Promotion expiredPromo = Promotion.builder()
                .id(2L)
                .code("OLD2025")
                .isActive(true)
                .validFrom(LocalDateTime.now().minusDays(30))
                .validTo(LocalDateTime.now().minusDays(1))
                .usageLimit(10)
                .usedCount(0)
                .build();

        when(promotionRepository.findByCode("OLD2025")).thenReturn(Optional.of(expiredPromo));

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> promotionService.getPromotionByCode("OLD2025"));
        assertTrue(ex.getMessage().contains("không còn hiệu lực"));
    }

    @Test
    @DisplayName("getPromotionByCode - Khi mã giảm giá đã hết lượt sử dụng phải ném RuntimeException")
    void getPromotionByCode_KhiMaDaHetLuotSuDung_NemRaRuntimeException() {
        // GIVEN
        Promotion fullUsedPromo = Promotion.builder()
                .id(3L)
                .code("HOT50")
                .isActive(true)
                .validFrom(LocalDateTime.now().minusDays(5))
                .validTo(LocalDateTime.now().plusDays(10))
                .usageLimit(50)
                .usedCount(50)
                .build();

        when(promotionRepository.findByCode("HOT50")).thenReturn(Optional.of(fullUsedPromo));

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> promotionService.getPromotionByCode("HOT50"));
        assertTrue(ex.getMessage().contains("hết lượt sử dụng"));
    }
}
