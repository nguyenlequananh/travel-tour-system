-- =========================================================================================
-- FILE SQL NẠP DỮ LIỆU TOUR DU LỊCH THỰC TẾ & ẢNH HD CHO DỰ ÁN TRAVELHUB ENTERPRISE
-- Tác giả: Antigravity Assistant & Nguyen Le Quan Anh
-- Cách dùng: Mở phpMyAdmin / HeidiSQL / MySQL Workbench -> Chọn database travel_enterprise_db -> Import file này
-- =========================================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. XÓA DỮ LIỆU CŨ CÁC BẢNG TOUR VÀ ĐƠN TEST (GIỮ NGUYÊN BẢNG USERS, ROLES)
DELETE FROM booking_cancellations;
DELETE FROM booking_passengers;
DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM promotions;

DELETE FROM tour_pickup_points;
DELETE FROM tour_policies;
DELETE FROM tour_images;
DELETE FROM tour_itineraries;
DELETE FROM tour_departures;
DELETE FROM tours;
DELETE FROM tour_categories;

-- Reset AUTO_INCREMENT để ID bắt đầu từ 1
ALTER TABLE tour_categories AUTO_INCREMENT = 1;
ALTER TABLE tours AUTO_INCREMENT = 1;
ALTER TABLE tour_departures AUTO_INCREMENT = 1;
ALTER TABLE tour_itineraries AUTO_INCREMENT = 1;
ALTER TABLE tour_images AUTO_INCREMENT = 1;
ALTER TABLE tour_policies AUTO_INCREMENT = 1;
ALTER TABLE tour_pickup_points AUTO_INCREMENT = 1;
ALTER TABLE promotions AUTO_INCREMENT = 1;

-- =========================================================================================
-- 2. NẠP DANH MỤC TOUR (TOUR CATEGORIES)
-- =========================================================================================
INSERT INTO tour_categories (id, name, slug, description, status, created_at, updated_at) VALUES
(1, 'Du Lịch Miền Bắc', 'du-lich-mien-bac', 'Khám phá di sản ngàn năm văn hiến, non nước hữu tình và vẻ đẹp hùng vĩ của đất Bắc.', 'ACTIVE', NOW(), NOW()),
(2, 'Du Lịch Miền Trung', 'du-lich-mien-trung', 'Con đường di sản miền Trung với biển xanh cát trắng, di tích cổ kính và ẩm thực phong phú.', 'ACTIVE', NOW(), NOW()),
(3, 'Du Lịch Miền Nam & Biển Đảo', 'du-lich-mien-nam-bien-dao', 'Hành trình biển đảo ngọc Phú Quốc, Côn Đảo và miền Tây sông nước trĩu quả hữu tình.', 'ACTIVE', NOW(), NOW()),
(4, 'Du Lịch Khám Phá Tây Bắc', 'du-lich-tay-bac', 'Chinh phục cung đèo huyền thoại, mùa hoa tam giác mạch và đỉnh Fansipan hùng vĩ.', 'ACTIVE', NOW(), NOW()),
(5, 'Du Lịch Quốc Tế', 'du-lich-quoc-te', 'Trải nghiệm văn hóa đa dạng, mua sắm thả ga và chiêm ngưỡng cảnh sắc tuyệt đẹp khắp thế giới.', 'ACTIVE', NOW(), NOW());

-- =========================================================================================
-- 3. NẠP 12 TOUR THỰC TẾ NỔI BẬT NHẤT VIỆT NAM & THẾ GIỚI
-- =========================================================================================
INSERT INTO tours (id, category_id, tour_code, name, tour_type, departure_city, destination_city, duration_days, duration_nights, featured_image, summary, description, status, created_at, updated_at) VALUES
(1, 2, 'TOUR-DN-01', 'Đà Nẵng - Bà Nà Hills - Cầu Vàng - Phố Cổ Hội An', 'DOMESTIC', 'TP. Hồ Chí Minh', 'Đà Nẵng', 3, 2, 
'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=900', 
'Hành trình khám phá Cầu Vàng huyền thoại trên đỉnh Bà Nà, thả đèn hoa đăng lung linh tại Phố cổ Hội An và tắm biển Mỹ Khê.',
'Đà Nẵng – thành phố đáng sống nhất Việt Nam đón chào du khách với bãi biển Mỹ Khê xinh đẹp, bán đảo Sơn Trà linh thiêng, đỉnh Bà Nà bồng bềnh mây trắng và kiệt tác Cầu Vàng nổi tiếng thế giới. Kết hợp cùng vẻ đẹp hoài niệm, bình yên của Phố cổ Hội An về đêm rực rỡ sắc màu đèn hoa đăng, đây là hành trình nghỉ dưỡng trọn vẹn và ý nghĩa nhất dành cho bạn và gia đình.',
'ACTIVE', NOW(), NOW()),

(2, 3, 'TOUR-PQ-02', 'Phú Quốc - Thiên Đường Đảo Ngọc - Cáp Treo Hòn Thơm', 'DOMESTIC', 'TP. Hồ Chí Minh', 'Phú Quốc', 3, 2,
'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=900',
'Chiêm ngưỡng làn nước biển ngọc bích bãi Sao, trải nghiệm cáp treo vượt biển dài nhất thế giới và vui chơi tại Grand World không ngủ.',
'Đảo ngọc Phú Quốc là thiên đường nghỉ dưỡng nhiệt đới với những bãi cát trắng mịn trải dài, làn nước biển trong vắt như pha lê tại Hòn Thơm, Hòn Móng Tay. Tour đưa quý khách trải nghiệm hệ thống cáp treo 3 dây vượt biển dài nhất thế giới, check-in Cầu Hôn lãng mạn tại Thị trấn Hoàng Hôn Sunset Town và khám phá thành phố không ngủ Grand World Phú Quốc.',
'ACTIVE', NOW(), NOW()),

(3, 4, 'TOUR-SP-03', 'Sa Pa - Chinh Phục Đỉnh Fansipan - Bản Cát Cát', 'DOMESTIC', 'Hà Nội', 'Sa Pa', 3, 2,
'https://images.unsplash.com/photo-1528127269322-539801943592?w=900',
'Chạm tay vào nóc nhà Đông Dương Fansipan huyền thoại, ngắm thung lũng Mường Hoa thơ mộng và trải nghiệm văn hóa người Mông.',
'Sa Pa mờ sương luôn quyến rũ lòng người bởi vẻ đẹp hoang sơ mà hùng vĩ của núi rừng Tây Bắc. Quý khách sẽ được trải nghiệm tuyến cáp treo Fansipan hiện đại đạt kỷ lục Guinness, đặt chân lên đỉnh cao 3.143m ngắm biển mây cuồn cuộn. Khám phá nét sinh hoạt văn hóa độc đáo tại Bản Cát Cát, thưởng thức thắng cố và lẩu cá hồi nóng hổi trong tiết trời se lạnh.',
'ACTIVE', NOW(), NOW()),

