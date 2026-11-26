package com.travelhub.service.impl;

import com.travelhub.dto.request.TourImageRequest;
import com.travelhub.dto.response.TourImageResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourImage;
import com.travelhub.repository.TourImageRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.TourImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourImageServiceImpl implements TourImageService {

    private final TourImageRepository imageRepository;
    private final TourRepository tourRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TourImageResponse> getImagesByTourId(Long tourId) {
        return imageRepository.findAllByTourId(tourId).stream()
                .map(TourImageResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TourImageResponse getImageById(Long id) {
        return TourImageResponse.fromEntity(findImageEntityById(id));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourImageResponse createImage(TourImageRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tour với ID: " + request.getTourId()));

        TourImage tourImage = TourImage.builder()
                .tour(tour)
                .imageUrl(request.getImageUrl().trim())
                .build();

        return TourImageResponse.fromEntity(imageRepository.save(tourImage));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourImageResponse updateImage(Long id, TourImageRequest request) {
        TourImage tourImage = findImageEntityById(id);

        if (!tourImage.getTour().getId().equals(request.getTourId())) {
            Tour newTour = tourRepository.findById(request.getTourId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy tour mới với ID: " + request.getTourId()));
            tourImage.setTour(newTour);
        }

        tourImage.setImageUrl(request.getImageUrl().trim());

        return TourImageResponse.fromEntity(imageRepository.save(tourImage));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteImage(Long id) {
        TourImage tourImage = findImageEntityById(id);
        imageRepository.delete(tourImage);
    }

    @Transactional(readOnly = true)
    private TourImage findImageEntityById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hình ảnh với ID: " + id));
    }
}