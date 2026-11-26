package com.travelhub.repository;
import com.travelhub.entity.Payment;
import com.travelhub.enums.PaymentMethod;
import com.travelhub.enums.TransactionStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByBookingId(Long bookingId);
    // Trong PaymentRepository.java:
    boolean existsByTransactionCode(String transactionCode);
    @Query("SELECT p FROM Payment p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod) AND " +
           "(:keyword IS NULL OR " +
           "   LOWER(p.transactionCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(p.booking.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Payment> filterPayments(
            @Param("keyword") String keyword,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            @Param("status") TransactionStatus status,
            Pageable pageable
    );
}
