package com.travelhub.mock;

import com.travelhub.dto.request.ReviewRequest;
import com.travelhub.dto.response.ReviewResponse;
import com.travelhub.entity.Review;
import com.travelhub.entity.Tour;
import com.travelhub.entity.User;
import com.travelhub.repository.ReviewRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private User mockUser;
    private Tour mockTour;
    private Review mockReview;

    @BeforeEach
    public void setUp() {
        mockUser = User.builder().id(1L).fullName("Khách Review").build();
        mockTour = Tour.builder().id(1L).name("Tour Đà Nẵng").tourCode("TO-DN").build();
        mockReview = Review.builder()
                .id(1L)
                .user(mockUser)
                .tour(mockTour)
                .rating(5)
                .comment("Tour rất tuyệt vời!")
                .build();
    }

    // 1. TEST GỬI ĐÁNH GIÁ MỚI THÀNH CÔNG
    @Test
    public void testCreateReview_Success() {
        ReviewRequest request = ReviewRequest.builder()
                .tourId(1L)
                .rating(5)
                .comment("Tour rất tuyệt vời!")
                .build();

        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        Mockito.when(tourRepository.findById(1L)).thenReturn(Optional.of(mockTour));
        Mockito.when(reviewRepository.save(Mockito.any(Review.class))).thenReturn(mockReview);

        ReviewResponse response = reviewService.createReview(1L, request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(5, response.getRating());
        Assertions.assertEquals("Tour rất tuyệt vời!", response.getComment());
        Assertions.assertEquals("Khách Review", response.getUserName());
    }

    // 2. TEST TÍNH ĐIỂM SAO TRUNG BÌNH CỦA TOUR
    @Test
    public void testGetAverageRating_Success() {
        Mockito.when(reviewRepository.getAverageRatingByTourId(1L)).thenReturn(4.8);

        Double avgRating = reviewService.getAverageRating(1L);

        Assertions.assertNotNull(avgRating);
        Assertions.assertEquals(4.8, avgRating);
    }
}