package com.travelhub.mock;

import com.travelhub.dto.request.LoginRequest;
import com.travelhub.dto.request.UserCreateRequest;
import com.travelhub.dto.response.AuthResponse;
import com.travelhub.entity.Role;
import com.travelhub.entity.User;
import com.travelhub.repository.RoleRepository;
import com.travelhub.repository.UserRepository;
import com.travelhub.security.JwtUtils;
import com.travelhub.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

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

    private User mockUser;
    private Role mockRole;

    @BeforeEach
    public void setUp() {
        mockRole = Role.builder().id(1).name("ROLE_CUSTOMER").build();
        mockUser = User.builder()
                .id(1L)
                .fullName("Nguyễn Văn A")
                .email("a@gmail.com")
                .password("encoded_password")
                .isActive(true)
                .roles(Set.of(mockRole))
                .build();
    }

    // 1. TEST ĐĂNG NHẬP THÀNH CÔNG
    @Test
    public void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("a@gmail.com");
        request.setPassword("123456");

        Mockito.when(userRepository.existsByEmail("a@gmail.com")).thenReturn(true);
        Mockito.when(userRepository.findByEmail("a@gmail.com")).thenReturn(Optional.of(mockUser));
        Mockito.when(passwordEncoder.matches("123456", "encoded_password")).thenReturn(true);
        Mockito.when(jwtUtils.generateToken(mockUser)).thenReturn("mock_jwt_token");

        AuthResponse response = authService.login(request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals("mock_jwt_token", response.getToken());
        Assertions.assertEquals("a@gmail.com", response.getEmail());
    }

    // 2. TEST ĐĂNG NHẬP SAI MẬT KHẨU -> THẮT BẠI
    @Test
    public void testLogin_WrongPassword_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("a@gmail.com");
        request.setPassword("wrong_pass");

        Mockito.when(userRepository.existsByEmail("a@gmail.com")).thenReturn(true);
        Mockito.when(userRepository.findByEmail("a@gmail.com")).thenReturn(Optional.of(mockUser));
        Mockito.when(passwordEncoder.matches("wrong_pass", "encoded_password")).thenReturn(false);

        Exception exception = Assertions.assertThrows(RuntimeException.class, () -> {
            authService.login(request);
        });

        Assertions.assertEquals("Mật khẩu không đúng!", exception.getMessage());
    }

    // 3. TEST ĐĂNG KÝ TÀI KHOẢN MỚI THÀNH CÔNG
    @Test
    public void testRegister_Success() {
        UserCreateRequest request = new UserCreateRequest();
        request.setFullName("Người Dùng Mới");
        request.setEmail("new@gmail.com");
        request.setPassword("123456");

        Mockito.when(userRepository.existsByEmail("new@gmail.com")).thenReturn(false);
        Mockito.when(passwordEncoder.encode("123456")).thenReturn("encoded_new_pass");
        Mockito.when(roleRepository.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(mockRole));
        Mockito.when(userRepository.save(Mockito.any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });
        Mockito.when(jwtUtils.generateToken(Mockito.any(User.class))).thenReturn("new_jwt_token");

        AuthResponse response = authService.register(request);

        Assertions.assertNotNull(response);
        Assertions.assertEquals("new@gmail.com", response.getEmail());
        Mockito.verify(userRepository, Mockito.times(1)).save(Mockito.any(User.class));
    }
}