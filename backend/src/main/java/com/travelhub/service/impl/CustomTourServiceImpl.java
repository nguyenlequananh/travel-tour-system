package com.travelhub.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.dto.request.CustomTourCreateRequest;
import com.travelhub.dto.filter.CustomTourFilterRequest;
import com.travelhub.dto.message.NotificationSendRequest;
import com.travelhub.dto.response.CustomTourResponse;
import com.travelhub.dto.common.PageResponse;
import com.travelhub.entity.CustomTourRequest;
import com.travelhub.enums.CustomTourStatus;
import com.travelhub.enums.NotificationType;
import com.travelhub.repository.CustomTourRequestRepository;
import com.travelhub.service.CustomTourService;
import com.travelhub.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CustomTourServiceImpl implements CustomTourService {
    private final CustomTourRequestRepository customTourRequestRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomTourResponse createCustomTourRequest(CustomTourCreateRequest request) {
        if (request.getDepartureDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Ngày khởi hành phải ở hiện tại hoặc tương lai!");
        }
        CustomTourRequest tourRequest = CustomTourRequest.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .destination(request.getDestination())
                .departureDate(request.getDepartureDate())
                .estimatedDurationDays(request.getEstimatedDurationDays())
                .estimatedGuests(request.getEstimatedGuests())
                .budgetPerPerson(request.getBudgetPerPerson())
                .specialRequirements(request.getSpecialRequirements())
                .status(CustomTourStatus.NEW)
                .build();
        notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                .title("Yêu cầu tour đoàn mới \uD83D\uDE90")
                .content("Khách hàng " + request.getFullName() + " vừa gửi form yêu cầu thiết kế tour đi " + request.getDestination())
                .type(NotificationType.SYSTEM_ALERT)
                .referenceId(null)
                .referenceUrl("/admin/custom-tours")
                .destinationTopic("/topic/admin/notifications")
                .build());
        return CustomTourResponse.fromEntity(customTourRequestRepository.save(tourRequest));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomTourResponse> getAllRequests() {
        return customTourRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(CustomTourResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomTourResponse getRequestById(Long id) {
        return CustomTourResponse.fromEntity(findCustomTourRquestEntity(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CustomTourResponse updateStatus(Long id, CustomTourStatus status) {
        CustomTourRequest tourRequest = findCustomTourRquestEntity(id);
        tourRequest.setStatus(status);
        customTourRequestRepository.save(tourRequest);
        return CustomTourResponse.fromEntity(tourRequest);
    }

    public CustomTourRequest findCustomTourRquestEntity(Long id) {
        return customTourRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu tour đoàn với ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomTourResponse> getRequestsWithFilter(CustomTourFilterRequest request) {
        Pageable pageable = request.toPageable();
        String keyword = (request.getKeyword() != null && !request.getKeyword().trim().isEmpty())
                ? request.getKeyword().trim()
                : null;

        Page<CustomTourRequest> reqPage = customTourRequestRepository.filterCustomTours(keyword, request.getStatus(),
                pageable);
        return PageResponse.fromPage(reqPage, CustomTourResponse::fromEntity);
    }
}
