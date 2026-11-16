package com.travelhub.dto.request;

import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PaymentStatus;

import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
public class BookingFilterRequest extends BasePaginationRequest {
    private String keyword;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
}
