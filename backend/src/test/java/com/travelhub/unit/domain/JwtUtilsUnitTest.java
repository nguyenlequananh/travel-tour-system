package com.travelhub.unit.domain;

import com.travelhub.entity.Role;
import com.travelhub.entity.User;
import com.travelhub.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Test - Tiện ích tạo và xác thực JWT (JwtUtils)")
class JwtUtilsUnitTest {

    private JwtUtils jwtUtils;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
        // Tiêm giá trị @Value bằng ReflectionTestUtils (không cần khởi động Spring Context)
        ReflectionTestUtils.setField(
                jwtUtils,
                "jwtSecret",
                "TravelHubUnitTestSecretKeyMustBeAtLeast32BytesLongForHS256!"
        );
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000L);

        Role customerRole = Role.builder().id(1).name("ROLE_CUSTOMER").build();
        sampleUser = User.builder()
                .id(10L)
                .fullName("Nguyễn Văn Test")
                .email("customer@travelhub.vn")
                .roles(Set.of(customerRole))
                .build();
    }

    @Test
    @DisplayName("generateToken - Khi User hợp lệ phải tạo được JWT và trích xuất lại đúng email")
    void generateToken_KhiUserHopLe_TaoDuocTokenVaTrichXuatDungEmail() {
        // WHEN
        String token = jwtUtils.generateToken(sampleUser);
        String extractedEmail = jwtUtils.getEmailFromToken(token);

        // THEN
        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals("customer@travelhub.vn", extractedEmail);
    }

    @Test
    @DisplayName("validateToken - Khi token hợp lệ và còn hạn phải trả về true")
    void validateToken_KhiTokenHopLe_TraVeTrue() {
        // GIVEN
        String token = jwtUtils.generateToken(sampleUser);

        // WHEN
        boolean valid = jwtUtils.validateToken(token);

        // THEN
        assertTrue(valid);
    }

    @Test
    @DisplayName("validateToken - Khi token bị giả mạo chữ ký hoặc sai định dạng phải trả về false")
    void validateToken_KhiTokenBiSuaDoiHoacSaiDinhDang_TraVeFalse() {
        // GIVEN
        String validToken = jwtUtils.generateToken(sampleUser);
        String tamperedToken = validToken + "tampered";

        // WHEN & THEN
        assertFalse(jwtUtils.validateToken(tamperedToken));
        assertFalse(jwtUtils.validateToken("chuoi.khong.hop.le"));
        assertFalse(jwtUtils.validateToken(""));
    }

    @Test
    @DisplayName("validateToken - Khi token đã hết hạn phải trả về false")
    void validateToken_KhiTokenDaHetHan_TraVeFalse() {
        // GIVEN: Thiết lập thời hạn âm để sinh ra token đã hết hạn ngay lập tức
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -1000L);
        String expiredToken = jwtUtils.generateToken(sampleUser);

        // WHEN
        boolean valid = jwtUtils.validateToken(expiredToken);

        // THEN
        assertFalse(valid);
    }
}
