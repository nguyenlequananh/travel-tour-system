package com.travelhub.repository;
import com.travelhub.entity.BookingPassenger;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BookingPassagerRepository extends JpaRepository<BookingPassenger, Long> {
    
}
