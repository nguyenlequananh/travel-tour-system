import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Tag, Button, Spin, Empty, message, Badge,
  Pagination, Select, Space
} from 'antd';
import {
  EnvironmentOutlined, ClockCircleOutlined, CompassOutlined,
  ArrowRightOutlined, FilterOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const HomePage = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State quản lý tiêu chí lọc
  const [departureCity, setDepartureCity] = useState(undefined);
  const [tourType, setTourType] = useState(undefined);
  const [selectedCategory, setSelectedCategory] = useState(undefined);

  // State phân trang
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalElements, setTotalElements] = useState(0);

  const keyword = searchParams.get('keyword') || '';
  const categoryIdFromUrl = searchParams.get('categoryId') || '';

  // 1. Tải danh mục tour đổ vào Select lọc
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosClient.get('/categories');
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Đồng bộ nếu người dùng bấm chọn danh mục từ Menu trên cùng
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategory(Number(categoryIdFromUrl));
    }
  }, [categoryIdFromUrl]);

  // 3. HÀM GỌI API LỌC & PHÂN TRANG GỬI XUỐNG BACKEND
  const fetchTours = async (pageIndex = 0) => {
    setLoading(true);
    try {
      let url = `/tours?page=${pageIndex}&size=${pageSize}`;

      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (departureCity) url += `&departureCity=${encodeURIComponent(departureCity)}`;
      if (tourType) url += `&tourType=${tourType}`;

      const res = await axiosClient.get(url);
      const pageData = res.data;

      // Nhận diện mảng dữ liệu thông minh
      const tourList = pageData?.content || pageData?.data || (Array.isArray(pageData) ? pageData : []);
      setTours(tourList);
      setTotalElements(pageData?.totalElements || tourList.length || 0);
      setPage(pageData?.pageNumber || 0);
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách tour!');
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải lại khi từ khóa Header hoặc Category thay đổi
  useEffect(() => {
    fetchTours(0);
  }, [keyword, selectedCategory]);

  // Bấm nút "Lọc Tour"
  const handleApplyFilter = () => {
    fetchTours(0);
  };

  // Bấm nút "Đặt lại" (Xóa hết bộ lọc)
  const handleResetFilter = () => {
    setDepartureCity(undefined);
    setTourType(undefined);
    setSelectedCategory(undefined);
    navigate('/');
  };

  return (
    <div>
      {/* 1. BANNER CHÀO MỪNG NỔI BẬT */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1677ff 0%, #003a8c 100%)',
          color: '#fff',
          padding: '40px 30px',
          borderRadius: 12,
          marginBottom: 25,
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(22, 119, 255, 0.2)',
        }}
      >
        <h1 style={{ color: '#fff', fontSize: 32, marginBottom: 10 }}>
          Khám Phá Thế Giới Cùng TravelHub
        </h1>
        <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 650, margin: '0 auto' }}>
          Trải nghiệm những chuyến du lịch trọn gói tuyệt vời với mức giá ưu đãi nhất. Hơn 100+ điểm đến hấp dẫn đang chờ bạn!
        </p>
      </div>

      {/* 2. KHUNG BỘ LỌC ĐA TIÊU CHÍ (FILTER BAR) */}
      <Card
        style={{
          marginBottom: 30,
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          border: '1px solid #e8e8e8',
        }}
      >
        <Row gutter={[16, 16]} align="bottom">
          {/* CỘT 1: NƠI KHỞI HÀNH */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Nơi khởi hành:</div>
            <Select
              placeholder="Tất cả điểm đi"
              allowClear
              style={{ width: '100%' }}
              value={departureCity}
              onChange={(val) => setDepartureCity(val)}
            >
              <Select.Option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</Select.Option>
              <Select.Option value="Hà Nội">Hà Nội</Select.Option>
              <Select.Option value="Đà Nẵng">Đà Nẵng</Select.Option>
              <Select.Option value="Cần Thơ">Cần Thơ</Select.Option>
            </Select>
          </Col>

          {/* CỘT 2: LOẠI TOUR */}
          <Col xs={24} sm={12} md={5}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Loại hình tour:</div>
            <Select
              placeholder="Tất cả loại tour"
              allowClear
              style={{ width: '100%' }}
              value={tourType}
              onChange={(val) => setTourType(val)}
            >
              <Select.Option value="DOMESTIC">Trong nước</Select.Option>
              <Select.Option value="INTERNATIONAL">Quốc tế</Select.Option>
            </Select>
          </Col>

          {/* CỘT 3: DANH MỤC TOUR */}
          <Col xs={24} sm={12} md={6}>
            <div style={{ fontWeight: 500, marginBottom: 6 }}>Danh mục tour:</div>
            <Select
              placeholder="Tất cả danh mục"
              allowClear
              style={{ width: '100%' }}
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
            >
              {categories.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Col>

          {/* CỘT 4: NÚT BẤM LỌC & ĐẶT LẠI */}
          <Col xs={24} sm={12} md={7}>
            <Space style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={handleApplyFilter}
                style={{ fontWeight: 500 }}
              >
                Lọc Tour
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleResetFilter}>
                Đặt lại
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 3. TIÊU ĐỀ & SỐ LƯỢNG TOUR TÌM THẤY */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, margin: 0 }}>
            {keyword ? `Kết quả tìm kiếm cho: "${keyword}"` : 'Danh Sách Tour Du Lịch'}
          </h2>
          <span style={{ color: '#888', fontSize: 14 }}>
            Tìm thấy <b>{totalElements}</b> tour phù hợp
          </span>
        </div>
      </div>

      {/* 4. LƯỚI CARD TOUR */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : tours.length === 0 ? (
        <Empty description="Không tìm thấy tour nào thỏa mãn bộ lọc!" style={{ padding: '60px 0' }} />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {tours.map((tour) => (
              <Col xs={24} sm={12} md={8} lg={6} key={tour.id}>
                <Badge.Ribbon
                  text={tour.tourType === 'INTERNATIONAL' ? 'Quốc Tế' : (tour.categoryName || 'Tour Hot')}
                  color={tour.tourType === 'INTERNATIONAL' ? 'purple' : '#1677ff'}
                >
                  <Card
                    hoverable
                    style={{ borderRadius: 10, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
                    cover={
                      <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                        <img
                          alt={tour.name}
                          src={
                            tour.featuredImage?.startsWith('http')
                              ? tour.featuredImage
                              : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500'
                          }
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Tag
                          color="orange"
                          style={{ position: 'absolute', bottom: 10, left: 10, fontWeight: 500 }}
                        >
                          {tour.tourCode}
                        </Tag>
                      </div>
                    }
                  >
                    {/* Điểm đi - Điểm đến */}
                    <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>
                      <EnvironmentOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                      {tour.departureCity} ➔ <b>{tour.destinationCity}</b>
                    </div>

                    {/* Tên tour */}
                    <h4
                      style={{
                        fontSize: 15,
                        marginBottom: 10,
                        height: 42,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      title={tour.name}
                    >
                      {tour.name}
                    </h4>

                    {/* Thời gian */}
                    <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
                      <ClockCircleOutlined style={{ marginRight: 5, color: '#1677ff' }} />
                      Thời gian: <b>{tour.durationDays}N{tour.durationNights}Đ</b>
                    </div>

                    {/* Nút xem chi tiết */}
                    <Button
                      type="primary"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate(`/tours/${tour.id}`)}
                    >
                      Xem Chi Tiết & Đặt Vé
                    </Button>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>

          {/* 5. PHÂN TRANG DƯỚI CÙNG */}
          {totalElements > 0 && (
            <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
              <Pagination
                current={page + 1}
                pageSize={pageSize}
                total={totalElements}
                showSizeChanger={false}
                onChange={(newPage) => {
                  fetchTours(newPage - 1);
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;