(4, 1, 'TOUR-HL-04', 'Vịnh Hạ Long - Trải Nghiệm Du Thuyền 5 Sao Sang Trọng', 'DOMESTIC', 'Hà Nội', 'Hạ Long', 2, 1,
'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900',
'Thưởng ngoạn kỳ quan thiên nhiên thế giới trên du thuyền chuẩn 5 sao quốc tế, chèo thuyền Kayak khám phá hang Sửng Sốt.',
'Hành trình nghỉ dưỡng thượng lưu trên Vịnh Hạ Long – di sản thiên nhiên được UNESCO công nhận. Du khách sẽ được lưu trú trên du thuyền sang trọng với ban công riêng nhìn ra vịnh, thưởng thức đại tiệc hải sản tươi sống, tham gia lớp học nấu ăn trên boong tàu, ngắm hoàng hôn rực rỡ và tự tay chèo thuyền Kayak len lỏi qua các hang động đá vôi hàng triệu năm tuổi.',
'ACTIVE', NOW(), NOW()),

(5, 4, 'TOUR-HG-05', 'Hà Giang - Đèo Mã Pí Lèng - Du Thuyền Sông Nho Quế', 'DOMESTIC', 'Hà Nội', 'Hà Giang', 4, 3,
'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900',
'Chinh phục một trong tứ đại đỉnh đèo hiểm trở nhất Việt Nam, ngắm dòng sông Nho Quế xanh như ngọc bích tại hẻm Tu Sản.',
'Hà Giang – mảnh đất địa đầu Tổ quốc mùa hoa rực rỡ làm say đắm biết bao phượt thủ và du khách. Chuyến đi đưa bạn vượt qua đèo Mã Pí Lèng quanh co kỳ vĩ, phóng tầm mắt xuống dòng sông Nho Quế uốn lượn dưới hẻm vực Tu Sản sâu nhất Đông Nam Á. Ghé thăm Cột cờ Lũng Cú thiêng liêng, Dinh thự họ Vương cổ kính và phố cổ Đồng Văn đậm đà bản sắc vùng cao.',
'ACTIVE', NOW(), NOW()),

(6, 2, 'TOUR-QN-06', 'Quy Nhơn - Kỳ Co - Eo Gió - Maldives Của Việt Nam', 'DOMESTIC', 'TP. Hồ Chí Minh', 'Quy Nhơn', 3, 2,
'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900',
'Tận hưởng vẻ đẹp hoang sơ của bãi tắm Kỳ Co, dạo bước trên con đường ven biển tuyệt đẹp tại Eo Gió đón bình minh.',
'Quy Nhơn được mệnh danh là thiên đường biển mới của miền Trung với vẻ đẹp hoang sơ và nguyên bản. Bãi tắm Kỳ Co nước trong hai màu nhìn tận đáy cùng rạn san hô lộng lẫy tại Hòn Sẹo sẽ khiến bạn ngỡ ngàng. Đứng trên cung đường đá uốn lượn ôm trọn bờ biển tại Eo Gió đón từng làn gió biển mát lành và thưởng thức hải sản tươi ngon bậc nhất xứ Nẫu.',
'ACTIVE', NOW(), NOW()),

(7, 2, 'TOUR-NT-07', 'Nha Trang - Du Ngoạn 4 Đảo - Công Viên VinWonders', 'DOMESTIC', 'TP. Hồ Chí Minh', 'Nha Trang', 4, 3,
'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900',
'Lặn ngắm rạn san hô Vịnh San Hô, vui chơi thả ga tại thiên đường giải trí VinWonders Hòn Tre và tắm bùn khoáng nóng thư giãn.',
'Vịnh Nha Trang là một trong 29 vịnh biển đẹp nhất thế giới. Tour mang đến những trải nghiệm bùng nổ năng lượng: lặn biển ngắm san hô bằng bình khí, tham gia tiệc rượu nổi trên biển bar nổi náo nhiệt, thưởng thức tôm hùm tươi sống và vui chơi trọn ngày tại VinWonders với công viên nước khổng lồ cùng show diễn thực cảnh Tata Show hoành tráng.',
'ACTIVE', NOW(), NOW()),

(8, 2, 'TOUR-DL-08', 'Đà Lạt - Săn Mây Đồi Chè Cầu Đất - Thành Phố Tình Yêu', 'DOMESTIC', 'TP. Hồ Chí Minh', 'Đà Lạt', 3, 2,
'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900',
'Thức dậy đón bình minh săn mây bềnh bồng tại Cầu Đất, check-in thác Datanla hùng vĩ và thưởng thức cà phê ngắm hoàng hôn.',
'Đà Lạt ngàn hoa với khí hậu ôn hòa quanh năm luôn là điểm đến lãng mạn nhất. Bạn sẽ được tận mắt chứng kiến khoảnh khắc ánh mặt trời le lói qua biển mây bồng bềnh tại đồi chè Cầu Đất, dạo quanh hồ Tuyền Lâm thơ mộng, trải nghiệm máng trượt xuyên rừng thông tại thác Datanla và nhâm nhi ly sữa đậu nành nóng hổi giữa chợ đêm Đà Lạt tấp nập.',
'ACTIVE', NOW(), NOW()),

(9, 3, 'TOUR-CT-09', 'Miền Tây - Cần Thơ - Chợ Nổi Cái Răng - Rừng Tràm Trà Sư', 'DOMESTIC', 'TP. Hồ Chí Minh', 'Cần Thơ', 2, 1,
'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=900',
'Trải nghiệm văn hóa chợ nổi trên sông độc đáo, chèo xuồng ba lá len lỏi rừng tràm Trà Sư và thưởng thức trái cây miệt vườn.',
'Về miền Tây sông nước để hòa mình vào nếp sống mộc mạc, hiếu khách của người dân Nam Bộ. Xuôi thuyền trên sông Hậu lúc tờ mờ sáng để ngắm nhìn cảnh giao thương nhộn nhịp tại Chợ nổi Cái Răng, ăn tô bún riêu đậm đà ngay trên ghe. Khám phá cánh bèo xanh mướt phủ kín mặt nước tại Rừng tràm Trà Sư và nghe đờn ca tài tử Nam Bộ.',
'ACTIVE', NOW(), NOW()),

