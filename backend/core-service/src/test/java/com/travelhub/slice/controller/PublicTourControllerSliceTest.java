package com.travelhub.slice.controller;

import com.travelhub.controller.client.PublicTourController;
import com.travelhub.dto.common.PageResponse;
import com.travelhub.dto.filter.TourFilterRequest;
import com.travelhub.dto.response.TourAdminResponse;
import com.travelhub.dto.response.TourDetailResponse;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;
import com.travelhub.security.JwtAuthenticationFilter;
import com.travelhub.service.TourService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicTourController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Slice Test (@WebMvcTest) - Kiểm thử tầng Controller Công khai (PublicTourController)")
class PublicTourControllerSliceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TourService tourService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/v1/tours - Phải trả về HTTP 200 và danh sách tour phân trang đúng chuẩn JSON")
    void getPublicTours_KhiGoiGetApi_TraVe200VaDanhSachTourDangJson() throws Exception {
        // GIVEN
        TourAdminResponse item = TourAdminResponse.builder()
                .id(1L)
                .tourCode("TO-PQ-01")
                .name("Phú Quốc 3N2Đ")
                .tourType(TourType.DOMESTIC)
                .departureCity("TP.HCM")
                .destinationCity("Phú Quốc")
                .status(TourStatus.ACTIVE)
                .build();

        PageResponse<TourAdminResponse> pageResponse = PageResponse.<TourAdminResponse>builder()
                .data(List.of(item))
                .pageNumber(0)
                .pageSize(10)
                .totalElements(1L)
                .totalPages(1)
                .isLast(true)
                .build();

        when(tourService.getToursWithFilter(any(TourFilterRequest.class))).thenReturn(pageResponse);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/tours")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.data[0].tourCode").value("TO-PQ-01"))
                .andExpect(jsonPath("$.data.data[0].name").value("Phú Quốc 3N2Đ"));
    }

    @Test
    @DisplayName("GET /api/v1/tours/{id} - Khi tour tồn tại phải trả về HTTP 200 và dữ liệu chi tiết tour")
    void getTourDetail_KhiTourTonTai_TraVe200VaThongTinChiTietTour() throws Exception {
        // GIVEN
        TourAdminResponse tourInfo = TourAdminResponse.builder()
                .id(10L)
                .tourCode("TO-DN-01")
                .name("Đà Nẵng - Bà Nà Hills 3N2Đ")
                .departureCity("TP.HCM")
                .destinationCity("Đà Nẵng")
                .build();

        TourDetailResponse detail = TourDetailResponse.builder()
                .tour(tourInfo)
                .departures(List.of())
                .itineraries(List.of())
                .images(List.of())
                .policies(List.of())
                .build();

        when(tourService.getTourDetailById(10L)).thenReturn(detail);

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/tours/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.tour.id").value(10))
                .andExpect(jsonPath("$.data.tour.tourCode").value("TO-DN-01"));
    }

    @Test
    @DisplayName("GET /api/v1/tours/{id} - Khi Service ném RuntimeException phải được GlobalExceptionHandler chuyển thành HTTP 400")
    void getTourDetail_KhiServiceNemRuntimeException_GlobalExceptionHandlerTraVe400() throws Exception {
        // GIVEN
        when(tourService.getTourDetailById(999L))
                .thenThrow(new RuntimeException("Không tìm thấy tour với ID: 999"));

        // WHEN & THEN
        mockMvc.perform(get("/api/v1/tours/999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Không tìm thấy tour với ID: 999"));
    }
}
