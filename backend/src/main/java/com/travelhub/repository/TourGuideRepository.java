package com.travelhub.repository;

import com.travelhub.entity.TourGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourGuideRepository extends JpaRepository<TourGuide, Long> {
    List<TourGuide> findAllByDepartureId(Long departureId);

    boolean existsByDepartureIdAndGuideId(Long departureId, Long guideId);

    // Tìm Trưởng đoàn của đợt khởi hành
    Optional<TourGuide> findByDepartureIdAndIsLeadGuideTrue(Long departureId);

    // Thêm vào TourGuideRepository.java:
    List<TourGuide> findAllByGuideId(Long guideId);
}