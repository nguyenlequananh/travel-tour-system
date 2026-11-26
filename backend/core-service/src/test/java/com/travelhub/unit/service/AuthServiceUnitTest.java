package com.travelhub.unit.service;

import com.travelhub.dto.request.LoginRequest;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.response.AuthResponse;
import com.travelhub.entity.Role;
import com.travelhub.entity.User;
import com.travelhub.repository.RoleRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.security.JwtUtils;
import com.travelhub.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Test - Nghiệp vụ Xác thực (AuthServiceImpl)")
class AuthServiceUnitTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private User activeUser;
    private Role customerRole;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder().id(1).name("ROLE_CUSTOMER").build();
        activeUser = User.builder()
                .id(1L)
                .fullName("Nguyễn Văn A")
                .email("khachhang@travelhub.vn")
                .password("$2a$10$encodedPassword")
                .phoneNumber("0909123456")
                .isActive(true)
                .roles(new HashSet<>(Set.of(customerRole)))
                .build();
    }

    @Test
    @DisplayName("login - Khi email và mật khẩu chính xác phải trả về AuthResponse kèm JWT token")
    void login_KhiThongTinHopLe_TraVeAuthResponseVaJwtToken() {
        // GIVEN
        LoginRequest request = new LoginRequest();
        request.setEmail("khachhang@travelhub.vn");
        request.setPassword("123456");

        when(userRepository.existsByEmail("khachhang@travelhub.vn")).thenReturn(true);
        when(userRepository.findByEmail("khachhang@travelhub.vn")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("123456", "$2a$10$encodedPassword")).thenReturn(true);
        when(jwtUtils.generateToken(activeUser)).thenReturn("mocked-jwt-token");

        // WHEN
        AuthResponse response = authService.login(request);

        // THEN
        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        assertEquals("khachhang@travelhub.vn", response.getEmail());
        assertTrue(response.getRoles().contains("ROLE_CUSTOMER"));
        verify(jwtUtils, times(1)).generateToken(activeUser);
    }

    @Test
    @DisplayName("login - Khi mật khẩu sai phải ném RuntimeException và không sinh JWT token")
    void login_KhiSaiMatKhau_NemRaRuntimeException() {
        // GIVEN
        LoginRequest request = new LoginRequest();
        request.setEmail("khachhang@travelhub.vn");
        request.setPassword("sai-mat-khau");

        when(userRepository.existsByEmail("khachhang@travelhub.vn")).thenReturn(true);
        when(userRepository.findByEmail("khachhang@travelhub.vn")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("sai-mat-khau", "$2a$10$encodedPassword")).thenReturn(false);

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("Mật khẩu không đúng"));
        verify(jwtUtils, never()).generateToken(any());
    }

    @Test
    @DisplayName("login - Khi tài khoản đã bị vô hiệu hóa phải ném RuntimeException")
    void login_KhiTaiKhoanBiVoHieuHoa_NemRaRuntimeException() {
        // GIVEN
        activeUser.setIsActive(false);
        LoginRequest request = new LoginRequest();
        request.setEmail("khachhang@travelhub.vn");
        request.setPassword("123456");

        when(userRepository.existsByEmail("khachhang@travelhub.vn")).thenReturn(true);
        when(userRepository.findByEmail("khachhang@travelhub.vn")).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("123456", "$2a$10$encodedPassword")).thenReturn(true);

        // WHEN & THEN
        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("vô hiệu hóa"));
        verify(jwtUtils, never()).generateToken(any());
    }

    @Test
    @DisplayName("register - Khi email chưa tồn tại phải băm mật khẩu, gán ROLE_CUSTOMER và lưu User")
    void register_KhiEmailChuaTonTai_BamMatKhauGanQuyenVaLuuUser() {
        // GIVEN
        UserCreateRequest request = new UserCreateRequest();
        request.setFullName("  Trần Thị B  ");
        request.setEmail("  NewUser@TravelHub.VN ");
        request.setPassword("secret123");
        request.setPhoneNumber("0912345678");

        when(userRepository.existsByEmail("newuser@travelhub.vn")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$hashed");
        when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User saved = inv.getArgument(0);
            saved.setId(99L);
            return saved;
        });
        when(jwtUtils.generateToken(any(User.class))).thenReturn("new-user-jwt");

        // WHEN
        AuthResponse response = authService.register(request);

        // THEN
        assertEquals(99L, response.getId());
        assertEquals("newuser@travelhub.vn", response.getEmail());
        assertEquals("Trần Thị B", response.getFullName());
        assertEquals("new-user-jwt", response.getToken());
        verify(passwordEncoder, times(1)).encode("secret123");
        verify(userRepository, times(1)).save(any(User.class));
    }
}
