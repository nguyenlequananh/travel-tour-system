package com.travelhub.repository;
import com.travelhub.entity.BookingCancellation;
import com.travelhub.enums.CancellationStatus;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository 
public interface BookingCancellationRepository extends JpaRepository<BookingCancellation, Long> {
    Optional<BookingCancellation> findByBookingId(Long bookingId);    
    @Query("SELECT c FROM BookingCancellation c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:keyword IS NULL OR " +
           "   LOWER(c.booking.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(c.booking.contactName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<BookingCancellation> filterCancellations(
            @Param("keyword") String keyword,
            @Param("status") CancellationStatus status,
            Pageable pageable
    );
}
