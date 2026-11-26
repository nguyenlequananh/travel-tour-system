package com.travelhub.service;

import com.travelhub.dto.request.AiChatRequest;
import com.travelhub.dto.response.AiChatResponse;

public interface AiService {
    AiChatResponse getAiTourAdvice(AiChatRequest request);
}