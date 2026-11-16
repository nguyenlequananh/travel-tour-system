package com.travelhub.mock;

import com.travelhub.dto.request.TourDepartureCreateRequest;
import com.travelhub.dto.request.TourDepartureUpdateRequest;
import com.travelhub.dto.response.TourDepartureResponse;
import com.travelhub.entity.Tour;
import com.travelhub.entity.TourDeparture;
import com.travelhub.enums.DepartureStatus;
import com.travelhub.repository.TourDepartureRepository;
import com.travelhub.repository.TourRepository;
import com.travelhub.service.impl.TourDepartureServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class TourDepartureServiceTest {

    @Mock
    private TourDepartureRepository departureRepository;

    @Mock
    private TourRepository tourRepository;

    @InjectMocks
    private TourDepartureServiceImpl departureService;

    private Tour mockTour;
    private TourDeparture mockDeparture;

    @BeforeEach
    public void setUp() {
        mockTour = Tour.builder()
                .id(1L)
                .name("Tour Phú Quốc")
                .tourCode("TO-PHUQUOC")
                .build();

        mockDeparture = TourDeparture.builder()
                .id(1L)
                .tour(mockTour)
                .departureDate(LocalDate.now().plusDays(10))
                .returnDate(LocalDate.now().plusDays(13))
                .adultPrice(BigDecimal.valueOf(5000000))
                .childPrice(BigDecimal.valueOf(2500000))
                .maxSeats(30)
                .availableSeats(25) // Đã đặt 5 chỗ (30 - 25 = 5)
                .status(DepartureStatus.OPEN)
                .build();
    }

    // 1. TEST LẤY DANH SÁCH ĐỢT KHỞI HÀNH CỦA 1 TOUR
    @Test
    public void testGetDeparturesByTourId_Success() {
        Mockito.when(departureRepository.findAllByTourId(1L)).thenReturn(List.of(mockDeparture));

        List<TourDepartureResponse> responses = departureService.getDeparturesByTourId(1L);

        Assertions.assertNotNull(responses);
        Assertions.assertEquals(1, responses.size());
        Assertions.assertEquals(BigDecimal.valueOf(5000000.00), responses.get(0).getAdultPrice());
    }

    // 2. TEST MỞ BÁN ĐỢT KHỞI HÀNH MỚI (SUCCESS)
    @Test
    public void testCreateDeparture_Success() {
        TourDepartureCreateRequest request = new TourDepartureCreateRequest();
        request.setTourId(1L);
        request.setDepartureDate(LocalDate.now().plusDays(30));
        request.setReturnDate(LocalDate.now().plusDays(33));
        request.setAdultPrice(BigDecimal.valueOf(6000000));
        request.setChildPrice(BigDecimal.valueOf(3000000));
        request.setMaxSeats(20);

        Mockito.when(tourRepository.findById(1L)).thenReturn(Optional.of(mockTour));
        Mockito.when(departureRepository.save(Mockito.any(TourDeparture.class))).thenAnswer(invocation -> {
            TourDeparture d = invocation.getArgument(0);
            d.setId(10L);
            d.setAvailableSeats(d.getMaxSeats()); // Logic service tự gán availableSeats = maxSeats
            return d;
        });

        TourDepartureResponse response = departureService.createDeparture(request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(20, response.getMaxSeats());
        Assertions.assertEquals(20, response.getAvailableSeats()); // Kiểm tra ghế trống ban đầu phải bằng maxSeats
        Assertions.assertEquals(DepartureStatus.OPEN, response.getStatus());
    }

    // 3. TEST CẬP NHẬT ĐỢT KHỞI HÀNH THÀNH CÔNG
    @Test
    public void testUpdateDeparture_Success() {
        TourDepartureUpdateRequest request = new TourDepartureUpdateRequest();
        request.setDepartureDate(LocalDate.now().plusDays(15));
        request.setReturnDate(LocalDate.now().plusDays(18));
        request.setAdultPrice(BigDecimal.valueOf(5500000));
        request.setChildPrice(BigDecimal.valueOf(2700000));
        request.setMaxSeats(35); // Tăng số chỗ tối đa lên 35
        request.setStatus(DepartureStatus.OPEN);

        Mockito.when(departureRepository.findById(1L)).thenReturn(Optional.of(mockDeparture));
        Mockito.when(departureRepository.save(Mockito.any(TourDeparture.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TourDepartureResponse response = departureService.updateDeparture(1L, request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals(35, response.getMaxSeats());
        // Số ghế đã đặt cũ là 5 (30 - 25). MaxSeats mới là 35 => AvailableSeats mới phải là 35 - 5 = 30
        Assertions.assertEquals(30, response.getAvailableSeats());
    }

    // 4. TEST CẬP NHẬT THẤT BẠI DO GIẢM SỐ CHỖ TỐI ĐA NHỎ HƠN SỐ KHÁCH ĐÃ ĐẶT
    @Test
    public void testUpdateDeparture_ReduceMaxSeatsBelowBooked_ThrowsException() {
        // mockDeparture đang có maxSeats = 30, availableSeats = 25 -> Số khách đã đặt là: 30 - 25 = 5 người.
        
        TourDepartureUpdateRequest request = new TourDepartureUpdateRequest();
        request.setDepartureDate(LocalDate.now().plusDays(15));
        request.setReturnDate(LocalDate.now().plusDays(18));
        request.setAdultPrice(BigDecimal.valueOf(5500000));
        request.setChildPrice(BigDecimal.valueOf(2700000));
        request.setMaxSeats(3); // Cố tình giảm maxSeats xuống 3 (nhỏ hơn 5 người đã đặt)
        request.setStatus(DepartureStatus.OPEN);

        Mockito.when(departureRepository.findById(1L)).thenReturn(Optional.of(mockDeparture));

        Exception exception = Assertions.assertThrows(RuntimeException.class, () -> {
            departureService.updateDeparture(1L, request);
        });

        Assertions.assertTrue(exception.getMessage().contains("quá số chỗ đã được đặt"));
    }
}