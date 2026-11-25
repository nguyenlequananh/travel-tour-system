package com.travelhub.slice.repository;

import com.travelhub.entity.Tour;
import com.travelhub.entity.TourCategory;
import com.travelhub.enums.CategoryStatus;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import com.travelhub.repository.TourRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.jdbc.JdbcTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("Slice Test (@DataJpaTest) - Kiểm thử tầng Repository với H2 & Auto-Rollback (TourRepository)")
class TourRepositorySliceTest {

    @Autowired
    private TourRepository tourRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @Order(1)
    @DisplayName("save & findById - Dùng flush() và clear() để chứng minh truy vấn đọc dữ liệu thật từ DB, không đọc L1 Cache")
    void saveVaFindById_KhiFlushVaClear_DocDuLieuThatTuDatabaseKhongQuaL1Cache() {
        // GIVEN
        TourCategory category = entityManager.persist(TourCategory.builder()
                .name("Biển đảo")
                .slug("bien-dao-slice")
                .status(CategoryStatus.ACTIVE)
                .build());

        Tour tour = Tour.builder()
                .category(category)
                .tourCode("TO-SLICE-01")
                .name("Tour Phú Quốc Slice Test")
                .tourType(TourType.DOMESTIC)
                .departureCity("TP.HCM")
                .destinationCity("Phú Quốc")
                .durationDays(3)
                .durationNights(2)
                .status(TourStatus.ACTIVE)
                .build();

        // WHEN: Lưu xuống DB, ép bắn INSERT và xóa sạch Persistence Context (L1 Cache)
        Tour saved = tourRepository.save(tour);
        entityManager.flush();
        entityManager.clear();

        // THEN: Truy vấn SELECT thật xuống H2 Database
        Tour found = tourRepository.findById(saved.getId()).orElseThrow();
        assertEquals("TO-SLICE-01", found.getTourCode());
        assertEquals("Tour Phú Quốc Slice Test", found.getName());
        assertEquals(1, JdbcTestUtils.countRowsInTable(jdbcTemplate, "tours"));
    }

    @Test
    @Order(2)
    @DisplayName("Auto-Rollback - Sau khi test @Order(1) kết thúc, bảng tours phải trống (0 dòng) không bị rò rỉ dữ liệu")
    void autoRollback_SauTestTruocDo_BangToursPhaiTrongKhongBiRoRiDuLieu() {
        // WHEN
        int rowCount = JdbcTestUtils.countRowsInTable(jdbcTemplate, "tours");

        // THEN: Chứng minh cơ chế Auto-Rollback của @DataJpaTest đã dọn sạch dữ liệu từ test trước
        assertEquals(0, rowCount, "Bảng tours phải trống nhờ cơ chế Auto-Rollback của @DataJpaTest");
    }

    @Test
    @Order(3)
    @DisplayName("filterTours - Câu @Query JPQL đa tiêu chí phải lọc đúng theo từ khóa, thành phố và chỉ trả về Tour ACTIVE")
    void filterTours_KhiLocTheoTuKhoaVaThanhPho_ChiTraVeTourActivePhuHop() {
        // GIVEN
        TourCategory cat = entityManager.persist(TourCategory.builder()
                .name("Miền Trung")
                .slug("mien-trung-slice")
                .status(CategoryStatus.ACTIVE)
                .build());

        entityManager.persist(Tour.builder()
                .category(cat).tourCode("TO-DN-ACTIVE").name("Khám phá Đà Nẵng 3N2Đ")
                .tourType(TourType.DOMESTIC).departureCity("TP.HCM").destinationCity("Đà Nẵng")
                .durationDays(3).durationNights(2).status(TourStatus.ACTIVE).build());

        entityManager.persist(Tour.builder()
                .category(cat).tourCode("TO-DN-INACTIVE").name("Đà Nẵng Ngưng Bán")
                .tourType(TourType.DOMESTIC).departureCity("TP.HCM").destinationCity("Đà Nẵng")
                .durationDays(3).durationNights(2).status(TourStatus.INACTIVE).build());

        entityManager.persist(Tour.builder()
                .category(cat).tourCode("TO-HN-ACTIVE").name("Hà Nội Mùa Thu")
                .tourType(TourType.DOMESTIC).departureCity("Hà Nội").destinationCity("Hà Nội")
                .durationDays(2).durationNights(1).status(TourStatus.ACTIVE).build());

        entityManager.flush();
        entityManager.clear();

        // WHEN
        Page<Tour> result = tourRepository.filterTours(
                "đà nẵng",
                cat.getId(),
                "tp.hcm",
                TourType.DOMESTIC,
                PageRequest.of(0, 10)
        );

        // THEN: Chỉ khớp đúng 1 tour ACTIVE tại Đà Nẵng xuất phát từ TP.HCM
        assertEquals(1, result.getTotalElements());
        assertEquals("TO-DN-ACTIVE", result.getContent().get(0).getTourCode());
    }
}
