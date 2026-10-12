package com.travelhub.service.impl;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.dto.request.CustomTourCreateRequest;
import com.travelhub.dto.response.CustomTourResponse;
import com.travelhub.entity.CustomTourRequest;
import com.travelhub.enums.CustomTourStatus;
import com.travelhub.repository.CustomTourRequestRepository;
import com.travelhub.service.CustomTourService;

import lombok.RequiredArgsConstructor;
@RequiredArgsConstructor 
@Service 
public class CustomTourServiceImpl implements CustomTourService {
    private final CustomTourRequestRepository customTourRequestRepository;
    @Override
    @Transactional (rollbackFor = Exception.class)
    public CustomTourResponse createCustomTourRequest(CustomTourCreateRequest request) {
        if(request.getDepartureDate().isBefore(LocalDate.now())) {
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
        
        return CustomTourResponse.fromEntity(customTourRequestRepository.save(tourRequest));
    }
    @Override
    @Transactional (readOnly = true)
    public List<CustomTourResponse> getAllRequests() {
        return customTourRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(CustomTourResponse::fromEntity)
                .toList();
    }
    @Override
    @Transactional (readOnly = true)
    public CustomTourResponse getRequestById(Long id) {
        return CustomTourResponse.fromEntity(findCustomTourRquestEntity(id));
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
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
}
