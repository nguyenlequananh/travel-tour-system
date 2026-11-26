package com.travelhub.repository;

import com.travelhub.entity.TourCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TourCategoryRepository extends JpaRepository<TourCategory, Integer> {
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
    Optional<TourCategory> findBySlug(String slug);
}