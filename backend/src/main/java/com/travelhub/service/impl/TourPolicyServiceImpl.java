package com.travelhub.service.impl;

import com.travelhub.dto.request.TourPolicyRequest;
import com.travelhub.dto.response.TourPolicyResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourPolicy;
import com.travelhub.repository.TourPolicyRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.TourPolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourPolicyServiceImpl implements TourPolicyService {

    private final TourPolicyRepository policyRepository;
    private final TourRepository tourRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TourPolicyResponse> getPoliciesByTourId(Long tourId) {
        return policyRepository.findAllByTourId(tourId).stream()
                .map(TourPolicyResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TourPolicyResponse getPolicyById(Long id) {
        return TourPolicyResponse.fromEntity(findPolicyEntityById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourPolicyResponse createPolicy(TourPolicyRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour với ID: " + request.getTourId()));

        TourPolicy policy = TourPolicy.builder()
                .tour(tour)
                .policyType(request.getPolicyType())
                .content(request.getContent().trim())
                .build();

        return TourPolicyResponse.fromEntity(policyRepository.save(policy));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourPolicyResponse updatePolicy(Long id, TourPolicyRequest request) {
        TourPolicy policy = findPolicyEntityById(id);

        // Nếu muốn chuyển chính sách sang Tour khác
        if (!policy.getTour().getId().equals(request.getTourId())) {
            Tour newTour = tourRepository.findById(request.getTourId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tour mới với ID: " + request.getTourId()));
            policy.setTour(newTour);
        }

        policy.setPolicyType(request.getPolicyType());
        policy.setContent(request.getContent().trim());

        return TourPolicyResponse.fromEntity(policyRepository.save(policy));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePolicy(Long id) {
        TourPolicy policy = findPolicyEntityById(id);
        policyRepository.delete(policy);
    }

    @Transactional(readOnly = true)
    private TourPolicy findPolicyEntityById(Long id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chính sách với ID: " + id));
    }
}