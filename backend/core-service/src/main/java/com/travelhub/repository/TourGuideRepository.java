package com.travelhub.repository;

import com.travelhub.entity.TourGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourGuideRepository extends JpaRepository<TourGuide, Long> {

    // Ưu tiên Trưởng đoàn (isLeadGuide = true) lên đầu danh sách
    @Query("SELECT tg FROM TourGuide tg WHERE tg.departure.id = :departureId ORDER BY tg.isLeadGuide DESC, tg.id ASC")
    List<TourGuide> findAllByDepartureId(@Param("departureId") Long departureId);

    boolean existsByDepartureIdAndGuideId(Long departureId, Long guideId);

    // Tìm Trưởng đoàn của đợt khởi hành
    Optional<TourGuide> findByDepartureIdAndIsLeadGuideTrue(Long departureId);

    List<TourGuide> findAllByGuideId(Long guideId);
}
