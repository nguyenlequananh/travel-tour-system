package com.travelhub.repository;
import com.travelhub.entity.TourItinerary;
import org.springframework.data.jpa.repository.JpaRepository;   
import java.util.List;
public interface TourItineraryRepository extends JpaRepository<TourItinerary, Long> {
    List<TourItinerary> findAllByTourId(Long tourId);
    boolean existsByTourIdAndDayNumber(Long tourId, Integer dayNumber);
}
