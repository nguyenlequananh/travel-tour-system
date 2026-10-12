package com.travelhub.service.impl;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.travelhub.service.TourDepartureService;

import lombok.RequiredArgsConstructor;

import com.travelhub.dto.request.TourDepartureCreateRequest;
import com.travelhub.dto.request.TourDepartureUpdateRequest;
import com.travelhub.dto.response.TourDepartureResponse;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.repository.TourDepartureRepository;
import org.springframework.transaction.annotation.Transactional;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.Tour;
import com.travelhub.repository.TourRepository;
@RequiredArgsConstructor 
@Service 
public class TourDepartureServiceImpl implements TourDepartureService {
    public final TourDepartureRepository repository;
    public final TourRepository tourRepository;
    @Override
    @Transactional(readOnly = true)
    public List<TourDepartureResponse> getDeparturesByTourId(Long tourId) {
        return repository.findAllByTourId(tourId)
                .stream()
                .map(TourDepartureResponse::fromEntity)
                .toList();
    }
    @Override
    @Transactional (readOnly = true)
    public TourDepartureResponse getDepartureById(Long id) {
        return TourDepartureResponse.fromEntity(findTourDepartureEntityById(id));
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public TourDepartureResponse createDeparture(TourDepartureCreateRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour với ID: " + request.getTourId()));
        if(request.getDepartureDate().isBefore(LocalDate.now())){
            throw new RuntimeException("Ngày đầu không được trước ngày hiện tại");
        }
        if(request.getDepartureDate().isAfter(request.getReturnDate())){
            throw new RuntimeException("Ngày đầu không được sau ngày kết thúc");
        }
        TourDeparture tourDeparture = TourDeparture.builder()
                .tour(tour)
                .departureDate(request.getDepartureDate())
                .returnDate(request.getReturnDate())
                .adultPrice(request.getAdultPrice())
                .childPrice(request.getChildPrice())
                .singleRoomSupplement(request.getSingleRoomSupplement())
                .maxSeats(request.getMaxSeats())
                .availableSeats(request.getMaxSeats())
                .status(DepartureStatus.OPEN)
                .build();
        return TourDepartureResponse.fromEntity(repository.save(tourDeparture));
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public TourDepartureResponse updateDeparture(Long id, TourDepartureUpdateRequest request) {
        TourDeparture tourDeparture = findTourDepartureEntityById(id);
        if(request.getDepartureDate().isBefore(LocalDate.now())){
            throw new RuntimeException("Ngày đầu không được trước ngày hiện tại");
        }
        if(request.getDepartureDate().isAfter(request.getReturnDate())){
            throw new RuntimeException("Ngày đầu không được sau ngày kết thúc");
        }
        int bookedSeats = tourDeparture.getMaxSeats() - tourDeparture.getAvailableSeats();
        if(request.getMaxSeats() < bookedSeats){
            throw new RuntimeException("Số chỗ để bán quá số chỗ đã được đặt trên đợt khởi hành");
        }
        tourDeparture.setDepartureDate(request.getDepartureDate());
        tourDeparture.setReturnDate(request.getReturnDate());
        tourDeparture.setAdultPrice(request.getAdultPrice());
        tourDeparture.setChildPrice(request.getChildPrice());
        tourDeparture.setSingleRoomSupplement(request.getSingleRoomSupplement());
        tourDeparture.setMaxSeats(request.getMaxSeats());
        tourDeparture.setStatus(request.getStatus());
        tourDeparture.setAvailableSeats(request.getMaxSeats()-bookedSeats);
        return TourDepartureResponse.fromEntity(repository.save(tourDeparture));
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public void changeDepartureStatus(Long id, DepartureStatus status) {
        TourDeparture tourDeparture = findTourDepartureEntityById(id);
        tourDeparture.setStatus(status);
        repository.save(tourDeparture);
    }
    public TourDeparture findTourDepartureEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + id));
    }
}
