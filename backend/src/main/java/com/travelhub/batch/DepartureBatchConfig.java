package com.travelhub.batch;

import com.travelhub.dto.request.DepartureCsvRow;
import com.travelhub.entity.TourDeparture;
import com.travelhub.repository.TourDepartureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.listener.SkipListener;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.infrastructure.item.ItemWriter;
import org.springframework.batch.infrastructure.item.file.FlatFileItemReader;
import org.springframework.batch.infrastructure.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.transaction.PlatformTransactionManager;

import java.nio.charset.StandardCharsets;

/**
 * Cấu hình dây chuyền Spring Batch 6 cho nghiệp vụ Import Đợt khởi hành từ file CSV:
 * FlatFileItemReader -> DepartureItemProcessor -> ItemWriter (Chunk = 10, Fault-Tolerant Skip).
 */
@Configuration
@RequiredArgsConstructor
public class DepartureBatchConfig {

    private final TourDepartureRepository tourDepartureRepository;
    private final DepartureItemProcessor departureItemProcessor;
    private final BatchErrorCollector errorCollector;

    // 1. READER: Đọc từng dòng file CSV từ đường dẫn filePath trong JobParameters
    @Bean
    @StepScope
    public FlatFileItemReader<DepartureCsvRow> departureCsvReader(
            @Value("#{jobParameters['filePath']}") String filePath) {
        return new FlatFileItemReaderBuilder<DepartureCsvRow>()
                .name("departureCsvReader")
                .resource(new FileSystemResource(filePath))
                .encoding(StandardCharsets.UTF_8.name())
                .linesToSkip(1) // Bỏ qua dòng tiêu đề đầu tiên
                .delimited()
                .names("tourCode", "departureDate", "adultPrice", "childPrice", "singleRoomSupplement", "maxSeats")
                .targetType(DepartureCsvRow.class)
                .build();
    }

    // 2. WRITER: Ghi từng lô (chunk = 10 dòng hợp lệ) xuống MariaDB/H2
    @Bean
    public ItemWriter<TourDeparture> departureItemWriter() {
        return chunk -> tourDepartureRepository.saveAll(chunk.getItems());
    }

    // 3. SKIP LISTENER: Gom chi tiết các dòng bị lỗi vào BatchErrorCollector theo runId
    @Bean
    @StepScope
    public SkipListener<DepartureCsvRow, TourDeparture> departureSkipListener(
            @Value("#{jobParameters['runId']}") String runId) {
        return new SkipListener<>() {
            @Override
            public void onSkipInRead(Throwable t) {
                errorCollector.addError(runId, "Lỗi định dạng dòng CSV: " + t.getMessage());
            }

            @Override
            public void onSkipInProcess(DepartureCsvRow item, Throwable t) {
                errorCollector.addError(runId,
                        "Dòng [" + item.getTourCode() + " | " + item.getDepartureDate() + "]: " + t.getMessage());
            }

            @Override
            public void onSkipInWrite(TourDeparture item, Throwable t) {
                errorCollector.addError(runId,
                        "Lỗi lưu DB ngày " + item.getDepartureDate() + ": " + t.getMessage());
            }
        };
    }

    // 4. STEP: Xử lý theo Chunk 10 dòng + bật cơ chế chịu lỗi Fault-Tolerant Skip
    @Bean
    public Step importDeparturesStep(JobRepository jobRepository,
                                     PlatformTransactionManager transactionManager,
                                     FlatFileItemReader<DepartureCsvRow> departureCsvReader,
                                     ItemWriter<TourDeparture> departureItemWriter,
                                     SkipListener<DepartureCsvRow, TourDeparture> departureSkipListener) {
        return new StepBuilder("importDeparturesStep", jobRepository)
                .<DepartureCsvRow, TourDeparture>chunk(10)
                .transactionManager(transactionManager)
                .reader(departureCsvReader)
                .processor(departureItemProcessor)
                .writer(departureItemWriter)
                .faultTolerant()
                .skip(Exception.class)
                .skipLimit(100)
                .listener(departureSkipListener)
                .build();
    }

    // 5. JOB: Đóng gói Step thành Job hoàn chỉnh để BatchImportService kích hoạt
    @Bean
    public Job importDeparturesJob(JobRepository jobRepository, Step importDeparturesStep) {
        return new JobBuilder("importDeparturesJob", jobRepository)
                .start(importDeparturesStep)
                .build();
    }
}