(10, 5, 'TOUR-THAI-10', 'Thái Lan - Bangkok - Pattaya - Đảo San Hô Coral', 'INTERNATIONAL', 'TP. Hồ Chí Minh', 'Bangkok', 5, 4,
'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=900',
'Chiêm bái Chùa Vàng Wat Arun linh thiêng, tắm biển đảo Coral Pattaya, xem show Alcazar hoành tráng và mua sắm sầm uất.',
'Xứ sở Chùa Vàng Thái Lan luôn tràn đầy sức sống với những ngôi chùa dát vàng lộng lẫy ven sông Chao Phraya. Du khách thỏa sức tắm biển, chơi dù lượn tại đảo san hô Koh Larn, chiêm ngưỡng tượng Phật khắc nổi trên núi đá Trân Bảo Phật Sơn, thưởng thức ẩm thực đường phố pad Thái, xôi xoài trứ danh và tự do mua sắm tại trung tâm thương mại IconSiam hoa lệ.',
'ACTIVE', NOW(), NOW()),

(11, 5, 'TOUR-SIN-11', 'Singapore - Malaysia - Gardens By The Bay - Tháp Đôi', 'INTERNATIONAL', 'TP. Hồ Chí Minh', 'Singapore', 5, 4,
'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900',
'Hành trình 1 chuyến đi khám phá 2 quốc gia hiện đại bậc nhất Đông Nam Á, check-in siêu cây năng lượng và tháp đôi Petronas.',
'Khám phá quốc đảo sư tử Singapore xanh - sạch - văn minh với công viên Gardens by the Bay kỳ ảo, thác nước trong nhà Jewel Changi cao nhất thế giới. Nối tiếp hành trình qua Malaysia thăm thành phố cổ Malacca di sản, động Batu huyền bí và check-in biểu tượng tháp đôi Petronas Twin Towers rực sáng trong đêm.',
'ACTIVE', NOW(), NOW()),

(12, 5, 'TOUR-JP-12', 'Nhật Bản - Cung Đường Vàng Tokyo - Núi Phú Sĩ - Kyoto', 'INTERNATIONAL', 'Hà Nội', 'Tokyo', 6, 5,
'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900',
'Ngắm núi Phú Sĩ tuyết phủ trắng xóa, viếng chùa Asakusa cổ kính, trải nghiệm tàu cao tốc Shinkansen và tắm khoáng nóng Onsen.',
'Cung đường vàng Nhật Bản đưa du khách qua những biểu tượng bất hủ của đất nước mặt trời mọc: chụp ảnh cùng Núi Phú Sĩ linh thiêng tại hồ Kawaguchi, dạo bước qua rừng tre Sagano xanh mát ở cố đô Kyoto, ghé thăm ngôi chùa cổ kính Asakusa Kannon tại Tokyo sầm uất và trải nghiệm văn hóa tắm khoáng nóng Onsen truyền thống tốt cho sức khỏe.',
'ACTIVE', NOW(), NOW());

