package com.travelhub.dto.filter;

import com.travelhub.dto.common.BasePaginationRequest;

import com.travelhub.enums.PaymentMethod;
import com.travelhub.enums.TransactionStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentFilterRequest extends BasePaginationRequest {
    private String keyword;               // Tìm kiếm theo mã giao dịch (transactionCode) hoặc mã đơn hàng
    private PaymentMethod paymentMethod;  // Lọc theo phương thức (VNPAY, MOMO, CASH...)
    private TransactionStatus status;     // Lọc theo trạng thái giao dịch (SUCCESS, FAILED, PENDING)

    public PaymentFilterRequest() {
        	setSortBy("paymentTime"); 
            setOrder("DESC");   
    }
}