package com.travelhub.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.service.BookingService;

import lombok.RequiredArgsConstructor;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.BookingPassagerRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.dto.request.BookingCreateRequest;
import com.travelhub.dto.request.PassengerRequest;
import com.travelhub.dto.response.BookingResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.BookingPassenger;
import com.travelhub.entity.User;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PassengerType;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.entity.TourDeparture;
import com.travelhub.entity.Promotion;
import com.travelhub.repository.PromotionRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.travelhub.enums.DiscountType;

@RequiredArgsConstructor
@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingPassagerRepository bookingPassengerRepository;
    private final UserRepository userRepository;
    private final TourDepartureRepository tourDepartureRepository;
    private final PromotionRepository promotionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        return BookingResponse.fromEntity(findBookingEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        return BookingResponse.fromEntity(bookingRepository.findBookingByBookingCode(bookingCode).orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt chỗ với mã: " + bookingCode)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(Long userId) {
        if (userRepository.findById(userId).isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng với ID: " + userId);
        }
        return bookingRepository.findAllByUserId(userId).stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
    public BookingResponse createBooking(BookingCreateRequest request) {

        //1 tim user va dot di
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + request.getUserId()));
        TourDeparture tourDeparture = tourDepartureRepository.findByWithLock(request.getDepartureId())
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + request.getDepartureId()));
        //2 kiem tra ton kho ghe
        int totalGuest = request.getPassengers().size();
        if(totalGuest > tourDeparture.getAvailableSeats()){
            throw new RuntimeException("Số lượng hành khách vượt quá số ghế trống của đợt khởi hành.");
        }     

        //3 tru ghe trong kho va luu
        tourDeparture.setAvailableSeats(tourDeparture.getAvailableSeats()-totalGuest);
        tourDepartureRepository.save(tourDeparture);

        //4 kiem tra khuyen mai neu co
        Promotion promotion = null;
        if(request.getPromotionCode() != null && !request.getPromotionCode().isEmpty()) {
            promotion = promotionRepository.findByCode(request.getPromotionCode())
                    .orElseThrow(() -> new RuntimeException("Mã khuyến mãi không tồn tại."));
            if (promotion == null) {
                throw new RuntimeException("Mã khuyến mãi không tồn tại.");
            }
            if (promotion.getValidFrom().isAfter(LocalDateTime.now()) || promotion.getValidTo().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Mã khuyến mãi không còn hiệu lực.");
            }
            if (promotion.getUsageLimit() != null && promotion.getUsedCount() >= promotion.getUsageLimit()) {
                throw new RuntimeException("Mã khuyến mãi đã đạt giới hạn sử dụng.");
            }
            if (!promotion.getIsActive()) {
                throw new RuntimeException("Mã khuyến mãi không còn hiệu lực.");
            }
        }
        // 5. TẠO VÀ LƯU HÓA ĐƠN TRƯỚC (Để lấy ID cấp cho hành khách)
        String bookingCode = "BK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
         Booking booking = Booking.builder()
                .bookingCode(bookingCode) // ĐÃ THÊM MÃ CODE
                .user(user)
                .departure(tourDeparture)
                .promotion(promotion)
                .contactName(request.getContactName().trim())
                .contactPhone(request.getContactPhone().trim())
                .contactEmail(request.getContactEmail().trim())
                .contactAddress(request.getContactAddress())
                .specialRequests(request.getSpecialRequests())
                .totalPassengers(Integer.valueOf(totalGuest))
                .totalAmount(BigDecimal.ZERO) // Tạm gán 0, tính xong cập nhật lại
                .bookingStatus(BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        //6 Duyet vong lap va tinh tien ve tho
        BigDecimal subTotal = BigDecimal.ZERO;
        for (PassengerRequest passenger : request.getPassengers()) {
            BigDecimal price = BigDecimal.ZERO;
            if (passenger.getPassengerType() != PassengerType.ADULT) {
                price = tourDeparture.getChildPrice();

            } else {
                price = tourDeparture.getAdultPrice();
            }
            
            if(passenger.isRequiresSingleRoom() && tourDeparture.getSingleRoomSupplement() != null) {
                price = price.add(tourDeparture.getSingleRoomSupplement());
            }
            // Lưu hành khách vào DB với ID của hóa đơn vừa lưu!
            BookingPassenger bookingPassenger = bookingPassengerRepository.save(BookingPassenger.builder()
                    .booking(savedBooking) // GÁN ĐÍCH DANH HÓA ĐƠN ĐÃ LƯU!
                    .fullName(passenger.getFullName().trim())
                    .passengerType(passenger.getPassengerType())
                    .gender(passenger.getGender())
                    .birthDate(passenger.getBirthDate())
                    .idCardOrPassport(passenger.getIdCardOrPassport())
                    .requiresSingleRoom(passenger.isRequiresSingleRoom())
                    .price(price)
                    .build());
            savedBooking.getPassengers().add(bookingPassenger);
            subTotal = subTotal.add(price);
        }

        //7 tinh tien giam gia
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (promotion != null) {
            if (subTotal.compareTo(promotion.getMinOrderAmount()) < 0) {
                throw new RuntimeException("Tổng giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng mã khuyến mãi.");
            }
            if (promotion.getDiscountType() == DiscountType.PERCENTAGE) {
                // Nhân trước, chia sau và làm tròn 2 chữ số thập phân
                discountAmount = subTotal.multiply(promotion.getDiscountValue())
                         .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);                if (promotion.getMaxDiscountAmount() != null && discountAmount.compareTo(promotion.getMaxDiscountAmount()) > 0) {
                    discountAmount = promotion.getMaxDiscountAmount();
                }
            } else if (promotion.getDiscountType() == DiscountType.FIXED_AMOUNT) {
                discountAmount = promotion.getDiscountValue();
            }
            promotion.setUsedCount(promotion.getUsedCount() + 1);
            promotionRepository.save(promotion);
        }
        BigDecimal finalTotal = subTotal.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        savedBooking.setTotalAmount(finalTotal);
        bookingRepository.save(savedBooking); 
        
        return BookingResponse.fromEntity(savedBooking);
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = findBookingEntityById(id);
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Không thể thay đổi trạng thái của đơn đặt chỗ đã bị hủy.");
        }
        if(status == BookingStatus.CANCELLED){
            cancelBooking(id);
            return BookingResponse.fromEntity(findBookingEntityById(id));
        }
        booking.setBookingStatus(status);
        bookingRepository.save(booking);
        return BookingResponse.fromEntity(booking);
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
    public BookingResponse updatePaymentStatus(Long id, PaymentStatus status) {
        Booking booking = findBookingEntityById(id);
        booking.setPaymentStatus(status);
        bookingRepository.save(booking);
        return BookingResponse.fromEntity(booking);
    }
    @Override
    @Transactional (rollbackFor = Exception.class)
    public void cancelBooking(Long id) {
        Booking booking = findBookingEntityById(id);
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Không thể hủy đơn đặt chỗ đã bị hủy.");
        }
        booking.setBookingStatus(BookingStatus.CANCELLED);
        // Trả lại số ghế cho đợt khởi hành;
        TourDeparture tourDeparture = tourDepartureRepository.findByWithLock(booking.getDeparture().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đợt khởi hành với ID: " + booking.getDeparture().getId()));
        tourDeparture.setAvailableSeats(tourDeparture.getAvailableSeats() + booking.getTotalPassengers());
        tourDepartureRepository.save(tourDeparture);
        bookingRepository.save(booking);
    }
    public Booking findBookingEntityById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt với ID: " + id));
    }

}
