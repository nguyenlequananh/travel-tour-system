package com.travelhub.service.impl;

import com.travelhub.batch.BatchErrorCollector;
import com.travelhub.dto.response.BatchImportResponse;
import com.travelhub.service.BatchImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BatchImportServiceImpl implements BatchImportService {

    private final JobOperator jobOperator;
    private final Job importDeparturesJob;
    private final BatchErrorCollector errorCollector;

    @Override
    public BatchImportResponse importDeparturesFromCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn file CSV không rỗng!");
        }

        String originalName = file.getOriginalFilename();
        if (originalName != null && !originalName.toLowerCase().endsWith(".csv")) {
            throw new RuntimeException("Hệ thống chỉ hỗ trợ định dạng file .csv!");
        }

        String runId = UUID.randomUUID().toString();
        errorCollector.init(runId);
        Path tempFile = null;
        long startTime = System.currentTimeMillis();

        try {
            // 1. Lưu file upload tạm ra ổ đĩa để FlatFileItemReader đọc theo luồng
            tempFile = Files.createTempFile("travelhub-batch-", ".csv");
            file.transferTo(tempFile.toFile());

            // 2. Truyền filePath và runId duy nhất qua JobParameters
            JobParameters params = new JobParametersBuilder()
                    .addString("filePath", tempFile.toAbsolutePath().toString())
                    .addString("runId", runId)
                    .toJobParameters();

            // 3. Kích hoạt Spring Batch 6 Job thông qua JobOperator
            JobExecution execution = jobOperator.start(importDeparturesJob, params);

            // 4. Trích xuất thống kê thực tế từ StepExecution
            StepExecution step = execution.getStepExecutions().iterator().next();
            List<String> errors = errorCollector.consumeErrors(runId);

            long totalRead = step.getReadCount() + step.getReadSkipCount();

            return BatchImportResponse.builder()
                    .jobExecutionId(execution.getId())
                    .batchStatus(execution.getStatus().name())
                    .totalRead(totalRead)
                    .totalInserted(step.getWriteCount())
                    .totalSkipped(step.getSkipCount())
                    .durationMs(System.currentTimeMillis() - startTime)
                    .errors(errors)
                    .build();
        } catch (Exception e) {
            errorCollector.consumeErrors(runId);
            throw new RuntimeException("Chạy Spring Batch Import thất bại: " + e.getMessage());
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (Exception ignored) {
                }
            }
        }
    }
}
