package com.travelhub.slice.controller;

import com.travelhub.controller.common.AuthController;
import com.travelhub.dto.request.LoginRequest;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.response.AuthResponse;
import com.travelhub.security.JwtAuthenticationFilter;
import com.travelhub.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Slice Test (@WebMvcTest) - Kiểm thử tầng Controller Xác thực & Validation (AuthController)")
class AuthControllerSliceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /api/v1/auth/login - Khi JSON hợp lệ phải trả về HTTP 200 kèm JWT token")
    void login_KhiDuLieuHopLe_TraVe200VaJwtToken() throws Exception {
        // GIVEN
        AuthResponse mockResp = AuthResponse.builder()
                .id(1L)
                .fullName("Nguyễn Văn A")
                .email("user@travelhub.vn")
                .roles(List.of("ROLE_CUSTOMER"))
                .token("jwt-access-token")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(mockResp);

        String requestBody = """
                {
                  "email": "user@travelhub.vn",
                  "password": "password123"
                }
                """;

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(200))
                .andExpect(jsonPath("$.data.token").value("jwt-access-token"))
                .andExpect(jsonPath("$.data.email").value("user@travelhub.vn"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Khi email sai định dạng phải bị @Valid chặn lại trả về 400 và không gọi AuthService")
    void login_KhiEmailSaiDinhDang_ValidationChanLaiTraVe400VaKhongGoiService() throws Exception {
        // GIVEN: Email không đúng định dạng @Email
        String invalidBody = """
                {
                  "email": "email-khong-hop-le",
                  "password": "password123"
                }
                """;

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Email không đúng định dạng"));

        // Đảm bảo lớp Controller đã chặn ngay ở cửa ngõ @Valid, tuyệt đối không gọi xuống tầng Service
        verifyNoInteractions(authService);
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Khi dữ liệu đăng ký hợp lệ phải trả về HTTP 201 Created")
    void register_KhiDuLieuHopLe_TraVe201CreatedVaThongTinNguoiDung() throws Exception {
        // GIVEN
        AuthResponse mockResp = AuthResponse.builder()
                .id(2L)
                .fullName("Trần Thị Mới")
                .email("moi@travelhub.vn")
                .roles(List.of("ROLE_CUSTOMER"))
                .token("new-jwt-token")
                .build();

        when(authService.register(any(UserCreateRequest.class))).thenReturn(mockResp);

        String requestBody = """
                {
                  "fullName": "Trần Thị Mới",
                  "email": "moi@travelhub.vn",
                  "password": "password123",
                  "phoneNumber": "0909888777"
                }
                """;

        // WHEN & THEN
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value(201))
                .andExpect(jsonPath("$.data.id").value(2))
                .andExpect(jsonPath("$.data.token").value("new-jwt-token"));
    }
}
