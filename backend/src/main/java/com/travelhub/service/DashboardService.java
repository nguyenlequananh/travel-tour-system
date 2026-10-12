package com.travelhub.service;

import com.travelhub.dto.response.DashboardResponse;

public interface DashboardService {
    DashboardResponse getDashboardStats(Integer year);
}