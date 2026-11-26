package com.travelhub.repository;

import com.travelhub.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
    List<EmailLog> findAllByOrderBySentAtDesc();
}