-- =========================================================================================
-- 4. NẠP ALBUM ẢNH PHỤ (TOUR IMAGES) - ĐẦY ĐỦ 100% CHO CẢ 12 TOUR
-- =========================================================================================
INSERT INTO tour_images (tour_id, image_url) VALUES
-- Tour 1: Đà Nẵng
(1, 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800'),
(1, 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800'),
(1, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800'),
(1, 'https://images.unsplash.com/photo-1574950578143-858c6fc58922?w=800'),

-- Tour 2: Phú Quốc
(2, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'),
(2, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'),
(2, 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800'),
(2, 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800'),

-- Tour 3: Sa Pa
(3, 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800'),
(3, 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800'),
(3, 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=800'),
(3, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'),

-- Tour 4: Hạ Long
(4, 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'),
(4, 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800'),
(4, 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800'),
(4, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'),

-- Tour 5: Hà Giang
(5, 'https://images.unsplash.com/photo-1622760807800-66cf157989c7?w=800'),
(5, 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800'),
(5, 'https://images.unsplash.com/photo-1572979144883-9b9366e6b52a?w=800'),
(5, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'),

-- Tour 6: Quy Nhơn
(6, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'),
(6, 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800'),
(6, 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800'),

-- Tour 7: Nha Trang
(7, 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800'),
(7, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'),
(7, 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=800'),

-- Tour 8: Đà Lạt
(8, 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'),
(8, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800'),
(8, 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800'),

-- Tour 9: Miền Tây Cần Thơ
(9, 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800'),
(9, 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800'),
(9, 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800'),

-- Tour 10: Thái Lan
(10, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800'),
(10, 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800'),
(10, 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'),
(10, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'),

-- Tour 11: Singapore - Malaysia
(11, 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800'),
(11, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800'),
(11, 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800'),

-- Tour 12: Nhật Bản
(12, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'),
(12, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800'),
(12, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800'),
(12, 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=800');

-- =========================================================================================
-- 5. NẠP CÁC ĐỢT KHỞI HÀNH (TOUR DEPARTURES) TỪ THÁNG 11/2026 ĐẾN THÁNG 01/2027
-- =========================================================================================
INSERT INTO tour_departures (id, tour_id, departure_date, return_date, adult_price, child_price, single_room_supplement, max_seats, available_seats, status, created_at, updated_at) VALUES
-- Tour Đà Nẵng
(1, 1, '2026-11-25', '2026-11-27', 3590000.00, 2590000.00, 600000.00, 30, 24, 'OPEN', NOW(), NOW()),
(2, 1, '2026-12-05', '2026-12-07', 3890000.00, 2790000.00, 600000.00, 30, 30, 'OPEN', NOW(), NOW()),
(3, 1, '2026-12-24', '2026-12-26', 4290000.00, 3090000.00, 800000.00, 30, 18, 'OPEN', NOW(), NOW()),

-- Tour Phú Quốc
(4, 2, '2026-11-28', '2026-11-30', 4490000.00, 3190000.00, 900000.00, 25, 20, 'OPEN', NOW(), NOW()),
(5, 2, '2026-12-12', '2026-12-14', 4690000.00, 3390000.00, 900000.00, 25, 25, 'OPEN', NOW(), NOW()),
(6, 2, '2027-01-01', '2027-01-03', 5290000.00, 3790000.00, 1200000.00, 25, 12, 'OPEN', NOW(), NOW()),

-- Tour Sa Pa
(7, 3, '2026-12-04', '2026-12-06', 2990000.00, 2190000.00, 500000.00, 35, 28, 'OPEN', NOW(), NOW()),
(8, 3, '2026-12-18', '2026-12-20', 3190000.00, 2290000.00, 500000.00, 35, 32, 'OPEN', NOW(), NOW()),

-- Tour Hạ Long
(9, 4, '2026-11-29', '2026-11-30', 2790000.00, 1990000.00, 700000.00, 20, 15, 'OPEN', NOW(), NOW()),
(10, 4, '2026-12-15', '2026-12-16', 2990000.00, 2190000.00, 700000.00, 20, 20, 'OPEN', NOW(), NOW()),

-- Tour Hà Giang
(11, 5, '2026-12-10', '2026-12-13', 3790000.00, 2690000.00, 600000.00, 28, 22, 'OPEN', NOW(), NOW()),

-- Tour Quy Nhơn
(12, 6, '2026-12-08', '2026-12-10', 3390000.00, 2490000.00, 500000.00, 30, 26, 'OPEN', NOW(), NOW()),

-- Tour Nha Trang
(13, 7, '2026-12-20', '2026-12-23', 3990000.00, 2890000.00, 700000.00, 30, 25, 'OPEN', NOW(), NOW()),

-- Tour Đà Lạt
(14, 8, '2026-12-05', '2026-12-07', 2490000.00, 1790000.00, 400000.00, 35, 30, 'OPEN', NOW(), NOW()),

-- Tour Miền Tây Cần Thơ
(15, 9, '2026-11-28', '2026-11-29', 1890000.00, 1390000.00, 300000.00, 40, 35, 'OPEN', NOW(), NOW()),

-- Tour Thái Lan
(16, 10, '2026-12-15', '2026-12-19', 6990000.00, 5490000.00, 2000000.00, 25, 19, 'OPEN', NOW(), NOW()),
(17, 10, '2027-01-10', '2027-01-14', 7490000.00, 5890000.00, 2000000.00, 25, 25, 'OPEN', NOW(), NOW()),

-- Tour Singapore - Malaysia
(18, 11, '2026-12-22', '2026-12-26', 11990000.00, 9490000.00, 3500000.00, 20, 14, 'OPEN', NOW(), NOW()),

-- Tour Nhật Bản
(19, 12, '2026-12-18', '2026-12-23', 28990000.00, 23990000.00, 7000000.00, 18, 11, 'OPEN', NOW(), NOW());

-- =========================================================================================
-- 6. NẠP LỊCH TRÌNH CHI TIẾT TỪNG NGÀY (TOUR ITINERARIES)
-- =========================================================================================
INSERT INTO tour_itineraries (tour_id, day_number, title, details, meals, accommodation) VALUES
(1, 1, 'TP.HCM - Đà Nẵng - Bán Đảo Sơn Trà - Biển Mỹ Khê', 'Xe và hướng dẫn viên đón đoàn tại sân bay Đà Nẵng. Khởi hành tham quan Bán đảo Sơn Trà, viếng Linh Ứng Tự ngắm tượng Phật Bà Quan Âm cao 67m hướng biển. Buổi chiều tự do tắm biển Mỹ Khê.', 'Trưa, Tối', 'Khách sạn 4 sao ven biển Đà Nẵng'),
(1, 2, 'Khu Du Lịch Bà Nà Hills - Cầu Vàng Bàn Tay - Phố Cổ Hội An', 'Buổi sáng lên cáp treo Bà Nà Hills check-in Cầu Vàng lừng danh, vui chơi Fantasy Park. Buổi chiều di chuyển về Phố cổ Hội An, tham quan Chùa Cầu, nhà cổ Phùng Hưng và thả hoa đăng sông Hoài.', 'Sáng, Trưa buffet, Tối', 'Khách sạn 4 sao ven biển Đà Nẵng'),
(1, 3, 'Ngũ Hành Sơn - Làng Đá Mỹ Nghệ Non Nước - Tiễn Sân Bay', 'Khám phá quần thể Ngũ Hành Sơn huyền bí với các hang động thạch nhũ tự nhiên. Mua sắm đặc sản chả bò, mực rim tại chợ Hàn trước khi ra sân bay Đà Nẵng về lại TP.HCM.', 'Sáng, Trưa', 'Kết thúc hành trình'),

(2, 1, 'Đón Sân Bay Phú Quốc - Suối Tranh - Dinh Cậu - Chợ Đêm', 'Đón khách tại sân bay Phú Quốc, nhận phòng resort nghỉ ngơi. Chiều tham quan danh thắng Suối Tranh, viếng Dinh Cậu ngắm hoàng hôn biển tuyệt đẹp. Tối khám phá chợ đêm Phú Quốc.', 'Trưa, Tối', 'Resort 4 sao có bãi biển riêng'),
(2, 2, 'Cáp Treo Hòn Thơm - Khám Phá 4 Đảo - Thị Trấn Hoàng Hôn', 'Trải nghiệm cáp treo vượt biển đến Hòn Thơm, cano đưa đoàn lặn ngắm rạn san hô tự nhiên tại Hòn Mây Rút. Chiều check-in Cầu Hôn Kiss Bridge và chiêm ngưỡng show nhạc nước Kiss of the Sea.', 'Sáng, Trưa hải sản, Tối', 'Resort 4 sao có bãi biển riêng'),
(2, 3, 'Cơ Sở Nuôi Cấy Ngọc Trai - Nhà Tù Phú Quốc - Tạm Biệt Đảo Ngọc', 'Tham quan trang trại nuôi cấy ngọc trai cao cấp, di tích lịch sử Nhà tù Phú Quốc. Mua sắm đặc sản tiêu, nước mắm truyền thống trước khi xe tiễn ra sân bay Phú Quốc.', 'Sáng, Trưa', 'Kết thúc hành trình'),

(3, 1, 'Hà Nội - Cao Tốc Nội Bài Lào Cai - Sa Pa - Bản Cát Cát', 'Xe đón đoàn tại điểm hẹn khởi hành đi Sa Pa trên cao tốc êm ái. Chiều đi bộ tham quan Bản Cát Cát xinh đẹp của người H’Mông, chụp ảnh guồng nước và thác Tiên Sa thơ mộng.', 'Trưa, Tối thắng cố', 'Khách sạn 3 sao trung tâm Sa Pa'),
(3, 2, 'Chinh Phục Đỉnh Fansipan 3.143m - Đèo Ô Quy Hồ - Cổng Trời', 'Trải nghiệm cáp treo và tàu hỏa leo núi lên đỉnh Fansipan linh thiêng ngắm mây trời lộng gió. Chiều check-in Đèo Ô Quy Hồ - vua đèo Tây Bắc, săn hoàng hôn đỏ rực tại Cổng Trời.', 'Sáng, Trưa, Tối lẩu cá hồi', 'Khách sạn 3 sao trung tâm Sa Pa'),
(3, 3, 'Nhà Thờ Đá Sa Pa - Mua Sắm Đặc Sản - Trở Về Hà Nội', 'Tự do dạo phố, chụp ảnh Nhà thờ Đá cổ kính Sa Pa, thưởng thức cà phê ngắm thung lũng Mường Hoa. Chiều lên xe trở về Hà Nội, kết thúc chuyến đi tuyệt vời.', 'Sáng, Trưa', 'Kết thúc hành trình'),

-- Tour 4: Hạ Long
(4, 1, 'Hà Nội - Tuần Châu - Vịnh Hạ Long - Hang Sửng Sốt', 'Xe đón đoàn đến bến cảng Tuần Châu, làm thủ tục lên du thuyền 5 sao thưởng thức đồ uống chào mừng. Chiều thăm hang Sửng Sốt lung linh thạch nhũ và chèo kayak tại hang Luồn.', 'Trưa buffet hải sản, Tối tiệc nướng', 'Nghỉ đêm trên du thuyền 5 sao đẳng cấp'),
(4, 2, 'Đảo Titop - Ngắm Bình Minh Vịnh - Hà Nội', 'Tập Thái Cực Quyền đón bình minh trên boong tàu. Chinh phục đỉnh núi Titop ngắm toàn cảnh Vịnh Hạ Long từ trên cao hoặc tắm biển Titop. Trưa tàu cập bến, xe đưa về Hà Nội.', 'Sáng, Trưa', 'Kết thúc hành trình'),

-- Tour 5: Hà Giang
(5, 1, 'Hà Nội - TP. Hà Giang - Cột Mốc Km0 - Quản Bạ', 'Khởi hành sớm đi Hà Giang, check-in cột mốc Km0 huyền thoại. Chiều vượt dốc Bắc Sum, ngắm Núi Đôi Cô Tiên tại Cổng trời Quản Bạ ngập tràn hoa tam giác mạch.', 'Trưa, Tối', 'Khách sạn tại Yên Minh'),
(5, 2, 'Dốc Thẩm Mã - Nhà Pao - Dinh Vua Mèo - Cột Cờ Lũng Cú', 'Check-in dốc Thẩm Mã quanh co, thăm làng văn hóa Lũng Cẩm - bối cảnh phim Chuyện của Pao. Thăm Dinh Thự Vua Mèo Vương Chính Đức và chạm tay vào cờ Tổ quốc tại Lũng Cú.', 'Sáng, Trưa, Tối', 'Khách sạn tại phố cổ Đồng Văn'),
(5, 3, 'Đèo Mã Pí Lèng - Hẻm Tu Sản - Du Thuyền Sông Nho Quế', 'Chinh phục Đèo Mã Pí Lèng - vua đèo hiểm trở nhất Việt Nam. Trải nghiệm du thuyền ngắm làn nước xanh ngọc bích của dòng sông Nho Quế tại hẻm vực Tu Sản sâu nhất Đông Nam Á.', 'Sáng, Trưa, Tối', 'Khách sạn tại TP. Hà Giang'),
(5, 4, 'TP. Hà Giang - Mua Sắm Đặc Sản Vùng Cao - Hà Nội', 'Mua sắm chè San Tuyết cổ thụ, mật ong hoa bạc hà và bánh tam giác mạch. Chiều khởi hành về đến Hà Nội, tạm biệt mảnh đất hoa nở trên đá.', 'Sáng, Trưa', 'Kết thúc hành trình'),

-- Tour 6: Quy Nhơn
(6, 1, 'TP.HCM - Quy Nhơn - Ghềnh Ráng Tiên Sa - Mộ Hàn Mặc Tử', 'Đón khách tại sân bay Phù Cát. Thăm khu du lịch Ghềnh Ráng Tiên Sa, bãi đá Trứng Hoàng Hậu và viếng mộ thi sĩ Hàn Mặc Tử. Tối thưởng thức bánh xèo tôm nhảy.', 'Trưa, Tối', 'Khách sạn 4 sao sát biển Quy Nhơn'),
(6, 2, 'Bãi Tắm Kỳ Co - Lặn Ngắm San Hô Hòn Sẹo - Eo Gió', 'Cano cao tốc đưa đoàn sang đảo Kỳ Co - thiên đường biển xanh ngọc bích. Lặn ngắm rạn san hô nhiều màu tại Hòn Sẹo. Chiều dạo bước trên cung đường đá uốn lượn tại Eo Gió.', 'Sáng, Trưa hải sản, Tối', 'Khách sạn 4 sao sát biển Quy Nhơn'),
(6, 3, 'Tháp Bánh Ít - Mua Sắm Đặc Sản Xứ Nẫu - Tiễn Bay', 'Khám phá quần thể Tháp Chăm Bánh Ít cổ kính gần 1000 năm tuổi. Mua nem Chợ Huyện, bánh ít lá gai trước khi ra sân bay Phù Cát về TP.HCM.', 'Sáng, Trưa', 'Kết thúc hành trình'),

-- Tour 7: Nha Trang
(7, 1, 'TP.HCM - Nha Trang - Tháp Bà Ponagar - Tắm Bùn Khoáng', 'Xe đưa đoàn tới phố biển Nha Trang. Thăm Tháp Bà Ponagar linh thiêng của người Chăm, ngắm nhìn sông Cái. Trải nghiệm tắm bùn khoáng nóng I-Resort phục hồi sức khỏe.', 'Trưa, Tối nem nướng', 'Khách sạn 4 sao đường Trần Phú'),
(7, 2, 'Vịnh Nha Trang - Vịnh San Hô - Làng Chài - Bãi Tranh', 'Tàu gỗ đưa đoàn ra vịnh biển. Tự do tắm biển, tham gia trò chơi dù lượn, mô tô nước tại Bãi Tranh. Thưởng thức bữa trưa hải sản tươi sống tại làng chài ven vịnh.', 'Sáng, Trưa, Tối tiệc BBQ', 'Khách sạn 4 sao đường Trần Phú'),
(7, 3, 'Thế Giới Giải Trí VinWonders Hòn Tre', 'Cáp treo đưa đoàn sang đảo Hòn Tre. Vui chơi trọn ngày tại VinWonders: vịnh phao nổi khổng lồ, tàu lượn siêu tốc, xem biểu diễn cá heo và siêu show thực cảnh Tata Show.', 'Sáng, Trưa buffet, Tối', 'Khách sạn 4 sao đường Trần Phú'),
(7, 4, 'Chợ Đầm Nha Trang - Tiễn Đoàn', 'Mua sắm mực một nắng, chả cá Nha Trang và yến sào Khánh Hòa tại Chợ Đầm. Chiều xe tiễn khách về điểm đón ban đầu.', 'Sáng, Trưa', 'Kết thúc hành trình'),

-- Tour 8: Đà Lạt
(8, 1, 'TP.HCM - Đà Lạt - Thác Datanla - Quảng Trường Lâm Viên', 'Xe đón đoàn đi Đà Lạt. Chiều ghé thác Datanla trải nghiệm hệ thống máng trượt xuyên rừng thông dài nhất Đông Nam Á. Check-in nụ hoa Atiso tại quảng trường Lâm Viên.', 'Trưa, Tối lẩu gà lá é', 'Khách sạn 3 sao trung tâm Đà Lạt'),
(8, 2, 'Săn Mây Đồi Chè Cầu Đất - Chùa Linh Phước - Ga Đà Lạt', 'Khởi hành từ 05:00 sáng đón bình minh săn mây bềnh bồng tại Cầu Đất. Thăm Chùa Ve Chai Linh Phước giữ nhiều kỷ lục và Ga xe lửa cổ thời Pháp.', 'Sáng, Trưa, Tối buffet rau', 'Khách sạn 3 sao trung tâm Đà Lạt'),
(8, 3, 'Thung Lũng Tình Yêu - Chợ Đà Lạt - Về Lại TP.HCM', 'Dạo bước ngắm ngàn hoa khoe sắc tại Thung Lũng Tình Yêu. Ghé chợ Đà Lạt mua dâu tây tươi và mứt sấy trước khi lên xe về lại TP.HCM.', 'Sáng, Trưa', 'Kết thúc hành trình'),

-- Tour 9: Miền Tây Cần Thơ
(9, 1, 'TP.HCM - Mỹ Tho - Bến Tre - Cần Thơ - Bến Ninh Kiều', 'Khởi hành về miền Tây, du thuyền trên sông Tiền nghe đờn ca tài tử, ăn kẹo dừa Bến Tre. Chiều về TP. Cần Thơ, tối du thuyền ngắm cầu Cần Thơ tại bến Ninh Kiều.', 'Trưa cá tai tượng, Tối', 'Khách sạn 4 sao trung tâm Cần Thơ'),
(9, 2, 'Chợ Nổi Cái Răng - Miệt Vườn Trái Cây - Về TP.HCM', 'Đi thuyền lúc sáng sớm khám phá nét văn hóa sông nước độc đáo tại Chợ nổi Cái Răng. Thưởng thức trái cây tại vườn và bún riêu trên ghe trước khi về lại TP.HCM.', 'Sáng, Trưa lẩu mắm', 'Kết thúc hành trình'),

-- Tour 10: Thái Lan
(10, 1, 'TP.HCM - Bangkok - Pattaya - Chợ Nổi 4 Miền', 'Bay thẳng đến Bangkok, xe đón về thành phố biển Pattaya. Thăm chợ nổi 4 miền Thái Lan và thưởng thức ẩm thực đường phố đặc sắc.', 'Trưa, Tối', 'Khách sạn 4 sao trung tâm Pattaya'),
(10, 2, 'Đảo San Hô Coral - Trân Bảo Phật Sơn - Xem Alcazar Show', 'Cano cao tốc đưa đoàn ra đảo Coral tắm biển. Chiều thăm núi Phật vàng Khao Chee Chan và thưởng thức chương trình ca múa nhạc tạp kỹ Alcazar Show nổi tiếng.', 'Sáng, Trưa hải sản, Tối', 'Khách sạn 4 sao trung tâm Pattaya'),
(10, 3, 'Pattaya - Bangkok - Chùa Wat Arun - Dạo Thuyền Chao Phraya', 'Trở về Bangkok, viếng Chùa Bình Minh Wat Arun nguy nga bên sông. Đi thuyền ngắm cảnh sông mẹ Chao Phraya và xem hiện tượng cá nổi.', 'Sáng, Trưa, Tối buffet lẩu Suki', 'Khách sạn 4 sao trung tâm Bangkok'),
(10, 4, 'Chùa Phật Vàng Wat Traimit - Mua Sắm IconSiam', 'Chiêm bái tượng Phật bằng vàng nguyên khối nặng 5.5 tấn. Tự do mua sắm tại đại siêu thị IconSiam và chợ đêm Pratunam sầm uất.', 'Sáng, Trưa buffet Baiyoke Sky 86 tầng', 'Khách sạn 4 sao trung tâm Bangkok'),
(10, 5, 'Bangkok - TP.HCM', 'Tham quan trung tâm nghiên cứu rắn độc hoàng gia. Xe đưa ra sân bay Suvarnabhumi đáp chuyến bay về lại Việt Nam.', 'Sáng', 'Kết thúc hành trình'),

-- Tour 11: Singapore - Malaysia
(11, 1, 'TP.HCM - Singapore - Thác Nước Jewel Changi - Gardens By The Bay', 'Đáp chuyến bay tới Singapore, chiêm ngưỡng thác nước trong nhà Jewel Changi kỳ vĩ. Chiều thăm công viên siêu cây năng lượng Gardens by the Bay rực rỡ.', 'Trưa, Tối', 'Khách sạn 4 sao Singapore'),
(11, 2, 'Công Viên Sư Tử Biển Merlion - Đảo Sentosa - Thành Phố Cổ Malacca', 'Chụp ảnh cùng biểu tượng Sư tử biển Merlion, tham quan đảo giải trí Sentosa. Chiều xuất cảnh sang Malaysia, nhận phòng tại thành phố cổ Malacca di sản.', 'Sáng, Trưa, Tối', 'Khách sạn 4 sao Malacca'),
(11, 3, 'Malacca - Động Batu Huyền Bí - Thủ Đô Kuala Lumpur', 'Khám phá quảng trường Hà Lan, pháo đài A Famosa. Di chuyển về Kuala Lumpur, chinh phục 272 bậc thang sặc sỡ tại Động Batu linh thiêng.', 'Sáng, Trưa, Tối', 'Khách sạn 4 sao Kuala Lumpur'),
(11, 4, 'Cung Điện Hoàng Gia - Tháp Đôi Petronas Twin Towers', 'Chụp ảnh Cung điện Hoàng gia Malaysia, Quảng trường Độc Lập. Check-in tháp đôi Petronas Twin Towers biểu tượng kiêu hãnh của Malaysia.', 'Sáng, Trưa, Tối', 'Khách sạn 4 sao Kuala Lumpur'),
(11, 5, 'Kuala Lumpur - TP.HCM', 'Mua sắm đặc sản sô-cô-la vi cá, trà sữa Teh Tarik. Xe đưa ra sân bay quốc tế KLIA đáp chuyến bay về TP.HCM.', 'Sáng', 'Kết thúc hành trình'),

-- Tour 12: Nhật Bản
(12, 1, 'Hà Nội - Sân Bay Narita Tokyo', 'Đoàn tập trung tại sân bay Nội Bài đáp chuyến bay thẳng của Vietnam Airlines đi Tokyo Nhật Bản. Nghỉ đêm trên máy bay.', 'Ăn nhẹ trên máy bay', 'Khách sạn tại Tokyo'),
(12, 2, 'Tokyo - Chùa Asakusa Kannon - Tháp Tokyo Skytree - Phố Ginza', 'Viếng ngôi chùa cổ nhất Tokyo Asakusa Kannon và phố đi bộ Nakamise. Chụp ảnh tháp truyền hình Tokyo Skytree và tự do mua sắm tại phố hàng hiệu Ginza.', 'Sáng, Trưa, Tối thịt nướng Yakiniku', 'Khách sạn 4 sao Tokyo'),
(12, 3, 'Tokyo - Núi Phú Sĩ - Làng Cổ Oshino Hakkai - Tắm Suối Khoáng Onsen', 'Di chuyển đến trạm số 5 Núi Phú Sĩ ngắm tuyết trắng. Thăm làng cổ Oshino Hakkai dưới chân núi với dòng nước ngầm trong vắt. Tối trải nghiệm tắm suối khoáng nóng Onsen.', 'Sáng, Trưa, Tối Kaiseki truyền thống', 'Khách sạn Onsen tại hồ Kawaguchi'),
(12, 4, 'Trải Nghiệm Tàu Cao Tốc Shinkansen - Cố Đô Kyoto - Rừng Tre Sagano', 'Trải nghiệm tàu cao tốc Shinkansen vận tốc 300km/h về cố đô Kyoto. Dạo bước ngắm rặng tre bạt ngàn tại rừng tre Sagano và cầu cổ Togetsukyo.', 'Sáng, Trưa, Tối lẩu Shabu Shabu', 'Khách sạn 4 sao Kyoto'),
(12, 5, 'Chùa Vàng Kinkakuji - Đền Ngàn Cổng Fushimi Inari - Thành Cổ Osaka', 'Chiêm ngưỡng Chùa Vàng Kinkakuji dát vàng soi bóng hồ nước. Đi bộ qua hàng ngàn cổng Torii đỏ rực tại Fushimi Inari. Chiều thăm Lâu đài cổ Osaka kiêu hãnh.', 'Sáng, Trưa, Tối', 'Khách sạn 4 sao Osaka'),
(12, 6, 'Osaka - Phố Mua Sắm Dotonbori - Về Lại Hà Nội', 'Tự do mua sắm mỹ phẩm, bánh kẹo tại Shinsaibashi và chụp ảnh cùng biển hiệu Glico Man tại Dotonbori. Chiều ra sân bay Kansai về lại Hà Nội.', 'Sáng, Trưa', 'Kết thúc hành trình');

-- =========================================================================================
-- 7. NẠP CHÍNH SÁCH TOUR (TOUR POLICIES)
-- =========================================================================================
INSERT INTO tour_policies (tour_id, policy_type, content) VALUES
-- Tour 1
(1, 'INCLUDED', 'Vé máy bay khứ hồi theo chương trình tour (7kg xách tay + 20kg ký gửi).'),
(1, 'INCLUDED', 'Khách sạn tiêu chuẩn 4 sao sang trọng (2 người/phòng, lẻ nam/nữ ngủ phòng 3).'),
(1, 'INCLUDED', 'Xe du lịch đời mới máy lạnh đưa đón tham quan suốt tuyến.'),
(1, 'INCLUDED', 'Vé cáp treo Bà Nà Hills và bữa trưa Buffet cao cấp trên đỉnh Bà Nà.'),
(1, 'INCLUDED', 'Bảo hiểm du lịch nội địa mức bồi thường tối đa 100.000.000 đ/vụ.'),
(1, 'EXCLUDED', 'Chi phí cá nhân: giặt ủi, điện thoại, minibar, đồ uống ngoài các bữa ăn.'),
(1, 'EXCLUDED', 'Phụ thu phòng đơn đối với khách đi 1 mình có nhu cầu ở riêng.'),
(1, 'EXCLUDED', 'Tiền bồi dưỡng (Tip) cho hướng dẫn viên và tài xế (tùy tâm).'),
(1, 'POLICY_NOTE', 'Hủy tour trước 15 ngày khởi hành: Miễn phí hủy tour (hoàn tiền 100%).'),
(1, 'POLICY_NOTE', 'Hủy tour từ 07 - 14 ngày trước ngày đi: Phí hủy là 50% tổng giá trị tour.'),
(1, 'POLICY_NOTE', 'Hủy tour trong vòng 03 ngày trước ngày đi: Không hoàn lại tiền vé.'),

-- Tour 2
(2, 'INCLUDED', 'Vé máy bay khứ hồi chặng TP.HCM - Phú Quốc của Vietnam Airlines / Vietjet.'),
(2, 'INCLUDED', 'Resort 4 sao đẳng cấp có hồ bơi vô cực và bãi biển riêng tư.'),
(2, 'INCLUDED', 'Vé cáp treo Hòn Thơm 2 chiều và cano cao tốc tham quan 4 đảo lặn san hô.'),
(2, 'INCLUDED', 'Các bữa ăn tiêu chuẩn với thực đơn hải sản phong phú xứ đảo.'),
(2, 'EXCLUDED', 'Vé vào cổng các khu vui chơi không nằm trong chương trình.'),
(2, 'EXCLUDED', 'Thuế VAT 10% (nếu yêu cầu xuất hóa đơn đỏ doanh nghiệp).'),
(2, 'POLICY_NOTE', 'Quý khách vui lòng mang theo CCCD bản gốc hoặc Hộ chiếu khi làm thủ tục bay.'),

-- Tour 3 đến 12 (Chính sách chung tiêu chuẩn)
(3, 'INCLUDED', 'Xe limousine đời mới đưa đón khứ hồi Hà Nội - Sa Pa.'),
(3, 'INCLUDED', 'Khách sạn 3-4 sao trung tâm thị xã Sa Pa.'),
(3, 'INCLUDED', 'Vé cáp treo Fansipan khứ hồi và vé tàu hỏa Mường Hoa.'),
(3, 'EXCLUDED', 'Chi phí cá nhân ngoài chương trình và đồ uống trong bữa ăn.'),
(3, 'POLICY_NOTE', 'Nên mang theo áo ấm và giày thể thao thoải mái khi leo núi.'),

(4, 'INCLUDED', 'Nghỉ đêm trên du thuyền 5 sao đẳng cấp vịnh Hạ Long.'),
(4, 'INCLUDED', 'Trọn gói các bữa ăn hải sản cao cấp trên du thuyền.'),
(4, 'INCLUDED', 'Vé tham quan vịnh, hang Sửng Sốt và trải nghiệm chèo thuyền Kayak.'),
(4, 'EXCLUDED', 'Dịch vụ massage, spa và đồ uống có cồn trên tàu.'),
(4, 'POLICY_NOTE', 'Cung cấp họ tên, ngày sinh, CCCD trước 24h để làm thủ tục cảng vụ.'),

(5, 'INCLUDED', 'Xe du lịch 16-29 chỗ đời mới chinh phục cung đường Tây Bắc.'),
(5, 'INCLUDED', 'Vé tham quan Cột cờ Lũng Cú và thuyền sông Nho Quế.'),
(5, 'EXCLUDED', 'Tiền tip cho tài xế và hướng dẫn viên.'),
(5, 'POLICY_NOTE', 'Đường đèo dốc quanh co, quý khách nên chuẩn bị thuốc chống say xe.'),

(6, 'INCLUDED', 'Cano cao tốc sang đảo Kỳ Co và áo phao lặn ngắm san hô.'),
(6, 'INCLUDED', 'Khách sạn 4 sao sát biển Quy Nhơn.'),
(6, 'EXCLUDED', 'Dịch vụ chụp ảnh flycam hoặc mô tô nước trên biển.'),
(6, 'POLICY_NOTE', 'Mang theo kem chống nắng, kính râm và đồ bơi.'),

(7, 'INCLUDED', 'Vé vui chơi trọn gói VinWonders đảo Hòn Tre.'),
(7, 'INCLUDED', 'Tàu tham quan 4 đảo và bữa ăn hải sản tại bè nổi.'),
(7, 'EXCLUDED', 'Chi phí lặn biển bằng bình dưỡng khí hoặc đi bộ dưới đáy biển.'),
(7, 'POLICY_NOTE', 'Trẻ em đi cùng phải mang theo bản sao giấy khai sinh.'),

(8, 'INCLUDED', 'Xe giường nằm cao cấp đưa đón TP.HCM - Đà Lạt.'),
(8, 'INCLUDED', 'Vé máng trượt thác Datanla và xe jeep lên đồi chè săn mây.'),
(8, 'EXCLUDED', 'Chi phí ăn uống tự túc tại chợ đêm Đà Lạt.'),
(8, 'POLICY_NOTE', 'Đà Lạt về đêm nhiệt độ xuống thấp (14-16 độ C), cần mang áo ấm.'),

(9, 'INCLUDED', 'Thuyền máy tham quan chợ nổi Cái Răng và đò chèo Trà Sư.'),
(9, 'INCLUDED', 'Khách sạn 4 sao trung tâm bến Ninh Kiều.'),
(9, 'EXCLUDED', 'Chi phí mua trái cây mang về làm quà.'),
(9, 'POLICY_NOTE', 'Mặc trang phục gọn gàng, mang nón lá hoặc ô che nắng.'),

(10, 'INCLUDED', 'Vé máy bay khứ hồi quốc tế kèm 20kg hành lý ký gửi.'),
(10, 'INCLUDED', 'Khách sạn 4 sao tiêu chuẩn Thái Lan tại Bangkok và Pattaya.'),
(10, 'INCLUDED', 'Vé xem chương trình tạp kỹ Alcazar Show và buffet Baiyoke Sky 86 tầng.'),
(10, 'EXCLUDED', 'Tiền tip bắt buộc cho HDV và tài xế Thái Lan (5 USD/khách/ngày).'),
(10, 'POLICY_NOTE', 'Hộ chiếu còn hạn trên 6 tháng tính từ ngày kết thúc chuyến đi.'),

(11, 'INCLUDED', 'Vé máy bay khứ hồi và thuế phí sân bay 2 nước Singapore - Malaysia.'),
(11, 'INCLUDED', 'Khách sạn 4 sao tiện nghi suốt tuyến.'),
(11, 'EXCLUDED', 'Tiền tip tiêu chuẩn quốc tế (5 USD/khách/ngày).'),
(11, 'POLICY_NOTE', 'Singapore có luật môi trường rất nghiêm, không mang kẹo cao su.'),

(12, 'INCLUDED', 'Visa nhập cảnh Nhật Bản diện du lịch trọn gói.'),
(12, 'INCLUDED', 'Vé máy bay khứ hồi Vietnam Airlines / All Nippon Airways.'),
(12, 'INCLUDED', 'Trải nghiệm tàu cao tốc Shinkansen và tắm suối Onsen.'),
(12, 'EXCLUDED', 'Chi phí giặt ủi và các bữa ăn tự do ngoài chương trình.'),
(12, 'POLICY_NOTE', 'Hồ sơ xin visa cần nộp trước ngày khởi hành tối thiểu 25 ngày.');

-- =========================================================================================
-- 8. NẠP ĐIỂM ĐÓN XE TRUNG CHUYỂN (TOUR PICKUP POINTS)
-- =========================================================================================
INSERT INTO tour_pickup_points (departure_id, location_name, pickup_time) VALUES
(1, 'Sân bay Tân Sơn Nhất - Cột số 10 Ga Quốc Nội', '05:30:00'),
(1, 'Nhà Văn Hóa Thanh Niên (Số 4 Phạm Ngọc Thạch, Quận 1)', '04:45:00'),
(1, 'Cây xăng Hàng Xanh (Điện Biên Phủ, Bình Thạnh)', '05:00:00'),

(2, 'Sân bay Tân Sơn Nhất - Cột số 10 Ga Quốc Nội', '06:00:00'),
(2, 'Bến xe Miền Tây (Kinh Dương Vương, Bình Tân)', '05:00:00'),

(4, 'Sân bay Tân Sơn Nhất - Cột số 08 Ga Quốc Nội', '06:30:00'),
(4, 'Ngã tư Thủ Đức (Trước cổng ĐH Sư Phạm Kỹ Thuật)', '05:15:00'),

(7, 'Rạp Xiếc Trung Ương (67 Trần Nhân Tông, Hai Bà Trưng, Hà Nội)', '06:00:00'),
(7, 'Cổng Công viên Cầu Giấy (Đường Thành Thái, Hà Nội)', '06:30:00'),
(7, 'Sân bay Nội Bài - Nhà ga T1 Ga Quốc Nội', '07:15:00'),

(9, 'Nhà Hát Lớn Hà Nội (Số 1 Tràng Tiền, Hoàn Kiếm)', '07:30:00'),
(9, 'Trung tâm Hội nghị Quốc Gia (Đại lộ Thăng Long)', '08:00:00');

-- =========================================================================================
-- 9. NẠP MÃ KHUYẾN MÃI / VOUCHER (PROMOTIONS)
-- =========================================================================================
INSERT INTO promotions (id, code, discount_type, discount_value, max_discount_amount, min_order_amount, valid_from, valid_to, usage_limit, used_count, is_active, created_at, updated_at) VALUES
(1, 'TRAVEL2026', 'PERCENTAGE', 10.00, 1000000.00, 3000000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 500, 12, 1, NOW(), NOW()),
(2, 'HE2026', 'PERCENTAGE', 15.00, 1500000.00, 5000000.00, '2026-05-01 00:00:00', '2026-12-31 23:59:59', 200, 5, 1, NOW(), NOW()),
(3, 'VNPAY100K', 'FIXED_AMOUNT', 100000.00, 100000.00, 2000000.00, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000, 28, 1, NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
-- =========================================================================================
-- HOÀN TẤT NẠP DỮ LIỆU! HỆ THỐNG ĐÃ CÓ ĐẦY ĐỦ 12 TOUR VÀ HÀNG CHỤC ĐỢT ĐI THỰC TẾ.
-- =========================================================================================
