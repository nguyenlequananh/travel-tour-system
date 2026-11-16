package com.travelhub.repository;
import com.travelhub.entity.Booking;
import com.travelhub.enums.BookingStatus;
import com.travelhub.enums.PaymentStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
public interface BookingRepository extends JpaRepository<Booking, Long> {

   
    
    Optional<Booking> findBookingByBookingCode(String bookingCode);
    List<Booking> findAllByUserId(Long userId);
     // 1. Tính tổng doanh thu thực tế (chỉ tính đơn PAID)
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.paymentStatus = 'PAID'")
    BigDecimal calculateTotalRevenue();

    // 2. Tính tổng số lượt hành khách đã đi tour
    @Query("SELECT COALESCE(SUM(b.totalPassengers), 0) FROM Booking b WHERE b.bookingStatus != 'CANCELLED'")
    Long calculateTotalPassengers();

    // 3. Đếm số đơn theo trạng thái (Dùng quy tắc đặt tên của JPA)
    long countByBookingStatus(BookingStatus bookingStatus);

    // 4. Doanh thu theo từng tháng trong năm (Native Query nhóm theo tháng 1 -> 12)
    @Query(value = "SELECT MONTH(booking_date) AS month, SUM(total_amount) AS revenue " +
                   "FROM bookings " +
                   "WHERE YEAR(booking_date) = :year AND payment_status = 'PAID' " +
                   "GROUP BY MONTH(booking_date) " +
                   "ORDER BY month ASC", nativeQuery = true)
    List<Object[]> getMonthlyRevenueByYear( int year);

    // 5. Tìm Top Tour bán chạy nhất (Tính theo tổng số khách đặt)
    @Query("SELECT t.id, t.tourCode, t.name, COUNT(b.id), SUM(b.totalAmount) " +
           "FROM Booking b " +
           "JOIN b.departure d " +
           "JOIN d.tour t " +
           "WHERE b.bookingStatus != 'CANCELLED' " +
           "GROUP BY t.id, t.tourCode, t.name " +
           "ORDER BY COUNT(b.id) DESC")
    List<Object[]> findTopSellingTours(Pageable pageable);

       // ================= BỘ LỌC ĐA TIÊU CHÍ VÀ PHÂN TRANG CHO BOOKINGS =================
    @Query("SELECT b FROM Booking b WHERE " +
           "(:bookingStatus IS NULL OR b.bookingStatus = :bookingStatus) AND " +
           "(:paymentStatus IS NULL OR b.paymentStatus = :paymentStatus) AND " +
           "(:keyword IS NULL OR " +
           "   LOWER(b.bookingCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(b.contactName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "   LOWER(b.contactEmail) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Booking> filterBookings(
            @Param("keyword") String keyword,
            @Param("bookingStatus") BookingStatus bookingStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            Pageable pageable
    );
    List<Booking> findConfirmedBookingsByDepartureId(Long departureId);
        // 👉 TÌM CÁC ĐƠN PENDING, UNPAID QUÁ HẠN (JOIN FETCH DEPARTURE ĐỂ TRÁNH LỖI N+1)
    @Query("SELECT b FROM Booking b JOIN FETCH b.departure d WHERE b.bookingStatus = :bookingStatus AND b.paymentStatus = :paymentStatus AND b.createdAt <= :expirationTime")
    List<Booking> findExpiredBookings(
            @Param("bookingStatus") BookingStatus bookingStatus,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("expirationTime") java.time.LocalDateTime expirationTime);
}
