package com.travelhub.mock;

import com.travelhub.dto.request.PromotionRequest;
import com.travelhub.dto.response.PromotionAdminResponse;
import com.travelhub.entity.Promotion;
import com.travelhub.enums.DiscountType;
import com.travelhub.repository.PromotionRepository;
import com.travelhub.service.impl.PromotionServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class PromotionServiceTest {

    @Mock
    private PromotionRepository promotionRepository;

    @InjectMocks
    private PromotionServiceImpl promotionService;

    private Promotion mockPromotion;

    @BeforeEach
    public void setUp() {
        mockPromotion = Promotion.builder()
                .id(1L)
                .code("HE2026")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.valueOf(10))
                .minOrderAmount(BigDecimal.valueOf(1000000))
                .validFrom(LocalDateTime.now().minusDays(1))
                .validTo(LocalDateTime.now().plusDays(10))
                .usageLimit(50)
                .usedCount(5)
                .isActive(true)
                .build();
    }

    // 1. TEST CHECK MÃ GIẢM GIÁ HỢP LỆ (SUCCESS)
    @Test
    public void testGetPromotionByCode_Success() {
        Mockito.when(promotionRepository.findByCode("HE2026")).thenReturn(Optional.of(mockPromotion));

        PromotionAdminResponse response = promotionService.getPromotionByCode("HE2026");

        Assertions.assertNotNull(response);
        Assertions.assertEquals("HE2026", response.getCode());
        Assertions.assertEquals(45, response.getRemainingUsage()); // 50 - 5 = 45 lượt còn lại
    }

    // 2. TEST CHECK MÃ GIẢM GIÁ HẾT HẠN HOẶC KHÔNG TỒN TẠI (THẤT BẠI)
    @Test
    public void testGetPromotionByCode_Expired_ThrowsException() {
        mockPromotion.setValidTo(LocalDateTime.now().minusDays(1)); // Đã hết hạn hôm qua

        Mockito.when(promotionRepository.findByCode("HE2026")).thenReturn(Optional.of(mockPromotion));

        Exception exception = Assertions.assertThrows(RuntimeException.class, () -> {
            promotionService.getPromotionByCode("HE2026");
        });

        Assertions.assertTrue(exception.getMessage().contains("không còn hiệu lực"));
    }

    // 3. TEST TẠO MỚI MÃ GIẢM GIÁ (SUCCESS)
    @Test
    public void testCreatePromotion_Success() {
        PromotionRequest request = new PromotionRequest();
        request.setCode("TET2027");
        request.setDiscountType(DiscountType.FIXED_AMOUNT);
        request.setDiscountValue(BigDecimal.valueOf(200000));
        request.setMinOrderAmount(BigDecimal.valueOf(2000000));
        request.setValidFrom(LocalDateTime.now());
        request.setValidTo(LocalDateTime.now().plusMonths(1));
        request.setUsageLimit(100);

        Mockito.when(promotionRepository.existsByCode("TET2027")).thenReturn(false);
        Mockito.when(promotionRepository.save(Mockito.any(Promotion.class))).thenReturn(mockPromotion);

        PromotionAdminResponse response = promotionService.createPromotion(request);

        Assertions.assertNotNull(response);
        Mockito.verify(promotionRepository, Mockito.times(1)).save(Mockito.any(Promotion.class));
    }
}