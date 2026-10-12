package com.travelhub.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelhub.dto.request.PaymentCreateRequest;
import com.travelhub.dto.response.PaymentResponse;
import com.travelhub.entity.Booking;
import com.travelhub.entity.Payment;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PaymentStatus;
import com.travelhub.enums.TransactionStatus;
import com.travelhub.repository.BookingRepository;
import com.travelhub.repository.PaymentRepository;
import com.travelhub.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        return PaymentResponse.fromEntity(paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với ID: " + id)));
    }

    @Override
    @Transactional (readOnly = true)
    public List<PaymentResponse> getPaymentsByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional (rollbackFor = Exception.class)
    public PaymentResponse processPayment(PaymentCreateRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt với ID: " + request.getBookingId()));
        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Đơn đặt này đã được hủy.");
        }
        if(booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new RuntimeException("Đơn đặt đã được thanh toán đầy đủ.");
        }
         if(booking.getPaymentStatus() == PaymentStatus.REFUNDED) {
            throw new RuntimeException("Đơn đặt này da được hoàn tiền, không thể thanh toán.");   
        }
        List<Payment> existingPayments = paymentRepository.findByBookingId(booking.getId());
        BigDecimal totalAmount = BigDecimal.ZERO;
        for(Payment payment : existingPayments){
            totalAmount = totalAmount.add(payment.getAmount());
        }
        totalAmount = totalAmount.add(request.getAmount());

        if(totalAmount.compareTo(booking.getTotalAmount()) > 0){
            throw new RuntimeException("Số tiền thanh toán vượt quá tổng số tiền cần thanh toán.");
        }
        if(totalAmount.compareTo(booking.getTotalAmount()) == 0){
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setBookingStatus(BookingStatus.CONFIRMED);
        } else {
            booking.setPaymentStatus(PaymentStatus.DEPOSITED);
        }

        bookingRepository.save(booking);

        String transactionCode = "PAY-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentType(request.getPaymentType())
                .gatewayResponseCode(request.getGatewayResponseCode())
                .paymentTime(LocalDateTime.now())
                .status(TransactionStatus.SUCCESS)
                .transactionCode(transactionCode)
                .build();
        paymentRepository.save(payment);
        return PaymentResponse.fromEntity(payment);
    }
}
