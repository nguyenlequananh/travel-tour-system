package com.travelhub.controller.client;

import com.travelhub.dto.request.TourFilterRequest;
import com.travelhub.dto.response.*;
import com.travelhub.service.TourDepartureService;
import com.travelhub.service.TourItineraryService;
import com.travelhub.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tours") // Đường dẫn công khai cho khách hàng
@RequiredArgsConstructor
public class PublicTourController {

    private final TourService tourService;
    private final TourDepartureService departureService;
    private final TourItineraryService itineraryService;

    // 1. Khách xem danh sách tất cả các tour đang mở bán
    // URL: GET http://localhost:8081/api/v1/tours
//     @GetMapping
//     public ResponseEntity<ApiResponse<List<TourAdminResponse>>> getPublicTours(
//             @RequestParam(required = false) String keyword,
//             @RequestParam(required = false) Integer categoryId) {

//         // Lấy tất cả tour và lọc chỉ lấy những tour ACTIVE
//         List<TourAdminResponse> activeTours = tourService.getAllTours().stream()
//                 .filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus().toString()))
//                 .filter(t -> keyword == null || t.getName().toLowerCase().contains(keyword.toLowerCase()))
//                 .filter(t -> categoryId == null || categoryId.equals(t.getCategoryId()))
//                 .toList();

//         return ResponseEntity.ok(ApiResponse.<List<TourAdminResponse>>builder()
//                 .status(200)
//                 .message("Lấy danh sách tour thành công")
//                 .data(activeTours)
//                 .build());
//     }

    // 2. Khách bấm vào xem chi tiết 1 Tour (Trả về trọn gói: Tour + Lịch đi + Lịch trình)
    // URL: GET http://localhost:8081/api/v1/tours/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourDetailResponse>> getTourDetail(@PathVariable Long id) {
        // Tái sử dụng 3 hàm Service CŨ đã viết sẵn:
        TourAdminResponse tour = tourService.getTourById(id);
        List<TourDepartureResponse> departures = departureService.getDeparturesByTourId(id);
        List<TourItineraryResponse> itineraries = itineraryService.getItinerariesByTourId(id);

        // Đóng gói vào TourDetailResponse  
        TourDetailResponse detail = TourDetailResponse.builder()
                .tour(tour)
                .departures(departures)
                .itineraries(itineraries)
                .build();

        return ResponseEntity.ok(ApiResponse.<TourDetailResponse>builder()
                .status(200)
                .message("Lấy chi tiết tour thành công")
                .data(detail)
                .build());
    }
     @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TourAdminResponse>>> getPublicTours(
            TourFilterRequest request) {

        // Controller siêu mỏng: Ủy quyền 100% cho Service xử lý
        PageResponse<TourAdminResponse> response = tourService.getToursWithFilter(request);

        return ResponseEntity.ok(ApiResponse.<PageResponse<TourAdminResponse>>builder()
                .status(200)
                .message("Lấy danh sách tour thành công")
                .data(response)
                .build());
    }
}