package com.travelhub.unit.domain;

import com.travelhub.config.VnPayConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Test - Thuật toán chữ ký bảo mật VNPay (HMAC-SHA512)")
class VnPayConfigUnitTest {

    @Test
    @DisplayName("hmacSHA512 - Cùng khóa bí mật và dữ liệu phải sinh ra chuỗi chữ ký giống hệt nhau")
    void hmacSHA512_KhiDuLieuGiongNhau_TraVeChuKyGiongNhau() {
        // GIVEN
        String secretKey = "TRAVELHUB_SECRET_KEY_2026";
        String rawData = "vnp_Amount=500000000&vnp_ResponseCode=00&vnp_TxnRef=BK-2026001";

        // WHEN
        String hash1 = VnPayConfig.hmacSHA512(secretKey, rawData);
        String hash2 = VnPayConfig.hmacSHA512(secretKey, rawData);

        // THEN
        assertNotNull(hash1);
        assertEquals(128, hash1.length(), "Chữ ký HMAC-SHA512 dạng hex phải dài đúng 128 ký tự");
        assertEquals(hash1, hash2);
    }

    @Test
    @DisplayName("hmacSHA512 - Dữ liệu bị sửa đổi dù chỉ 1 ký tự phải cho chữ ký khác hoàn toàn")
    void hmacSHA512_KhiDuLieuBiThayDoi_TraVeChuKyKhacNhau() {
        // GIVEN
        String secretKey = "TRAVELHUB_SECRET_KEY_2026";
        String originalData = "vnp_Amount=500000000&vnp_TxnRef=BK-2026001";
        String tamperedData = "vnp_Amount=100000000&vnp_TxnRef=BK-2026001";

        // WHEN
        String originalHash = VnPayConfig.hmacSHA512(secretKey, originalData);
        String tamperedHash = VnPayConfig.hmacSHA512(secretKey, tamperedData);

        // THEN
        assertNotEquals(originalHash, tamperedHash);
    }

    @Test
    @DisplayName("hmacSHA512 - Khóa bí mật khác nhau phải sinh ra chữ ký khác nhau")
    void hmacSHA512_KhiSecretKeyKhacNhau_TraVeChuKyKhacNhau() {
        // GIVEN
        String rawData = "vnp_Amount=500000000&vnp_TxnRef=BK-2026001";

        // WHEN
        String hashWithKeyA = VnPayConfig.hmacSHA512("SECRET_KEY_A", rawData);
        String hashWithKeyB = VnPayConfig.hmacSHA512("SECRET_KEY_B", rawData);

        // THEN
        assertNotEquals(hashWithKeyA, hashWithKeyB);
    }

    @Test
    @DisplayName("hmacSHA512 - Khi key hoặc data bị null phải trả về chuỗi rỗng an toàn")
    void hmacSHA512_KhiKeyHoacDataNull_TraVeChuoiRong() {
        // WHEN
        String hashWithNullKey = VnPayConfig.hmacSHA512(null, "data");
        String hashWithNullData = VnPayConfig.hmacSHA512("secret", null);

        // THEN
        assertEquals("", hashWithNullKey);
        assertEquals("", hashWithNullData);
    }
}
