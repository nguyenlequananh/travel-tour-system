package com.travelhub.repository;

import com.travelhub.entity.TourDeparture;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourDepartureRepository extends JpaRepository<TourDeparture, Long> {

    List<TourDeparture> findAllByTourId(Long tourId);

    // SỬA: SELECT d FROM TourDeparture d (Khóa đúng chuyến đi để trừ số ghế)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM TourDeparture d WHERE d.id = :id")
    Optional<TourDeparture> findByWithLock(@Param("id") Long id);
        // 👉 TÌM CÁC CHUYẾN ĐI CÓ NGÀY KHỞI HÀNH TRONG QUÁ KHỨ ĐỂ TỰ ĐỘNG ĐÓNG
    @Query("SELECT d FROM TourDeparture d WHERE d.status = :status AND d.departureDate < :today")
    List<TourDeparture> findPastDeparturesWithStatus(
            @Param("status") com.travelhub.enums.DepartureStatus status,
            @Param("today") java.time.LocalDate today);
}