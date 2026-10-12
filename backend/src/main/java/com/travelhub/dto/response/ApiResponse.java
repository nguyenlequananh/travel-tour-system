package com.travelhub.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiResponse<T> {
    private int status;       // 200, 400, 404, 500
    private String message;   // "Thành công", "Lỗi dữ liệu", ...
    private T data;           // Dữ liệu thực tế gửi về cho React
}