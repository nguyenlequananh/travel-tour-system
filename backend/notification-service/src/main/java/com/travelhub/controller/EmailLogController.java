package com.travelhub.controller;

import com.travelhub.entity.EmailLog;
import com.travelhub.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/email-logs")
@RequiredArgsConstructor
public class EmailLogController {

    private final EmailLogRepository emailLogRepository;

    @GetMapping
    public ResponseEntity<List<EmailLog>> getAllEmailLogs() {
        return ResponseEntity.ok(emailLogRepository.findAllByOrderBySentAtDesc());
    }
}
