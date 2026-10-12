package com.travelhub.service.impl;

import com.travelhub.service.TourItineraryService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.dto.request.TourItineraryRequest;
import com.travelhub.dto.response.TourItineraryResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourItinerary;
import com.travelhub.repository.TourItineraryRepository;
import com.travelhub.repository.TourRepository;

@Service
@RequiredArgsConstructor
public class TourItineraryServiceImpl implements TourItineraryService {
    private final TourItineraryRepository itineraryRepository;
    private final TourRepository tourRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TourItineraryResponse> getItinerariesByTourId(Long tourId) {
        return itineraryRepository.findAllByTourId(tourId)
                .stream()
                .map(TourItineraryResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TourItineraryResponse getItineraryById(Long id) {
        TourItinerary itinerary = findItineraryEntityById(id);
        return TourItineraryResponse.fromEntity(itinerary);
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
    public TourItineraryResponse createItinerary(TourItineraryRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour với ID: " + request.getTourId()));
        if (tour.getDurationDays() < request.getDayNumber()) {
            throw new RuntimeException("Số ngày đi đến không được quá so với số ngày đi từ tour");
        }
        if (itineraryRepository.existsByTourIdAndDayNumber(request.getTourId(), request.getDayNumber())) {
            throw new RuntimeException("Lịch trình đã tồn tại!");
        }
        TourItinerary tourItinerary = TourItinerary.builder()
                .tour(tour) // Đối tượng Tour cha tìm được ở bước 1
                .dayNumber(request.getDayNumber())
                .title(request.getTitle().trim())
                .details(request.getDetails().trim())
                .meals(request.getMeals() != null ? request.getMeals().trim() : null)
                .accommodation(request.getAccommodation() != null ? request.getAccommodation().trim() : null)
                .build();
        return TourItineraryResponse.fromEntity(itineraryRepository.save(tourItinerary));
    }

    @Override
    @Transactional 
    public TourItineraryResponse updateItinerary(Long id, TourItineraryRequest request) {
        TourItinerary itinerary = findItineraryEntityById(id);
        if(!itinerary.getTour().getId().equals(request.getTourId())){
            throw new RuntimeException("Không thể thay đổi tour!");
        }
        if (!itinerary.getDayNumber().equals(request.getDayNumber())) {
            throw new RuntimeException("Số ngày đi không được thay đổi!");// cp the thay doi sau
        }
        itinerary.setTitle(request.getTitle().trim());
        itinerary.setDetails(request.getDetails().trim());
        itinerary.setMeals(request.getMeals() != null ? request.getMeals().trim() : null);
        itinerary.setAccommodation(request.getAccommodation() != null ? request.getAccommodation().trim() : null);
        return TourItineraryResponse.fromEntity(itineraryRepository.save(itinerary));
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
    public void deleteItinerary(Long id) {
        TourItinerary itinerary = findItineraryEntityById(id);
        itineraryRepository.delete(itinerary);
    }

    @Transactional 
    private TourItinerary findItineraryEntityById(Long id) {
        return itineraryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch trình với ID: " + id));
    }

}
