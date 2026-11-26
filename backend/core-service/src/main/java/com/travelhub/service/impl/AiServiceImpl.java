package com.travelhub.service.impl;

import com.travelhub.dto.request.AiChatRequest;
import com.travelhub.dto.response.AiChatResponse;
import com.travelhub.entity.Tour;
import com.travelhub.enums.TourStatus;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final TourRepository tourRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Override
    public AiChatResponse getAiTourAdvice(AiChatRequest request) {
        try {
            // 1. Lấy danh sách tour làm ngữ cảnh
            List<Tour> activeTours = tourRepository.findAll()
                    .stream()
                    .filter(t -> t.getStatus() == TourStatus.ACTIVE)
                    .toList();

            StringBuilder tourContext = new StringBuilder(
                    "Dưới đây là danh sách các tour du lịch hiện có tại TravelHub:\n");
            for (Tour t : activeTours) {
                tourContext.append(String.format(
                        "- Mã: %s | Tên: %s | Điểm đi: %s | Điểm đến: %s | Thời gian: %d ngày %d đêm | Tóm tắt: %s\n",
                        t.getTourCode(), t.getName(), t.getDepartureCity(), t.getDestinationCity(), t.getDurationDays(),
                        t.getDurationNights(), t.getSummary()));
            }

            // 2. Soạn Prompt
            // Trong hàm getAiTourAdvice:
            String prompt = String.format(
                    "Bạn là chuyên viên tư vấn du lịch AI cao cấp của hệ thống TravelHub.\n" +
                            "Dưới đây là các tour hiện có sẵn:\n%s\n\n" +
                            "Khách hàng hỏi: \"%s\"\n\n" +
                            "Yêu cầu: Hãy trả lời nhiệt tình, lịch sự bằng tiếng Việt, gợi ý 1 hoặc 2 tour thích hợp nhất từ danh sách trên kèm lý do tại sao phù hợp.",
                    tourContext.toString(), request.getMessage());

            // 3. Đóng gói JSON
            Map<String, Object> requestMap = new HashMap<>();
            Map<String, Object> partMap = new HashMap<>();
            partMap.put("text", prompt);
            Map<String, Object>[] partsArray = new Map[] { partMap };
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", partsArray);
            requestMap.put("contents", new Map[] { contentMap });

            // 4. Thiết lập Header x-goog-api-key (Dành riêng cho key dạng AQ...)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", geminiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestMap, headers);

            // 5. Gọi API với model chuẩn v1 (gemini-pro) hoặc v1beta
            RestTemplate restTemplate = new RestTemplate();

            // Dùng URL sạch không có ?key= ở cuối
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(geminiApiUrl, entity, Map.class);
            Map<String, Object> apiResponse = responseEntity.getBody();

            String aiReply = extractTextFromGeminiResponse(apiResponse);
            return AiChatResponse.builder().replyMessage(aiReply).build();

        } catch (Exception e) {
            e.printStackTrace();
            return AiChatResponse.builder()
                    .replyMessage("Xin lỗi, hiện tại trợ lý AI đang bận, vui lòng thử lại sau!")
                    .build();
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromGeminiResponse(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidatesList = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> firstCandidate = candidatesList.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            Map<String, Object> firstPart = parts.get(0);
            return (String) firstPart.get("text");
        } catch (Exception e) {
            return "Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn lắm!";
        }
    }
}