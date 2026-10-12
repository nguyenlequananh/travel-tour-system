package com.travelhub.repository;
import com.travelhub.entity.Tour;
import com.travelhub.enums.TourStatus;
import com.travelhub.enums.TourType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TourRepository extends JpaRepository<Tour, Long> {
    boolean existsByTourCode(String tourCode);
    boolean existsByTourCodeAndIdNot(String tourCode, Long id);
    Long countByStatus(TourStatus status);
    Page<Tour> findAllByStatus(TourStatus status, Pageable pageable);
    
    // ================= BỘ LỌC ĐA TIÊU CHÍ HOÀN CHỈNH =================
    @Query("SELECT t FROM Tour t WHERE t.status = 'ACTIVE' " +
           "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
           "AND (:tourType IS NULL OR t.tourType = :tourType) " +
           "AND (:departureCity IS NULL OR LOWER(t.departureCity) = LOWER(:departureCity)) " +
           "AND (:keyword IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(t.destinationCity) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Tour> filterTours(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("departureCity") String departureCity,
            @Param("tourType") TourType tourType,
            Pageable pageable
    );
}
