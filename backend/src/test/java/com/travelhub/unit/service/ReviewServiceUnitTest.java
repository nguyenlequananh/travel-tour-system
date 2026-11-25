package com.travelhub.unit.service;

import com.travelhub.dto.request.ReviewRequest;
import com.travelhub.dto.response.ReviewResponse;
import com.travelhub.entity.Review;
import com.travelhub.entity.Tour;
import com.travelhub.entity.User;
import com.travelhub.repository.ReviewRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Đánh giá Tour (ReviewServiceImpl)")
class ReviewServiceUnitTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    @Test
    @DisplayName("createReview - Khi User và Tour tồn tại phải lưu đánh giá và cắt khoảng trắng thừa ở comment")
    void createReview_KhiUserVaTourTonTai_LuuDanhGiaVaTrimNoiDung() {
        // GIVEN
        User user = User.builder().id(1L).fullName("Nguyễn Khách").build();
        Tour tour = Tour.builder().id(10L).name("Tour Đà Nẵng").build();
        ReviewRequest request = ReviewRequest.builder()
                .tourId(10L)
                .rating(5)
                .comment("   Hướng dẫn viên rất nhiệt tình!   ")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(88L);
            return r;
        });

        // WHEN
        ReviewResponse response = reviewService.createReview(1L, request);

        // THEN
        assertEquals(88L, response.getId());
        assertEquals(5, response.getRating());
        assertEquals("Hướng dẫn viên rất nhiệt tình!", response.getComment());
        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    @DisplayName("createReview - Khi không tìm thấy Tour phải ném RuntimeException và không lưu Review")
    void createReview_KhiTourKhongTonTai_NemRaRuntimeException() {
        // GIVEN
        User user = User.builder().id(1L).fullName("Nguyễn Khách").build();
        ReviewRequest request = ReviewRequest.builder().tourId(999L).rating(5).comment("Tuyệt vời").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tourRepository.findById(999L)).thenReturn(Optional.empty());

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> reviewService.createReview(1L, request));
        assertTrue(ex.getMessage().contains("Không tìm thấy tour"));
        verify(reviewRepository, never()).save(any());
    }
}
