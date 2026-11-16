package com.travelhub.repository;
import com.travelhub.entity.TourPickupPoint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TourPickupPointRepository extends JpaRepository<TourPickupPoint, Long> {
    List<TourPickupPoint> findAllByDepartureId(Long departureId);
}
