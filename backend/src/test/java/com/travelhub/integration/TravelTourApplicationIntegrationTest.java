package com.travelhub.integration;

import com.travelhub.service.BookingService;
import com.travelhub.service.TourService;
import com.travelhub.service.VnPayService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Integration Test (@SpringBootTest) - Kiểm tra nạp toàn bộ ApplicationContext")
class TravelTourApplicationIntegrationTest {

    @Autowired
    private TourService tourService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private VnPayService vnPayService;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    @Test
    @DisplayName("contextLoads - Khởi động toàn bộ Spring Boot Context với H2 profile test thành công")
    void contextLoads_KhiKhoiDongUngDungVoiProfileTest_NapThanhCongToanBoBean() {
        assertNotNull(tourService);
        assertNotNull(bookingService);
        assertNotNull(vnPayService);
    }
}
