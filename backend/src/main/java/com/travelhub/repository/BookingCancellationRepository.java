package com.travelhub.repository;
import com.travelhub.entity.BookingCancellation;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
public interface BookingCancellationRepository extends JpaRepository<BookingCancellation, Long> {
    Optional<BookingCancellation> findByBookingId(Long bookingId);    
    
}
