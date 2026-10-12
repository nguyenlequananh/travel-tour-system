package com.travelhub.repository;

import com.travelhub.entity.CustomTourRequest;
import com.travelhub.enums.CustomTourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomTourRequestRepository extends JpaRepository<CustomTourRequest, Long> {
    List<CustomTourRequest> findAllByOrderByCreatedAtDesc();
    List<CustomTourRequest> findAllByStatusOrderByCreatedAtDesc(CustomTourStatus status);
}