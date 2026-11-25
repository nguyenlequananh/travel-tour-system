package com.travelhub.repository;

import com.travelhub.entity.TourPickupPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourPickupPointRepository extends JpaRepository<TourPickupPoint, Long> {

    // Sắp xếp điểm đón theo giờ đón từ sớm -> muộn
    @Query("SELECT p FROM TourPickupPoint p WHERE p.departure.id = :departureId ORDER BY p.pickupTime ASC, p.id ASC")
    List<TourPickupPoint> findAllByDepartureId(@Param("departureId") Long departureId);
}
