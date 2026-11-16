package com.travelhub.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.service.TourPickupPointService;

import lombok.RequiredArgsConstructor;

import com.travelhub.dto.request.TourPickupPointRequest;
import com.travelhub.dto.response.TourPickupPointResponse;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.TourPickupPoint;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourPickupPointRepository;

@Service
@RequiredArgsConstructor
public class TourPickupPointServiceImpl implements TourPickupPointService {
    private final TourPickupPointRepository tourPickupPointRepository;
    private final TourDepartureRepository tourDepartureRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TourPickupPointResponse> getPickupPointsByDepartureId(Long departureId) {
        return tourPickupPointRepository.findAllByDepartureId(departureId)
                .stream()
                .map(TourPickupPointResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourPickupPointResponse createPickupPoint(TourPickupPointRequest request) {
        TourDeparture tourDeparture = tourDepartureRepository.findById(request.getDepartureId())
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + request.getDepartureId()));
        TourPickupPoint pickupPoint = TourPickupPoint.builder()
                .departure(tourDeparture)
                .locationName(request.getLocationName())
                .pickupTime(request.getPickupTime())
                .build();
        return TourPickupPointResponse.fromEntity(tourPickupPointRepository.save(pickupPoint));
    }

    @Override
    @Transactional(readOnly = true)
    public TourPickupPointResponse getPickupPointById(Long id) {
        return TourPickupPointResponse.fromEntity(findPickupPointEntityById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourPickupPointResponse updatePickupPoint(Long id, TourPickupPointRequest request) {
        TourPickupPoint pickupPoint = findPickupPointEntityById(id);

        TourDeparture departure = tourDepartureRepository.findById(request.getDepartureId())
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + request.getDepartureId()));
        pickupPoint.setDeparture(departure);
        pickupPoint.setLocationName(request.getLocationName());
        pickupPoint.setPickupTime(request.getPickupTime());
        return TourPickupPointResponse.fromEntity(tourPickupPointRepository.save(pickupPoint));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePickupPoint(Long id) {
        TourPickupPoint pickupPoint = findPickupPointEntityById(id);
        tourPickupPointRepository.delete(pickupPoint);

    }

    @Transactional(readOnly = true)
    public TourPickupPoint findPickupPointEntityById(Long id) {
        return tourPickupPointRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy điểm đón với ID: " + id));
    }
}