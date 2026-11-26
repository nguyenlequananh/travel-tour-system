package com.travelhub.dto.response;

import com.travelhub.enums.Gender;
import com.travelhub.enums.PassengerType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GuidePassengerResponse {
    private Long passengerId;
    private String bookingCode;          // Mã đơn vé
    private String fullName;             // Tên hành khách
    private PassengerType passengerType; // Người lớn / Trẻ em
    private Gender gender;               // Giới tính
    private LocalDate birthDate;         // Ngày sinh
    private String idCardOrPassport;     // CCCD / Hộ chiếu
    private Boolean requiresSingleRoom;  // Có yêu cầu phòng đơn không

    // Thông tin người đại diện đặt vé (để HDV gọi điện khi cần)
    private String contactName;
    private String contactPhone;

    // Thông tin điểm đón của khách này
    private String pickupLocationName;   // Điểm đón đã chọn
    private LocalTime pickupTime;        // Giờ đón xe
}