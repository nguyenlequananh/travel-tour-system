package com.travelhub.batch;

import com.travelhub.dto.request.DepartureCsvRow;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.repository.TourRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Mắt xích số 2 của Spring Batch:
 * Kiểm tra hợp lệ từng dòng CSV, tra cứu Tour theo mã và tự động tính returnDate = departureDate + (durationDays - 1).
 */
@Component
@RequiredArgsConstructor
public class DepartureItemProcessor implements ItemProcessor<DepartureCsvRow, TourDeparture> {

    private final TourRepository tourRepository;

    @Override
    public TourDeparture process(DepartureCsvRow row) {
        String tourCode = row.getTourCode() != null
                ? row.getTourCode().replace("\uFEFF", "").trim()
                : "";
        if (tourCode.isEmpty()) {
            throw new IllegalArgumentException("Mã tour (tourCode) không được để trống");
        }

        Tour tour = tourRepository.findByTourCode(tourCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tour với mã: " + tourCode));

        if (row.getDepartureDate() == null || row.getDepartureDate().isBlank()) {
            throw new IllegalArgumentException("Ngày khởi hành không được để trống");
        }
        LocalDate departureDate;
        try {
            departureDate = LocalDate.parse(row.getDepartureDate().trim());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Ngày khởi hành sai định dạng YYYY-MM-DD: " + row.getDepartureDate());
        }

        if (departureDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Ngày khởi hành " + departureDate + " đang nằm trong quá khứ");
        }

        BigDecimal adultPrice = parseBigDecimal(row.getAdultPrice(), "Giá người lớn");
        BigDecimal childPrice = parseBigDecimal(row.getChildPrice(), "Giá trẻ em");
        BigDecimal singleRoom = (row.getSingleRoomSupplement() != null && !row.getSingleRoomSupplement().isBlank())
                ? parseBigDecimal(row.getSingleRoomSupplement(), "Phụ thu phòng đơn")
                : BigDecimal.ZERO;

        int maxSeats;
        try {
            maxSeats = Integer.parseInt(row.getMaxSeats().trim());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Số chỗ mở bán không hợp lệ: " + row.getMaxSeats());
        }

        if (adultPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá người lớn phải lớn hơn 0");
        }
        if (childPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Giá trẻ em không được âm");
        }
        if (singleRoom.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Phụ thu phòng đơn không được âm");
        }
        if (maxSeats < 1) {
            throw new IllegalArgumentException("Tổng số chỗ mở bán tối thiểu là 1");
        }

        int durationDays = (tour.getDurationDays() != null && tour.getDurationDays() > 0)
                ? tour.getDurationDays()
                : 1;
        LocalDate returnDate = departureDate.plusDays(durationDays - 1L);

        return TourDeparture.builder()
                .tour(tour)
                .departureDate(departureDate)
                .returnDate(returnDate)
                .adultPrice(adultPrice)
                .childPrice(childPrice)
                .singleRoomSupplement(singleRoom)
                .maxSeats(maxSeats)
                .availableSeats(maxSeats)
                .status(DepartureStatus.OPEN)
                .build();
    }

    private BigDecimal parseBigDecimal(String raw, String fieldLabel) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(fieldLabel + " không được để trống");
        }
        try {
            return new BigDecimal(raw.trim());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(fieldLabel + " không phải số hợp lệ: " + raw);
        }
    }
}
