package com.travelhub.integration;

import com.travelhub.dto.response.BatchImportResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import com.travelhub.repository.BookingCancellationRepository;
import com.travelhub.repository.BookingPassagerRepository;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.NotificationRepository;
import com.travelhub.repository.PaymentRepository;
import com.travelhub.repository.TourCategoryRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.BatchImportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("Integration Test (@SpringBootTest) - Chạy Spring Batch 6 Import CSV Đợt khởi hành kèm Fault-Tolerant Skip")
class DepartureBatchImportIntegrationTest {

    @Autowired
    private BatchImportService batchImportService;

    @Autowired
    private TourCategoryRepository tourCategoryRepository;
    @Autowired
    private TourRepository tourRepository;
    @Autowired
    private TourDepartureRepository tourDepartureRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingPassagerRepository bookingPassengerRepository;
    @Autowired
    private BookingCancellationRepository bookingCancellationRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private NotificationRepository notificationRepository;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    private Tour sampleTour;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        bookingCancellationRepository.deleteAll();
        bookingPassengerRepository.deleteAll();
        bookingRepository.deleteAll();
        notificationRepository.deleteAll();
        tourDepartureRepository.deleteAll();
        tourRepository.deleteAll();
        tourCategoryRepository.deleteAll();

        TourCategory category = tourCategoryRepository.save(TourCategory.builder()
                .name("Miền Trung")
                .slug("mien-trung-batch")
                .status(CategoryStatus.ACTIVE)
                .build());

        sampleTour = tourRepository.save(Tour.builder()
                .category(category)
                .tourCode("TOUR-BATCH-01")
                .name("Đà Nẵng 3N2Đ Batch Test")
                .tourType(TourType.DOMESTIC)
                .departureCity("TP.HCM")
                .destinationCity("Đà Nẵng")
                .durationDays(3)
                .durationNights(2)
                .status(TourStatus.ACTIVE)
                .build());
    }

    @Test
    @DisplayName("importDeparturesFromCsv - File CSV gồm 2 dòng hợp lệ + 1 dòng sai mã tour phải nạp 2 dòng, skip 1 dòng và tính đúng ngày về")
    void importDeparturesFromCsv_KhiCoDongHopLeVaDongLoi_NapDongDungVaSkipDongLoi() {
        // GIVEN: 2 dòng hợp lệ + 1 dòng sai mã tour
        LocalDate date1 = LocalDate.now().plusDays(15);
        LocalDate date2 = LocalDate.now().plusDays(25);
        String csvContent = "tourCode,departureDate,adultPrice,childPrice,singleRoomSupplement,maxSeats\n"
                + "TOUR-BATCH-01," + date1 + ",3590000,2590000,600000,30\n"
                + "TOUR-SAI-MA," + date1 + ",3000000,2000000,0,20\n"
                + "TOUR-BATCH-01," + date2 + ",3890000,2790000,600000,25\n";

        MockMultipartFile csvFile = new MockMultipartFile(
                "file",
                "departures.csv",
                "text/csv",
                csvContent.getBytes(StandardCharsets.UTF_8)
        );

        // WHEN
        BatchImportResponse result = batchImportService.importDeparturesFromCsv(csvFile);

        // THEN: Kiểm tra thống kê Spring Batch
        assertEquals("COMPLETED", result.getBatchStatus());
        assertEquals(3L, result.getTotalRead());
        assertEquals(2L, result.getTotalInserted());
        assertEquals(1L, result.getTotalSkipped());
        assertEquals(1, result.getErrors().size());
        assertTrue(result.getErrors().get(0).contains("TOUR-SAI-MA"));

        // Kiểm tra dữ liệu thực tế lưu trong H2 Database
        List<TourDeparture> savedDepartures = tourDepartureRepository.findAllByTourId(sampleTour.getId());
        assertEquals(2, savedDepartures.size());
        assertEquals(date1, savedDepartures.get(0).getDepartureDate());
        assertEquals(date1.plusDays(2), savedDepartures.get(0).getReturnDate());
        assertEquals(date2, savedDepartures.get(1).getDepartureDate());
        assertEquals(date2.plusDays(2), savedDepartures.get(1).getReturnDate());
    }
}
