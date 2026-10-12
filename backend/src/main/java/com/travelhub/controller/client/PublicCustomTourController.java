package com.travelhub.controller.client;

import com.travelhub.dto.request.CustomTourCreateRequest;
import com.travelhub.dto.response.ApiResponse;
import com.travelhub.dto.response.CustomTourResponse;
import com.travelhub.service.CustomTourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/custom-tours") // Khách gửi form
@RequiredArgsConstructor
public class PublicCustomTourController {

    private final CustomTourService customTourService;

    @PostMapping
    public ResponseEntity<ApiResponse<CustomTourResponse>> submitRequest(
            @Valid @RequestBody CustomTourCreateRequest request) {

        CustomTourResponse response = customTourService.createCustomTourRequest(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CustomTourResponse>builder()
                .status(201)
                .message("Gửi yêu cầu tour đoàn thành công! Nhân viên sẽ liên hệ lại sớm nhất.")
                .data(response)
                .build());
    }
}