package com.travelhub.repository;

import com.travelhub.entity.CustomTourRequest;
import com.travelhub.enums.CustomTourStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomTourRequestRepository extends JpaRepository<CustomTourRequest, Long> {
    List<CustomTourRequest> findAllByOrderByCreatedAtDesc();
    List<CustomTourRequest> findAllByStatusOrderByCreatedAtDesc(CustomTourStatus status);
    @Query("SELECT c FROM CustomTourRequest c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:keyword IS NULL OR " +
           "   LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(c.destination) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<CustomTourRequest> filterCustomTours(
            @Param("keyword") String keyword,
            @Param("status") CustomTourStatus status,
            Pageable pageable
    );
}