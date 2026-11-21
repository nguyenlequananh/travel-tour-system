import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Button,
  Spin,
  Empty,
  message,
  Pagination,
  Select,
  Input,
  Space,
} from 'antd';
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  ReloadOutlined,
  CompassOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import tourService from '../../services/tourService';
import categoryService from '../../services/categoryService';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Đọc tiêu chí lọc từ URL (Single Source of Truth)
  const keywordFromUrl = searchParams.get('keyword') || '';
  const categoryIdFromUrl = searchParams.get('categoryId') || undefined;
  const departureCityFromUrl = searchParams.get('departureCity') || undefined;
  const tourTypeFromUrl = searchParams.get('tourType') || undefined;

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // 2. State form bộ lọc đồng bộ với URL
  const [formKeyword, setFormKeyword] = useState(keywordFromUrl);
  const [formDepartureCity, setFormDepartureCity] = useState(departureCityFromUrl);
  const [formTourType, setFormTourType] = useState(tourTypeFromUrl);
  const [formCategory, setFormCategory] = useState(
    categoryIdFromUrl ? Number(categoryIdFromUrl) : undefined
  );

  useEffect(() => {
    setFormKeyword(keywordFromUrl);
    setFormDepartureCity(departureCityFromUrl);
    setFormTourType(tourTypeFromUrl);
    setFormCategory(categoryIdFromUrl ? Number(categoryIdFromUrl) : undefined);
  }, [keywordFromUrl, departureCityFromUrl, tourTypeFromUrl, categoryIdFromUrl]);

  // Phân trang (9 card = 3 hàng x 3 cột cân đối)
  const [pageSize] = useState(9);
  const [totalElements, setTotalElements] = useState(0);

  // 3. Tải danh mục công khai
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getPublicCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // 4. Tải danh sách tour theo URL
  const fetchTours = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pageSize,
      };

      if (keywordFromUrl) params.keyword = keywordFromUrl;
      if (categoryIdFromUrl) params.categoryId = categoryIdFromUrl;
      if (departureCityFromUrl) params.departureCity = departureCityFromUrl;
      if (tourTypeFromUrl) params.tourType = tourTypeFromUrl;

      const res = await tourService.getPublicTours(params);
      const pageData = res.data;

      const tourList =
        pageData?.content || pageData?.data || (Array.isArray(pageData) ? pageData : []);
      setTours(tourList);
      setTotalElements(pageData?.totalElements || tourList.length || 0);
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách tour!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [searchParams]);

  // 5. Áp dụng tìm kiếm & lọc
  const handleApplyFilter = () => {
    const nextParams = new URLSearchParams();
    if (formKeyword.trim()) nextParams.set('keyword', formKeyword.trim());
    if (formDepartureCity) nextParams.set('departureCity', formDepartureCity);
    if (formTourType) nextParams.set('tourType', formTourType);
    if (formCategory) nextParams.set('categoryId', formCategory.toString());
    setSearchParams(nextParams);
  };

  // 6. Chọn nhanh danh mục bằng pill (1 click)
  const handleQuickCategory = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    if (catId) {
      nextParams.set('categoryId', catId.toString());
    } else {
      nextParams.delete('categoryId');
    }
    setSearchParams(nextParams);
  };

  // 7. Chuyển trang
  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage > 1) {
      nextParams.set('page', newPage.toString());
    } else {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 360, behavior: 'smooth' });
  };

  // 8. Đặt lại bộ lọc
  const handleResetFilter = () => {
    setFormKeyword('');
    setFormDepartureCity(undefined);
    setFormTourType(undefined);
    setFormCategory(undefined);
    setSearchParams({});
  };

  const hasActiveFilter = Boolean(
    keywordFromUrl || categoryIdFromUrl || departureCityFromUrl || tourTypeFromUrl
  );

  return (
    <div>
      {/* 1. HERO BANNER TƯƠNG PHẢN CAO + CĂN TRÁI DỄ ĐỌC */}
      <section
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          background:
            'linear-gradient(120deg, rgba(11, 37, 69, 0.92) 0%, rgba(13, 110, 110, 0.84) 100%), url("https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=80") center/cover no-repeat',
          padding: '48px 40px 68px',
          color: '#ffffff',
          boxShadow: '0 14px 36px rgba(11, 37, 69, 0.16)',
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              padding: '5px 14px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              marginBottom: 16,
              color: '#ccfbf1',
            }}
          >
            <CompassOutlined /> Hơn 100+ hành trình chọn lọc trong nước & quốc tế
          </div>

          <h1
            style={{
              color: '#ffffff',
              fontSize: 'clamp(28px, 3.6vw, 40px)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Lên kế hoạch chuyến đi mơ ước chỉ trong vài bước
          </h1>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.88)',
              fontSize: 15.5,
              lineHeight: 1.65,
              marginBottom: 22,
              maxWidth: 590,
            }}
          >
            Đặt tour trọn gói minh bạch lịch trình, giữ chỗ tức thì, thanh toán an toàn qua VNPay và nhận vé điện tử ngay trong hộp thư.
          </p>

          {/* 3 CAM KẾT NGẮN GỌN (PROXIMITY) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 13.5, color: '#e2e8f0' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <SafetyCertificateOutlined style={{ color: '#5eead4' }} /> Giá niêm yết trọn gói
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ThunderboltOutlined style={{ color: '#5eead4' }} /> Xác nhận & xuất vé PDF ngay
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CustomerServiceOutlined style={{ color: '#5eead4' }} /> Tư vấn AI & Hotline 24/7
            </span>
          </div>
        </div>
      </section>

      {/* 2. THANH TÌM KIẾM & BỘ LỌC HỢP NHẤT (PROXIMITY: TẤT CẢ TIÊU CHÍ NẰM CHUNG 1 KHỐI) */}
      <div
        className="th-section-card"
        style={{
          marginTop: -36,
          marginBottom: 28,
          position: 'relative',
          zIndex: 10,
          padding: '20px 24px',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Row gutter={[14, 14]} align="bottom">
          <Col xs={24} md={7}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Điểm đến / Tên tour
            </label>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Phú Quốc, Đà Nẵng, Sapa, Nhật Bản..."
              allowClear
              value={formKeyword}
              onChange={(e) => setFormKeyword(e.target.value)}
              onPressEnter={handleApplyFilter}
            />
          </Col>

          <Col xs={24} sm={12} md={4}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Khởi hành từ
            </label>
            <Select
              placeholder="Tất cả điểm đi"
              allowClear
              style={{ width: '100%' }}
              value={formDepartureCity}
              onChange={(val) => setFormDepartureCity(val)}
            >
              <Select.Option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</Select.Option>
              <Select.Option value="Hà Nội">Hà Nội</Select.Option>
              <Select.Option value="Đà Nẵng">Đà Nẵng</Select.Option>
              <Select.Option value="Cần Thơ">Cần Thơ</Select.Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Loại hình
            </label>
            <Select
              placeholder="Tất cả"
              allowClear
              style={{ width: '100%' }}
              value={formTourType}
              onChange={(val) => setFormTourType(val)}
            >
              <Select.Option value="DOMESTIC">Trong nước</Select.Option>
              <Select.Option value="INTERNATIONAL">Quốc tế</Select.Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}>
            <label
              style={{
                display: 'block',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#475569',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Danh mục
            </label>
            <Select
              placeholder="Tất cả danh mục"
              allowClear
              style={{ width: '100%' }}
              value={formCategory}
              onChange={(val) => setFormCategory(val)}
            >
              {categories.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={5}>
            <Space style={{ width: '100%' }} size={8}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleApplyFilter}
                style={{ flex: 1, fontWeight: 700 }}
              >
                Tìm Tour
              </Button>
              {hasActiveFilter && (
                <Button icon={<ReloadOutlined />} onClick={handleResetFilter} title="Đặt lại bộ lọc">
                  Đặt lại
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      {/* 3. THANH CHỌN NHANH DANH MỤC (1-CLICK BROWSE) */}
      {categories.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 6,
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            className={`th-pill-btn ${!categoryIdFromUrl ? 'active' : ''}`}
            onClick={() => handleQuickCategory(null)}
          >
            Tất cả tour
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`th-pill-btn ${Number(categoryIdFromUrl) === cat.id ? 'active' : ''}`}
              onClick={() => handleQuickCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* 4. TIÊU ĐỀ DANH SÁCH & KẾT QUẢ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: '#0f172a' }}>
            {keywordFromUrl
              ? `Kết quả tìm kiếm: "${keywordFromUrl}"`
              : 'Hành trình nổi bật dành cho bạn'}
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Hiển thị <strong style={{ color: '#0f172a' }}>{totalElements}</strong> tour phù hợp với tiêu chí của bạn
          </p>
        </div>

        {hasActiveFilter && (
          <Button type="link" icon={<ReloadOutlined />} onClick={handleResetFilter} style={{ padding: 0, fontWeight: 600 }}>
            Xóa tất cả bộ lọc
          </Button>
        )}
      </div>

      {/* 5. LƯỚI CARD TOUR (3 CỘT CÂN ĐỐI, CĂN LỀ RÕ RÀNG, PHÂN CẤP ĐẸP) */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '90px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 14, color: '#64748b', fontSize: 14 }}>Đang tải danh sách tour...</div>
        </div>
      ) : tours.length === 0 ? (
        <div className="th-section-card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Empty
            description={
              <span style={{ color: '#475569', fontSize: 15 }}>
                Không tìm thấy tour nào phù hợp với bộ lọc hiện tại.
              </span>
            }
          >
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleResetFilter}>
              Xem tất cả tour
            </Button>
          </Empty>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {tours.map((tour) => {
              const isIntl = tour.tourType === 'INTERNATIONAL';
              return (
                <Col xs={24} sm={12} lg={8} key={tour.id}>
                  <article
                    className="th-tour-card"
                    onClick={() => navigate(`/tours/${tour.id}`)}
                  >
                    {/* ẢNH BÌA & 2 NHÃN TỐI GIẢN TƯƠNG PHẢN CAO */}
                    <div className="th-tour-card-img-wrap">
                      <img
                        alt={tour.name}
                        src={
                          tour.featuredImage?.startsWith('http')
                            ? tour.featuredImage
                            : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'
                        }
                        className="th-tour-card-img"
                      />
                      {/* Gradient nhẹ chân ảnh để chữ badge luôn rõ */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(180deg, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0) 45%, rgba(15,23,42,0.58) 100%)',
                          pointerEvents: 'none',
                        }}
                      />

                      {/* Nhãn danh mục góc trên trái */}
                      <span
                        style={{
                          position: 'absolute',
                          top: 14,
                          left: 14,
                          padding: '4px 12px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background: isIntl ? '#0b2545' : '#0d6e6e',
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        {isIntl ? 'Quốc tế' : tour.categoryName || 'Trong nước'}
                      </span>

                      {/* Thời lượng & Mã tour góc dưới ảnh */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 14,
                          right: 14,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: 'rgba(15, 23, 42, 0.72)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            padding: '4px 10px',
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 600,
                          }}
                        >
                          <ClockCircleOutlined /> {tour.durationDays}N{tour.durationNights}Đ
                        </span>
                        <span
                          style={{
                            background: 'rgba(255, 255, 255, 0.92)',
                            color: '#0f172a',
                            padding: '3px 9px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                          }}
                        >
                          {tour.tourCode}
                        </span>
                      </div>
                    </div>

                    {/* NỘI DUNG CARD — NHÓM THÔNG TIN THEO PROXIMITY */}
                    <div
                      style={{
                        padding: '18px 20px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                    >
                      {/* Nhóm 1: Lộ trình */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#0d6e6e',
                          fontSize: 13,
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        <EnvironmentOutlined />
                        <span>
                          {tour.departureCity} ➔ <strong style={{ color: '#0f172a' }}>{tour.destinationCity}</strong>
                        </span>
                      </div>

                      {/* Nhóm 2: Tên tour (điểm nhấn chính) */}
                      <h3
                        style={{
                          fontSize: 16.5,
                          fontWeight: 700,
                          lineHeight: 1.4,
                          color: '#0f172a',
                          marginBottom: 8,
                          minHeight: 46,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                        title={tour.name}
                      >
                        {tour.name}
                      </h3>

                      {/* Nhóm 3: Tóm tắt ngắn giúp khách hiểu nhanh tour */}
                      <p
                        style={{
                          fontSize: 13.5,
                          color: '#64748b',
                          lineHeight: 1.55,
                          marginBottom: 16,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {tour.summary || 'Khám phá hành trình trọn gói với lịch trình tối ưu và dịch vụ chuẩn.'}
                      </p>

                      {/* Nhóm 4: Chân card & CTA */}
                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: 14,
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 500 }}>
                          {isIntl ? 'Tour Quốc tế' : 'Tour Nội địa'}
                        </span>
                        <Button
                          type="primary"
                          size="middle"
                          icon={<ArrowRightOutlined />}
                          iconPlacement="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tours/${tour.id}`);
                          }}
                          style={{ borderRadius: 8, height: 36, fontWeight: 600 }}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </article>
                </Col>
              );
            })}
          </Row>

          {/* 6. PHÂN TRANG */}
          {totalElements > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalElements}
                showSizeChanger={false}
                onChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
