package com.travelhub.repository;

import com.travelhub.entity.TourItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourItineraryRepository extends JpaRepository<TourItinerary, Long> {

    // Sắp xếp lịch trình đúng thứ tự Ngày 1 -> Ngày 2 -> Ngày 3
    @Query("SELECT i FROM TourItinerary i WHERE i.tour.id = :tourId ORDER BY i.dayNumber ASC, i.id ASC")
    List<TourItinerary> findAllByTourId(@Param("tourId") Long tourId);

    boolean existsByTourIdAndDayNumber(Long tourId, Integer dayNumber);
}
