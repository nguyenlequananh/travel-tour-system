package com.travelhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiChatRequest {
    @NotBlank(message = "Tin nhắn không được để trống")
    private String message;
}