package com.travelhub.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    
    // ĐỔI THÀNH DANH SÁCH MẢNG CÁC QUYỀN
    private List<String> roles; // Chứa: ["ROLE_ADMIN", "ROLE_CUSTOMER", ...]
    
    private String token;
}