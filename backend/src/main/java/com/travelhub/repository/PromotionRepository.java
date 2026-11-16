package com.travelhub.repository;

import com.travelhub.entity.Promotion;
import com.travelhub.enums.DiscountType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    boolean existsByCode(String code);
    List<Promotion> findByIsActiveTrue();
    Optional<Promotion> findByCode(String code);
    @Query("SELECT p FROM Promotion p WHERE " +
           "(:isActive IS NULL OR p.isActive = :isActive) AND " +
           "(:discountType IS NULL OR p.discountType = :discountType) AND " +
           "(:keyword IS NULL OR LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Promotion> filterPromotions(
            @Param("keyword") String keyword,
            @Param("discountType") DiscountType discountType,
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}
