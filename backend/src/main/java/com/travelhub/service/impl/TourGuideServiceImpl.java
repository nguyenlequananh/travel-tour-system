package com.travelhub.service.impl;

import com.travelhub.dto.request.NotificationSendRequest;
import com.travelhub.dto.request.TourGuideRequest;
import com.travelhub.dto.response.TourGuideResponse;
import com.travelhub.dto.response.UserResponse;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.TourGuide;
import com.travelhub.entity.User;
import com.travelhub.enums.NotificationType;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourGuideRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.service.NotificationService;
import com.travelhub.service.TourGuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TourGuideServiceImpl implements TourGuideService {

    private final TourGuideRepository tourGuideRepository;
    private final TourDepartureRepository departureRepository;
    private final UserRepository userRepository;

    private final NotificationService notificationService;

    @Override
    @Transactional(readOnly = true)
    public List<TourGuideResponse> getGuidesByDepartureId(Long departureId) {
        return tourGuideRepository.findAllByDepartureId(departureId).stream()
                .map(TourGuideResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TourGuideResponse getGuideAssignmentById(Long id) {
        return TourGuideResponse.fromEntity(findTourGuideEntityById(id));
    }

    // 👉 HÀM BỔ SUNG: Lấy tất cả nhân viên có ROLE_GUIDE đang hoạt động cho Frontend chọn
    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAvailableGuides() {
        return userRepository.findAllActiveGuides().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourGuideResponse assignGuide(TourGuideRequest request) {
        TourDeparture departure = departureRepository.findById(request.getDepartureId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + request.getDepartureId()));

        User guide = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với ID: " + request.getUserId()));

        // 1. KIỂM TRA ROLE: Bắt buộc phải là ROLE_GUIDE (hoặc ROLE_ADMIN)
        boolean isGuideRole = guide.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_GUIDE") || r.getName().equals("ROLE_ADMIN"));
        if (!isGuideRole) {
            throw new RuntimeException("Người dùng này không có quyền Hướng dẫn viên (ROLE_GUIDE)!");
        }

        // 2. CHỐNG GÁN TRÙNG: Kiểm tra xem người này đã được phân công vào chuyến này chưa
        boolean alreadyAssigned = tourGuideRepository.existsByDepartureIdAndGuideId(departure.getId(), guide.getId());
        if (alreadyAssigned) {
            throw new RuntimeException("Hướng dẫn viên này đã được phân công cho chuyến đi này rồi!");
        }

        // 3. XỬ LÝ TRƯỞNG ĐOÀN: Nếu người mới được chọn làm Trưởng đoàn -> Hạ Trưởng đoàn cũ xuống Phụ đoàn
        boolean isLead = Boolean.TRUE.equals(request.getIsLeadGuide());
        if (isLead) {
            tourGuideRepository.findByDepartureIdAndIsLeadGuideTrue(departure.getId())
                    .ifPresent(oldLead -> {
                        oldLead.setIsLeadGuide(false);
                        tourGuideRepository.save(oldLead);
                    });
        }

        TourGuide tourGuide = TourGuide.builder()
                .departure(departure)
                .guide(guide)
                .isLeadGuide(isLead)
                .build();
        notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                .recipientUserId(guide.getId())
                .title("Phân công dẫn tour mới \uD83D\uDEA9")
                .content("Bạn vừa được phân công dẫn chuyến đi: " + departure.getTour().getName() + " (Ngày đi: " + departure.getDepartureDate() + ")")
                .type(NotificationType.GUIDE_ASSIGNED)
                .referenceId(departure.getId().toString())
                .referenceUrl("/guide/my-departures")
                .destinationTopic("/queue/notifications")
                .build());

        return TourGuideResponse.fromEntity(tourGuideRepository.save(tourGuide));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TourGuideResponse updateGuideAssignment(Long id, TourGuideRequest request) {
        TourGuide tourGuide = findTourGuideEntityById(id);

        if (!tourGuide.getDeparture().getId().equals(request.getDepartureId())) {
            TourDeparture newDeparture = departureRepository.findById(request.getDepartureId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành mới với ID: " + request.getDepartureId()));
            tourGuide.setDeparture(newDeparture);
        }

        if (!tourGuide.getGuide().getId().equals(request.getUserId())) {
            User newGuide = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy hướng dẫn viên mới với ID: " + request.getUserId()));
            
            // Kiểm tra role của HDV mới
            boolean isGuideRole = newGuide.getRoles().stream()
                    .anyMatch(r -> r.getName().equals("ROLE_GUIDE") || r.getName().equals("ROLE_ADMIN"));
            if (!isGuideRole) {
                throw new RuntimeException("Người dùng mới không có quyền Hướng dẫn viên!");
            }
            tourGuide.setGuide(newGuide);
            // GỬI THÔNG BÁO CHO HDV MỚI NGAY TRONG KHỐI LỆNH NÀY (Để newGuide không bị lỗi out of scope)
            notificationService.sendAndSaveNotification(NotificationSendRequest.builder()
                    .recipientUserId(newGuide.getId())
                    .title("Phân công dẫn tour mới \uD83D\uDEA9")
                    .content("Bạn vừa được thêm vào chuyến đi: " + tourGuide.getDeparture().getTour().getName() + " (Ngày đi: " + tourGuide.getDeparture().getDepartureDate() + ")")
                    .type(NotificationType.GUIDE_ASSIGNED)
                    .referenceId(tourGuide.getDeparture().getId().toString())
                    .referenceUrl("/guide/my-departures")
                    .destinationTopic("/queue/notifications")
                    .build());
        }

        tourGuide.setIsLeadGuide(Boolean.TRUE.equals(request.getIsLeadGuide()));
        return TourGuideResponse.fromEntity(tourGuideRepository.save(tourGuide));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeGuideAssignment(Long id) {
        TourGuide tourGuide = findTourGuideEntityById(id);
        tourGuideRepository.delete(tourGuide);
    }

    @Transactional(readOnly = true)
    private TourGuide findTourGuideEntityById(Long id) {
        return tourGuideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân công hướng dẫn viên với ID: " + id));
    }
}