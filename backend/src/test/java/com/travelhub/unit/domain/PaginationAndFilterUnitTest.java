package com.travelhub.unit.domain;

import com.travelhub.dto.common.BasePaginationRequest;
import com.travelhub.dto.filter.BookingFilterRequest;
import com.travelhub.dto.filter.NotificationFilterRequest;
import com.travelhub.dto.filter.PaymentFilterRequest;
import com.travelhub.dto.filter.TourFilterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Test - Phân trang & Quy tắc sắp xếp mặc định của các FilterRequest")
class PaginationAndFilterUnitTest {

    @Test
    @DisplayName("toPageable - Khi order là ASC phải tạo Pageable sắp xếp tăng dần")
    void toPageable_KhiOrderLaAsc_TraVeSortTangDan() {
        // GIVEN
        BasePaginationRequest request = new BasePaginationRequest();
        request.setPage(1);
        request.setSize(20);
        request.setSortBy("name");
        request.setOrder("ASC");

        // WHEN
        Pageable pageable = request.toPageable();

        // THEN
        assertEquals(1, pageable.getPageNumber());
        assertEquals(20, pageable.getPageSize());
        Sort.Order sortOrder = pageable.getSort().getOrderFor("name");
        assertNotNull(sortOrder);
        assertEquals(Sort.Direction.ASC, sortOrder.getDirection());
    }

    @Test
    @DisplayName("toPageable - Khi order là DESC phải tạo Pageable sắp xếp giảm dần")
    void toPageable_KhiOrderLaDesc_TraVeSortGiamDan() {
        // GIVEN
        BasePaginationRequest request = new BasePaginationRequest();
        request.setPage(0);
        request.setSize(10);
        request.setSortBy("createdAt");
        request.setOrder("DESC");

        // WHEN
        Pageable pageable = request.toPageable();

        // THEN
        Sort.Order sortOrder = pageable.getSort().getOrderFor("createdAt");
        assertNotNull(sortOrder);
        assertEquals(Sort.Direction.DESC, sortOrder.getDirection());
    }

    @Test
    @DisplayName("TourFilterRequest - Mặc định phải sắp xếp theo id DESC để tour mới nhất lên đầu")
    void tourFilterRequest_KhiKhoiTaoMacDinh_SapXepTheoIdGiamDan() {
        // WHEN
        TourFilterRequest filter = new TourFilterRequest();
        Pageable pageable = filter.toPageable();

        // THEN
        assertEquals("id", filter.getSortBy());
        assertEquals("DESC", filter.getOrder());
        assertEquals(Sort.Direction.DESC, pageable.getSort().getOrderFor("id").getDirection());
    }

    @Test
    @DisplayName("BookingFilterRequest - Mặc định phải sắp xếp theo createdAt DESC để đơn mới đặt lên đầu")
    void bookingFilterRequest_KhiKhoiTaoMacDinh_SapXepTheoCreatedAtGiamDan() {
        // WHEN
        BookingFilterRequest filter = new BookingFilterRequest();
        Pageable pageable = filter.toPageable();

        // THEN
        assertEquals("createdAt", filter.getSortBy());
        assertEquals("DESC", filter.getOrder());
        assertEquals(Sort.Direction.DESC, pageable.getSort().getOrderFor("createdAt").getDirection());
    }

    @Test
    @DisplayName("PaymentFilterRequest & NotificationFilterRequest - Mặc định sắp xếp thời gian mới nhất lên đầu")
    void paymentVaNotificationFilter_KhiKhoiTaoMacDinh_SapXepMoiNhatLenDau() {
        // WHEN
        PaymentFilterRequest paymentFilter = new PaymentFilterRequest();
        NotificationFilterRequest notificationFilter = new NotificationFilterRequest();

        // THEN
        assertEquals("paymentTime", paymentFilter.getSortBy());
        assertEquals("DESC", paymentFilter.getOrder());
        assertEquals("createdAt", notificationFilter.getSortBy());
        assertEquals("DESC", notificationFilter.getOrder());
    }
}
