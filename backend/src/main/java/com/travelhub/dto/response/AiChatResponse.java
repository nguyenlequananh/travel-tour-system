package com.travelhub.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AiChatResponse {
    private String replyMessage; // Câu trả lời của AI
}