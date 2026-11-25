package com.travelhub.controller.client;

import com.travelhub.dto.request.AiChatRequest;
import com.travelhub.dto.common.ApiResponse;
import com.travelhub.dto.response.AiChatResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.travelhub.service.AiService;



@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<AiChatResponse>> chatWithAi(
            @Valid @RequestBody AiChatRequest request) {
        
        // Controller chỉ nhận request, gọi Service và trả về ApiResponse chuẩn của dự án!
        AiChatResponse response = aiService.getAiTourAdvice(request);

        return ResponseEntity.ok(ApiResponse.<AiChatResponse>builder()
                .status(200)
                .message("AI tư vấn thành công")
                .data(response)
                .build());
    }
}