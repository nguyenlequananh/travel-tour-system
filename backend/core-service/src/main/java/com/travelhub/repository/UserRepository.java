package com.travelhub.repository;

import com.travelhub.entity.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
        boolean existsByEmail(String email);

        List<User> findByIsActiveTrue();

        Optional<User> findByEmail(String email);

        @Query("SELECT u FROM User u WHERE " +
                        "(:isActive IS NULL OR u.isActive = :isActive) AND " +
                        "(:keyword IS NULL OR " +
                        "   LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "   LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "   LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
        Page<User> filterUsers(
                        @Param("keyword") String keyword,
                        @Param("isActive") Boolean isActive,
                        Pageable pageable);

        // Thêm hàm này vào trong interface UserRepository:
        @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_GUIDE' AND u.isActive = true")
        List<User> findAllActiveGuides();

        @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name IN ('ROLE_ADMIN', 'ADMIN') AND u.isActive = true")
        List<User> findAllActiveAdmins();
}