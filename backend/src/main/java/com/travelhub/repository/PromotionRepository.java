package com.travelhub.repository;

import com.travelhub.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    boolean existsByCode(String code);
    List<Promotion> findByIsActiveTrue();
    Optional<Promotion> findByCode(String code);
}
