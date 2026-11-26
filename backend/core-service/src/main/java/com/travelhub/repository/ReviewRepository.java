package com.travelhub.repository;

import com.travelhub.entity.Review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 1. Lấy tất cả đánh giá của 1 Tour cụ thể
    List<Review> findAllByTourIdOrderByCreatedAtDesc(Long tourId);

    // 2. Tính điểm sao trung bình của 1 Tour (ví dụ: 4.8 sao)
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.tour.id = :tourId")
    Double getAverageRatingByTourId(@Param("tourId") Long tourId);

    // 3. Đếm số lượt đánh giá của 1 Tour
    Long countByTourId(Long tourId);
    @Query("SELECT r FROM Review r WHERE " +
           "(:tourId IS NULL OR r.tour.id = :tourId) AND " +
           "(:rating IS NULL OR r.rating = :rating) AND " +
           "(:keyword IS NULL OR " +
           "   LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Review> filterReviews(
            @Param("keyword") String keyword,
            @Param("rating") Integer rating,
            @Param("tourId") Long tourId,
            Pageable pageable
    );
}