package com.travelhub.repository;

import com.travelhub.entity.TourImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourImageRepository extends JpaRepository<TourImage, Long> {
    List<TourImage> findAllByTourId(Long tourId);
}   