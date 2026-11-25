package com.travelhub.service.impl;

import com.travelhub.dto.response.GuideDepartureResponse;
import com.travelhub.dto.response.GuidePassengerResponse;
import com.travelhub.dto.response.TourPickupPointResponse;
import com.travelhub.entity.*;
import com.travelhub.repository.*;
import com.travelhub.service.GuideService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GuideServiceImpl implements GuideService {

    private final TourGuideRepository tourGuideRepository;
    private final TourDepartureRepository tourDepartureRepository;
    private final BookingRepository bookingRepository;
    private final TourPickupPointRepository tourPickupPointRepository;
    private final UserRepository userRepository;

    // =========================================================================
    // HÀM 1: LẤY DANH SÁCH CÁC CHUYẾN ĐI ĐƯỢC PHÂN CÔNG (LỊCH CÔNG TÁC CỦA HDV)
    // =========================================================================
    @Override
    @Transactional(readOnly = true)
    public List<GuideDepartureResponse> getMyAssignedDepartures(Long guideId) {
        // 1. Kiểm tra tài khoản có tồn tại trong hệ thống không
        User guide = userRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + guideId));

        // 2. Kiểm tra xem tài khoản có đúng là Hướng dẫn viên (hoặc Admin) không
        boolean isGuideRole = guide.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_GUIDE") || r.getName().equals("ROLE_ADMIN"));
        if (!isGuideRole) {
            throw new RuntimeException("Tài khoản này không có quyền Hướng dẫn viên (ROLE_GUIDE)!");
        }

        // 3. Lấy tất cả các phân công của HDV này trong bảng tour_guides
        List<TourGuide> assignments = tourGuideRepository.findAllByGuideId(guide.getId());

        // 4. Tổng hợp thông tin chuyến đi kèm số khách thực tế và lộ trình điểm đón
        //    Sắp xếp: ưu tiên chuyến sắp đi (>= hôm nay, gần nhất lên đầu), chuyến đã qua xếp bên dưới (gần đây nhất lên trước)
        LocalDate today = LocalDate.now();

        return assignments.stream().map(assignment -> {
            TourDeparture departure = assignment.getDeparture();
            Tour tour = departure.getTour();

            // Lấy danh sách điểm đón xe của chuyến này để HDV nắm lộ trình (đã sort theo pickupTime ASC)
            List<TourPickupPointResponse> pickupPoints = tourPickupPointRepository
                    .findAllByDepartureId(departure.getId())
                    .stream()
                    .map(TourPickupPointResponse::fromEntity)
                    .toList();

            // Tính tổng số lượng khách thực tế đã chốt vé (CONFIRMED / COMPLETED)
            List<Booking> bookings = bookingRepository.findConfirmedBookingsByDepartureId(departure.getId());
            int totalGuests = bookings.stream()
                    .mapToInt(b -> b.getPassengers() != null ? b.getPassengers().size() : 0)
                    .sum();

            return GuideDepartureResponse.builder()
                    .departureId(departure.getId())
                    .tourId(tour != null ? tour.getId() : null)
                    .tourCode(tour != null ? tour.getTourCode() : null)
                    .tourName(tour != null ? tour.getName() : null)
                    .departureCity(tour != null ? tour.getDepartureCity() : null)
                    .destinationCity(tour != null ? tour.getDestinationCity() : null)
                    .departureDate(departure.getDepartureDate())
                    .returnDate(departure.getReturnDate())
                    .totalGuests(totalGuests)
                    .isLeadGuide(assignment.getIsLeadGuide())
                    .status(departure.getStatus())
                    .pickupPoints(pickupPoints)
                    .build();
        }).sorted((a, b) -> {
            boolean aPast = a.getDepartureDate().isBefore(today);
            boolean bPast = b.getDepartureDate().isBefore(today);

            if (aPast != bPast) {
                return aPast ? 1 : -1;
            }
            return aPast
                    ? b.getDepartureDate().compareTo(a.getDepartureDate())
                    : a.getDepartureDate().compareTo(b.getDepartureDate());
        }).toList();
    }

    // =========================================================================
    // HÀM 2: LẤY BẢN DANH SÁCH ĐOÀN KHÁCH CHI TIẾT (ĐỂ ĐÓN KHÁCH & ĐIỂM DANH)
    // =========================================================================
    @Override
    @Transactional(readOnly = true)
    public List<GuidePassengerResponse> getDeparturePassengers(Long departureId, Long guideId) {
        // 1. Kiểm tra tài khoản HDV có tồn tại và đúng quyền không
        User guide = userRepository.findById(guideId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + guideId));

        boolean isGuideRole = guide.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ROLE_GUIDE") || r.getName().equals("ROLE_ADMIN"));
        if (!isGuideRole) {
            throw new RuntimeException("Tài khoản này không có quyền Hướng dẫn viên (ROLE_GUIDE)!");
        }

        // 2. Kiểm tra đợt khởi hành có tồn tại trong hệ thống không
        tourDepartureRepository.findById(departureId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + departureId));

        // 3. BẢO MẬT CHẶT CHẼ: Kiểm tra xem HDV này có được phân công dẫn chuyến này không!
        boolean isAssigned = tourGuideRepository.existsByDepartureIdAndGuideId(departureId, guide.getId());
        if (!isAssigned) {
            throw new RuntimeException("Bạn không được phân công phụ trách chuyến đi này nên không có quyền xem danh sách đoàn!");
        }

        // 4. Lấy tất cả các đơn đặt tour hợp lệ (CONFIRMED hoặc COMPLETED) của chuyến này
        List<Booking> bookings = bookingRepository.findConfirmedBookingsByDepartureId(departureId);

        // 5. Trải phẳng (Flatten) từng hành khách thành 1 dòng để HDV điểm danh trên xe
        List<GuidePassengerResponse> passengerManifest = new ArrayList<>();

        for (Booking booking : bookings) {
            if (booking.getPassengers() == null) continue;

            for (BookingPassenger p : booking.getPassengers()) {
                GuidePassengerResponse item = GuidePassengerResponse.builder()
                        .passengerId(p.getId())
                        .bookingCode(booking.getBookingCode())
                        .fullName(p.getFullName())
                        .passengerType(p.getPassengerType())
                        .gender(p.getGender())
                        .birthDate(p.getBirthDate())
                        .idCardOrPassport(p.getIdCardOrPassport())
                        .requiresSingleRoom(p.getRequiresSingleRoom())
                        .contactName(booking.getContactName())
                        .contactPhone(booking.getContactPhone())
                        // Thông tin điểm đón khách đã đăng ký
                        .pickupLocationName(booking.getPickupPoint() != null ? booking.getPickupPoint().getLocationName() : "Tự túc / Tập trung tại điểm khởi hành")
                        .pickupTime(booking.getPickupPoint() != null ? booking.getPickupPoint().getPickupTime() : null)
                        .build();

                passengerManifest.add(item);
            }
        }

        // 6. Sắp xếp theo giờ đón tăng dần (tự túc xuống cuối), cùng giờ thì gom theo mã đơn
        passengerManifest.sort(
                Comparator.comparing(
                        GuidePassengerResponse::getPickupTime,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).thenComparing(
                        GuidePassengerResponse::getBookingCode,
                        Comparator.nullsLast(Comparator.naturalOrder())
                )
        );

        return passengerManifest;
    }
}
