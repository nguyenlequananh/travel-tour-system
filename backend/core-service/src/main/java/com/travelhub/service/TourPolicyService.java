package com.travelhub.service;

import com.travelhub.dto.request.TourPolicyRequest;
import com.travelhub.dto.response.TourPolicyResponse;

import java.util.List;

public interface TourPolicyService {
    List<TourPolicyResponse> getPoliciesByTourId(Long tourId);
    TourPolicyResponse getPolicyById(Long id);
    TourPolicyResponse createPolicy(TourPolicyRequest request);
    TourPolicyResponse updatePolicy(Long id, TourPolicyRequest request);
    void deletePolicy(Long id);
}