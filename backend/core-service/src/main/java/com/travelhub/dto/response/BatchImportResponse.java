package com.travelhub.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO trả về kết quả thực thi Spring Batch Job (số dòng đọc, nạp thành công, bỏ qua do lỗi).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchImportResponse {
    private Long jobExecutionId;
    private String batchStatus;
    private long totalRead;
    private long totalInserted;
    private long totalSkipped;
    private long durationMs;
    private List<String> errors;
}
