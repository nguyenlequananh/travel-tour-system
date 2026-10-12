package com.travelhub.repository;
import com.travelhub.entity.Booking;
import com.travelhub.entity.TourDeparture;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
public interface TourDepartureRepository extends JpaRepository<TourDeparture, Long> {
    List<TourDeparture> findAllByTourId(Long tourId);

    @Lock (LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b from Booking b WHERE b.id = :id")
    Optional<TourDeparture> findByWithLock(@Param("id") Long id);
}
