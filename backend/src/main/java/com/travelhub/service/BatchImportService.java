package com.travelhub.service;

import com.travelhub.dto.response.BatchImportResponse;
import org.springframework.web.multipart.MultipartFile;

public interface BatchImportService {
    BatchImportResponse importDeparturesFromCsv(MultipartFile file);
}
