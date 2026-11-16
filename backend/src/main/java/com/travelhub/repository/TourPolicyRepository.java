package com.travelhub.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.travelhub.entity.TourPolicy;

public interface TourPolicyRepository extends JpaRepository<TourPolicy, Long>{
    List<TourPolicy> findAllByTourId(Long tourId);
}
