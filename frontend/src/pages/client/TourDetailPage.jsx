import React, { useEffect, useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Tag,
  Button,
  Timeline,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Spin,
  Divider,
  Rate,
  List,
  Avatar,
  Image,
  Breadcrumb,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TagOutlined,
  TeamOutlined,
  StarFilled,
  UserOutlined,
  SendOutlined,
  CompassOutlined,
  FileImageOutlined,
  FileProtectOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import tourService from '../../services/tourService';
import reviewService from '../../services/reviewService';
import departureService from '../../services/departureService';
import promotionService from '../../services/promotionService';
import bookingService from '../../services/bookingService';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState(null);

  // Điểm đón khách
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loadingPickupPoints, setLoadingPickupPoints] = useState(false);

  // Đánh giá
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);

  // Modal đặt tour
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingForm] = Form.useForm();
  const [promoCode, setPromoCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);

  // Theo dõi danh sách hành khách theo thời gian thực để tính tổng tạm tính
  const watchedPassengers = Form.useWatch('passengers', bookingForm);

  const estimatedSummary = useMemo(() => {
    if (!selectedDeparture || !Array.isArray(watchedPassengers)) {
      return { adults: 0, children: 0, subtotal: 0, discount: 0, total: 0 };
    }
    let adults = 0;
    let children = 0;
    watchedPassengers.forEach((p) => {
      if (p?.passengerType === 'CHILD') children += 1;
      else adults += 1;
    });
    const subtotal =
      adults * Number(selectedDeparture.adultPrice || 0) +
      children * Number(selectedDeparture.childPrice || 0);

    let discount = 0;
    if (discountInfo) {
      if (discountInfo.discountType === 'PERCENTAGE') {
        discount = Math.round((subtotal * Number(discountInfo.discountValue || 0)) / 100);
      } else {
        discount = Number(discountInfo.discountValue || 0);
      }
      if (discount > subtotal) discount = subtotal;
    }

    return {
      adults,
      children,
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount),
    };
  }, [watchedPassengers, selectedDeparture, discountInfo]);

  // 1. Tải chi tiết tour
  const fetchTourDetail = async () => {
    setLoading(true);
    try {
      const res = await tourService.getPublicTourDetail(id);
      setData(res.data);
      if (res.data?.departures?.length > 0) {
        const firstAvailable = res.data.departures.find(
          (d) =>
            d.status === 'OPEN' &&
            d.availableSeats > 0 &&
            !dayjs(d.departureDate).isBefore(dayjs(), 'day')
        );
        setSelectedDeparture(firstAvailable || null);
      } else {
        setSelectedDeparture(null);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết tour:', err);
      message.error('Không tìm thấy thông tin tour!');
    } finally {
      setLoading(false);
    }
  };

  // 2. Tải đánh giá
  const fetchReviews = async () => {
    try {
      const [resReviews, resRating] = await Promise.all([
        reviewService.getReviewsByTourId(id),
        reviewService.getAverageRating(id),
      ]);
      setReviews(resReviews.data || []);
      setAvgRating(resRating.data || 0);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    }
  };

  // 3. Tải điểm đón theo đợt khởi hành
  const fetchPickupPoints = async (departureId) => {
    setLoadingPickupPoints(true);
    try {
      const res = await departureService.getPickupPoints(departureId);
      const points = res.data?.data || res.data || [];
      setPickupPoints(Array.isArray(points) ? points : []);
    } catch (err) {
      console.error('Lỗi tải điểm đón:', err);
      setPickupPoints([]);
    } finally {
      setLoadingPickupPoints(false);
    }
  };

  useEffect(() => {
    fetchTourDetail();
    fetchReviews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (selectedDeparture?.id) {
      fetchPickupPoints(selectedDeparture.id);
      bookingForm.setFieldValue('pickupPointId', undefined);
    } else {
      setPickupPoints([]);
    }
  }, [selectedDeparture?.id]);

  // 4. Gửi đánh giá mới
  const handleSubmitReview = async (values) => {
    const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');
    if (!savedUser.id) {
      return message.warning('Vui lòng đăng nhập tài khoản để viết đánh giá!');
    }

    setSubmittingReview(true);
    try {
      await reviewService.createReview(
        {
          tourId: Number(id),
          rating: values.rating,
          comment: values.comment,
        },
        savedUser.id
      );
      message.success('Cảm ơn bạn đã gửi đánh giá!');
      reviewForm.resetFields();
      fetchReviews();
    } catch (err) {
      message.error(err.message || 'Lỗi khi gửi đánh giá!');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 5. Kiểm tra mã giảm giá
  const handleCheckPromo = async () => {
    if (!promoCode.trim()) {
      return message.warning('Vui lòng nhập mã giảm giá!');
    }
    try {
      const res = await promotionService.checkPromotion(promoCode.trim());
      setDiscountInfo(res.data);
      message.success('Áp dụng mã giảm giá thành công!');
    } catch (err) {
      message.error(err.message || 'Mã giảm giá không hợp lệ!');
      setDiscountInfo(null);
    }
  };

  // 6. Đặt tour
  const handleBookTour = async (values) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');
      if (!savedUser.id) {
        return message.warning('Vui lòng đăng nhập tài khoản trước khi đặt tour!');
      }

      if (!selectedDeparture || !selectedDeparture.id) {
        return message.error('Vui lòng chọn đợt khởi hành hợp lệ!');
      }

      if (dayjs(selectedDeparture.departureDate).isBefore(dayjs(), 'day')) {
        return message.error('Đợt khởi hành này đã qua ngày đi, không thể đặt vé!');
      }

      if (selectedDeparture.status !== 'OPEN' || selectedDeparture.availableSeats <= 0) {
        return message.error('Đợt khởi hành này hiện đã đóng hoặc hết chỗ!');
      }

      const passengerList = values.passengers || [];
      if (passengerList.length === 0) {
        return message.error('Vui lòng thêm ít nhất một hành khách!');
      }

      if (passengerList.length > selectedDeparture.availableSeats) {
        return message.error(
          `Số lượng hành khách (${passengerList.length}) vượt quá số chỗ trống (${selectedDeparture.availableSeats}) của chuyến đi!`
        );
      }

      const sanitizedPassengers = passengerList.map((p) => ({
        fullName: p.fullName?.trim(),
        passengerType: p.passengerType || 'ADULT',
        gender: p.gender || 'MALE',
        birthDate: p.birthDate ? dayjs(p.birthDate).format('YYYY-MM-DD') : null,
        idCardOrPassport: p.idCardOrPassport ? p.idCardOrPassport.trim() : null,
        requiresSingleRoom: Boolean(p.requiresSingleRoom),
      }));

      const payload = {
        userId: Number(savedUser.id),
        departureId: Number(selectedDeparture.id),
        pickupPointId: values.pickupPointId ? Number(values.pickupPointId) : null,
        promotionCode: discountInfo ? discountInfo.code : null,
        contactName: values.contactName?.trim(),
        contactPhone: values.contactPhone?.trim(),
        contactEmail: values.contactEmail?.trim(),
        contactAddress: values.contactAddress ? values.contactAddress.trim() : null,
        specialRequests: values.specialRequests ? values.specialRequests.trim() : null,
        passengers: sanitizedPassengers,
      };

      setSubmittingBooking(true);
      const res = await bookingService.createBooking(payload);
      message.success(res?.message || 'Đặt tour thành công! Vui lòng tiến hành thanh toán.');
      setIsBookingModalOpen(false);
      bookingForm.resetFields();
      setPromoCode('');
      setDiscountInfo(null);
      navigate('/my-bookings');
    } catch (err) {
      console.error('Lỗi chi tiết khi đặt vé:', err);
      const errMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đặt vé!';
      message.error(errMsg);
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 14, color: '#64748b' }}>Đang tải chi tiết hành trình...</div>
      </div>
    );
  }

  const { tour, departures, itineraries, images, policies } = data;

  const isDepartureDisabled =
    !selectedDeparture ||
    selectedDeparture.status !== 'OPEN' ||
    selectedDeparture.availableSeats === 0 ||
    dayjs(selectedDeparture.departureDate).isBefore(dayjs(), 'day');

  return (
    <div>
      {/* 1. BREADCRUMB & ĐIỀU HƯỚNG QUAY LẠI (ORIENTATION & ALIGNMENT) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <Breadcrumb
          items={[
            { title: <Link to="/">Trang chủ</Link> },
            { title: tour.categoryName || 'Tour du lịch' },
            { title: <span style={{ color: '#0f172a', fontWeight: 600 }}>{tour.tourCode}</span> },
          ]}
        />
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} style={{ color: '#475569', fontWeight: 600 }}>
          Quay lại danh sách tour
        </Button>
      </div>

      {/* 2. TIÊU ĐỀ & THÔNG TIN TỔNG QUAN TOUR */}
      <div style={{ marginBottom: 24 }}>
        <Space size={8} wrap style={{ marginBottom: 10 }}>
          <Tag
            style={{
              background: '#e6f4f1',
              color: '#0d6e6e',
              borderColor: '#99d5cc',
              fontWeight: 700,
              borderRadius: 999,
              padding: '2px 12px',
            }}
          >
            {tour.categoryName || 'Tour Du Lịch'}
          </Tag>
          <Tag
            style={{
              background: '#f1f5f9',
              color: '#334155',
              borderColor: '#cbd5e1',
              fontWeight: 600,
              borderRadius: 999,
              padding: '2px 12px',
            }}
          >
            Mã: {tour.tourCode}
          </Tag>
          {avgRating > 0 && (
            <Tag
              style={{
                background: '#fef9c3',
                color: '#a16207',
                borderColor: '#fde047',
                fontWeight: 700,
                borderRadius: 999,
                padding: '2px 12px',
              }}
            >
              <StarFilled style={{ color: '#eab308', marginRight: 4 }} />
              {avgRating.toFixed(1)} / 5 ({reviews.length} đánh giá)
            </Tag>
          )}
        </Space>

        <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: '#0f172a', marginBottom: 12, lineHeight: 1.25 }}>
          {tour.name}
        </h1>

        <Space size={24} wrap style={{ color: '#475569', fontSize: 14.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <EnvironmentOutlined style={{ color: '#0d6e6e', fontSize: 16 }} />
            Khởi hành: <strong style={{ color: '#0f172a' }}>{tour.departureCity}</strong> ➔{' '}
            <strong style={{ color: '#0f172a' }}>{tour.destinationCity}</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ClockCircleOutlined style={{ color: '#0d6e6e', fontSize: 16 }} />
            Thời lượng: <strong style={{ color: '#0f172a' }}>{tour.durationDays} ngày {tour.durationNights} đêm</strong>
          </span>
        </Space>
      </div>

      <Row gutter={[28, 28]} align="top">
        {/* CỘT TRÁI: HÌNH ẢNH, NGÀY KHỞI HÀNH, LỊCH TRÌNH, CHÍNH SÁCH, ĐÁNH GIÁ */}
        <Col xs={24} lg={16}>
          {/* KHỐI ẢNH BÌA + ALBUM GỘP CHUNG (PROXIMITY) */}
          <div className="th-section-card" style={{ overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: 410, background: '#e2e8f0' }}>
              <img
                src={
                  tour.featuredImage?.startsWith('http')
                    ? tour.featuredImage
                    : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900'
                }
                alt={tour.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {images && images.length > 0 && (
              <div style={{ padding: '14px 18px', borderTop: '1px solid #f1f5f9', background: '#ffffff' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>
                  <FileImageOutlined style={{ color: '#0d6e6e', marginRight: 6 }} />
                  Album hình ảnh thực tế ({images.length} ảnh — nhấn để phóng to)
                </div>
                <Image.PreviewGroup>
                  <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {images.map((img) => (
                      <div key={img.id} style={{ flexShrink: 0 }}>
                        <Image
                          src={img.imageUrl}
                          alt="Ảnh tour"
                          width={124}
                          height={80}
                          style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                          fallback="https://via.placeholder.com/124x80?text=Loi+Anh"
                        />
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
          </div>

          {/* CHỌN ĐỢT KHỞI HÀNH */}
          <Card
            title={
              <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                <CalendarOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />
                Chọn ngày khởi hành
              </span>
            }
            style={{ marginBottom: 24, borderColor: '#e2e8f0' }}
          >
            {departures?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
                {departures.map((d) => {
                  const isSelected = selectedDeparture?.id === d.id;
                  const isPast = dayjs(d.departureDate).isBefore(dayjs(), 'day');
                  const isClosed = d.status !== 'OPEN' || d.availableSeats === 0 || isPast;

                  return (
                    <div
                      key={d.id}
                      onClick={() => !isClosed && setSelectedDeparture(d)}
                      className={`th-departure-card ${isSelected ? 'selected' : ''} ${isClosed ? 'disabled' : ''}`}
                    >
                      {isSelected && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            background: '#0d6e6e',
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '2px 9px',
                            borderRadius: 999,
                          }}
                        >
                          Đang chọn
                        </span>
                      )}

                      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                        {dayjs(d.departureDate).format('DD/MM/YYYY')} ➔ {dayjs(d.returnDate).format('DD/MM/YYYY')}
                      </div>

                      <div style={{ color: '#e85d04', fontSize: 18, fontWeight: 800, marginBottom: 4 }}>
                        {Number(d.adultPrice).toLocaleString('vi-VN')} đ
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}> / người lớn</span>
                      </div>

                      <div style={{ fontSize: 13, color: '#475569', marginBottom: 10 }}>
                        Trẻ em: <strong style={{ color: '#0f172a' }}>{Number(d.childPrice).toLocaleString('vi-VN')} đ</strong>
                      </div>

                      <div>
                        {isPast ? (
                          <Tag color="default" style={{ borderRadius: 999 }}>Đã khởi hành</Tag>
                        ) : d.status !== 'OPEN' ? (
                          <Tag color="red" style={{ borderRadius: 999 }}>Đã đóng</Tag>
                        ) : d.availableSeats === 0 ? (
                          <Tag color="orange" style={{ borderRadius: 999 }}>Hết chỗ</Tag>
                        ) : (
                          <Tag color="green" style={{ borderRadius: 999, fontWeight: 600 }}>
                            Còn {d.availableSeats} chỗ trống
                          </Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#64748b', margin: 0 }}>Hiện chưa có đợt khởi hành nào cho tour này.</p>
            )}
          </Card>

          {/* GIỚI THIỆU CHUYẾN ĐI */}
          <Card
            title={<span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Tổng quan chuyến đi</span>}
            style={{ marginBottom: 24, borderColor: '#e2e8f0' }}
          >
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#334155', margin: 0 }}>
              {tour.description || tour.summary}
            </p>
          </Card>

          {/* LỊCH TRÌNH CHI TIẾT */}
          <Card
            title={<span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Lịch trình chi tiết từng ngày</span>}
            style={{ marginBottom: 24, borderColor: '#e2e8f0' }}
          >
            {itineraries?.length > 0 ? (
              <Timeline
                items={itineraries.map((itin) => ({
                  color: '#0d6e6e',
                  children: (
                    <div style={{ paddingBottom: 12 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: '#0d6e6e', marginBottom: 6 }}>
                        Ngày {itin.dayNumber}: {itin.title}
                      </div>
                      <p style={{ color: '#334155', fontSize: 14.5, lineHeight: 1.7, marginBottom: 8 }}>
                        {itin.details}
                      </p>
                      {(itin.meals || itin.accommodation) && (
                        <Space size={8} wrap>
                          {itin.meals && (
                            <Tag style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
                              🍽️ Bữa ăn: <strong style={{ color: '#0f172a' }}>{itin.meals}</strong>
                            </Tag>
                          )}
                          {itin.accommodation && (
                            <Tag style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
                              🏨 Lưu trú: <strong style={{ color: '#0f172a' }}>{itin.accommodation}</strong>
                            </Tag>
                          )}
                        </Space>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <p style={{ color: '#64748b', margin: 0 }}>Lịch trình chi tiết đang được cập nhật...</p>
            )}
          </Card>

          {/* CHÍNH SÁCH & ĐIỀU KHOẢN */}
          <Card
            title={
              <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                <FileProtectOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />
                Chính sách & Điều khoản
              </span>
            }
            style={{ marginBottom: 24, borderColor: '#e2e8f0' }}
          >
            {policies && policies.length > 0 ? (
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, height: '100%' }}>
                    <h4 style={{ color: '#15803d', fontSize: 14.5, fontWeight: 700, marginBottom: 10 }}>
                      <CheckCircleOutlined style={{ marginRight: 6 }} /> Giá tour bao gồm
                    </h4>
                    <ul style={{ paddingLeft: 18, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
                      {policies
                        .filter((p) => p.policyType === 'INCLUDED')
                        .map((p) => (
                          <li key={p.id} style={{ marginBottom: 6 }}>{p.content}</li>
                        ))}
                      {policies.filter((p) => p.policyType === 'INCLUDED').length === 0 && (
                        <li style={{ color: '#64748b' }}>Theo quy định tiêu chuẩn của công ty</li>
                      )}
                    </ul>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, height: '100%' }}>
                    <h4 style={{ color: '#b91c1c', fontSize: 14.5, fontWeight: 700, marginBottom: 10 }}>
                      <CloseCircleOutlined style={{ marginRight: 6 }} /> Không bao gồm
                    </h4>
                    <ul style={{ paddingLeft: 18, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
                      {policies
                        .filter((p) => p.policyType === 'EXCLUDED')
                        .map((p) => (
                          <li key={p.id} style={{ marginBottom: 6 }}>{p.content}</li>
                        ))}
                      {policies.filter((p) => p.policyType === 'EXCLUDED').length === 0 && (
                        <li style={{ color: '#64748b' }}>Chi phí cá nhân ngoài chương trình</li>
                      )}
                    </ul>
                  </div>
                </Col>
                {policies.some((p) => p.policyType === 'POLICY_NOTE') && (
                  <Col span={24}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16 }}>
                      <h4 style={{ color: '#b45309', fontSize: 14.5, fontWeight: 700, marginBottom: 8 }}>
                        <InfoCircleOutlined style={{ marginRight: 6 }} /> Lưu ý quan trọng & Hoàn hủy
                      </h4>
                      <ul style={{ paddingLeft: 18, margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
                        {policies
                          .filter((p) => p.policyType === 'POLICY_NOTE')
                          .map((p) => (
                            <li key={p.id} style={{ marginBottom: 4 }}>{p.content}</li>
                          ))}
                      </ul>
                    </div>
                  </Col>
                )}
              </Row>
            ) : (
              <p style={{ color: '#64748b', margin: 0 }}>Chính sách chi tiết đang được cập nhật...</p>
            )}
          </Card>

          {/* ĐÁNH GIÁ CỦA KHÁCH HÀNG */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                  <StarFilled style={{ color: '#eab308', marginRight: 8 }} />
                  Đánh giá từ khách hàng
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#475569' }}>
                  {reviews.length > 0 ? `${avgRating.toFixed(1)} / 5 (${reviews.length} nhận xét)` : 'Chưa có đánh giá'}
                </span>
              </div>
            }
            style={{ borderColor: '#e2e8f0' }}
          >
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 18, borderRadius: 12, marginBottom: 22 }}>
              <h4 style={{ marginBottom: 10, fontSize: 15, fontWeight: 700 }}>Chia sẻ trải nghiệm của bạn</h4>
              <Form form={reviewForm} layout="vertical" onFinish={handleSubmitReview}>
                <Form.Item name="rating" label="Mức độ hài lòng" initialValue={5} rules={[{ required: true }]}>
                  <Rate style={{ fontSize: 20 }} />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="Nhận xét chi tiết"
                  rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
                >
                  <Input.TextArea rows={3} placeholder="Chia sẻ cảm nhận về lịch trình, khách sạn, hướng dẫn viên..." />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submittingReview}>
                  Gửi Đánh Giá
                </Button>
              </Form>
            </div>

            <List
              itemLayout="horizontal"
              dataSource={reviews}
              locale={{ emptyText: 'Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên nhận xét nhé!' }}
              renderItem={(item) => (
                <List.Item style={{ padding: '14px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0d6e6e' }} />}
                    title={
                      <Space size={8} wrap>
                        <strong style={{ color: '#0f172a' }}>{item.userName}</strong>
                        <Rate disabled value={item.rating} style={{ fontSize: 12 }} />
                        <span style={{ color: '#94a3b8', fontSize: 12 }}>
                          {dayjs(item.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </Space>
                    }
                    description={<span style={{ color: '#334155', fontSize: 14 }}>{item.comment}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* CỘT PHẢI: KHUNG ĐẶT VÉ CỐ ĐỊNH (STICKY SUMMARY & HIGH-CONTRAST CTA) */}
        <Col xs={24} lg={8}>
          <div
            className="th-section-card"
            style={{
              position: 'sticky',
              top: 92,
              padding: 24,
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              borderColor: '#cbd5e1',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0d6e6e', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
              Tóm tắt đặt tour
            </div>

            {selectedDeparture ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: '#e85d04', letterSpacing: '-0.02em' }}>
                    {Number(selectedDeparture.adultPrice).toLocaleString('vi-VN')} đ
                  </span>
                  <span style={{ fontSize: 13.5, color: '#64748b' }}>/ người lớn</span>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: 14,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Ngày khởi hành</span>
                    <strong style={{ color: '#0f172a' }}>
                      {dayjs(selectedDeparture.departureDate).format('DD/MM/YYYY')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Ngày kết thúc</span>
                    <strong style={{ color: '#0f172a' }}>
                      {dayjs(selectedDeparture.returnDate).format('DD/MM/YYYY')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Giá trẻ em</span>
                    <strong style={{ color: '#0f172a' }}>
                      {Number(selectedDeparture.childPrice).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: 10,
                      borderTop: '1px dashed #cbd5e1',
                    }}
                  >
                    <span style={{ color: '#64748b' }}>Tình trạng chỗ</span>
                    <strong style={{ color: selectedDeparture.availableSeats > 0 ? '#16a34a' : '#dc2626' }}>
                      Còn {selectedDeparture.availableSeats} ghế trống
                    </strong>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{
                    height: 50,
                    fontSize: 16,
                    fontWeight: 700,
                    background: isDepartureDisabled ? undefined : '#e85d04',
                    borderColor: isDepartureDisabled ? undefined : '#e85d04',
                    boxShadow: isDepartureDisabled ? undefined : '0 8px 18px rgba(232, 93, 4, 0.28)',
                  }}
                  disabled={isDepartureDisabled}
                  onClick={() => {
                    const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');
                    if (!savedUser.id) {
                      return message.warning('Vui lòng đăng nhập tài khoản trước khi đặt tour!');
                    }
                    bookingForm.setFieldsValue({
                      contactName: savedUser.fullName || '',
                      contactEmail: savedUser.email || '',
                      contactPhone: savedUser.phoneNumber || '',
                      contactAddress: savedUser.address || '',
                      passengers: [
                        {
                          fullName: savedUser.fullName || '',
                          passengerType: 'ADULT',
                          gender: 'MALE',
                          requiresSingleRoom: false,
                        },
                      ],
                    });
                    setIsBookingModalOpen(true);
                  }}
                >
                  {dayjs(selectedDeparture.departureDate).isBefore(dayjs(), 'day')
                    ? 'Chuyến đi đã khởi hành'
                    : selectedDeparture.status !== 'OPEN'
                    ? 'Đợt khởi hành đã đóng'
                    : selectedDeparture.availableSeats === 0
                    ? 'Đã hết chỗ trống'
                    : 'Đặt Tour Ngay'}
                </Button>

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569' }}>
                  <div><SafetyCertificateOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />Thanh toán VNPay an toàn, bảo mật</div>
                  <div><CheckCircleOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />Gửi vé điện tử & hóa đơn PDF tự động</div>
                  <div><PhoneOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />Cần tư vấn gấp? Gọi <strong>1900 8888</strong></div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px 0', color: '#64748b', fontSize: 14 }}>
                {departures?.length > 0
                  ? 'Hiện không có đợt khởi hành khả dụng (đã đóng, hết chỗ hoặc đã khởi hành).'
                  : 'Vui lòng chọn một đợt khởi hành còn trống ở danh sách bên trái.'}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* MODAL ĐẶT TOUR CÓ TÍNH TẠM TÍNH TRỰC QUAN */}
      <Modal
        title={
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Đặt Tour: {tour.name}</div>
            {selectedDeparture && (
              <div style={{ fontSize: 13, fontWeight: 500, color: '#64748b', marginTop: 2 }}>
                Ngày đi: {dayjs(selectedDeparture.departureDate).format('DD/MM/YYYY')} ➔{' '}
                {dayjs(selectedDeparture.returnDate).format('DD/MM/YYYY')}
              </div>
            )}
          </div>
        }
        open={isBookingModalOpen}
        onCancel={() => setIsBookingModalOpen(false)}
        footer={null}
        width={760}
        destroyOnHidden
      >
        <Form form={bookingForm} layout="vertical" onFinish={handleBookTour} style={{ marginTop: 12 }}>
          <h4 style={{ color: '#0d6e6e', fontWeight: 700, marginBottom: 12 }}>1. Thông tin người đặt vé</h4>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="contactName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="contactPhone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="contactEmail" label="Email nhận vé" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                <Input placeholder="email@gmail.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="contactAddress" label="Địa chỉ liên hệ">
                <Input placeholder="Địa chỉ của bạn..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '14px 0' }} />

          <h4 style={{ color: '#0d6e6e', fontWeight: 700, marginBottom: 12 }}>
            <CompassOutlined style={{ marginRight: 6 }} /> 2. Điểm đón khách{' '}
            <span style={{ color: '#64748b', fontWeight: 400, fontSize: 13 }}>(Không bắt buộc)</span>
          </h4>
          <Form.Item
            name="pickupPointId"
            label={
              <span>
                Điểm tập trung / Đón xe dọc đường{' '}
                {pickupPoints.length === 0 && (
                  <span style={{ color: '#64748b', fontWeight: 'normal' }}>(Chuyến này không có điểm đón dọc đường)</span>
                )}
              </span>
            }
            extra="Bỏ trống hoặc chọn 'Tự túc' nếu bạn tự di chuyển đến sân bay, bến xe hoặc điểm tập trung."
          >
            <Select
              placeholder={
                pickupPoints.length > 0
                  ? '🚶 Tự túc tập trung (hoặc bấm để chọn điểm đón xe dọc đường)'
                  : '🚶 Tự túc / Tập trung trực tiếp tại điểm khởi hành (sân bay, bến xe)'
              }
              loading={loadingPickupPoints}
              allowClear
              disabled={pickupPoints.length === 0}
              notFoundContent={loadingPickupPoints ? <Spin size="small" /> : 'Chưa có danh sách điểm đón cụ thể'}
            >
              <Select.Option value="">
                🚶 <b>Tự túc / Tập trung trực tiếp tại điểm khởi hành</b> (sân bay, bến xe)
              </Select.Option>
              {pickupPoints.map((point) => (
                <Select.Option key={point.id} value={point.id}>
                  📍 <b>{point.locationName}</b>{' '}
                  {point.pickupTime ? `(Đón lúc: ${String(point.pickupTime).substring(0, 5)})` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider style={{ margin: '14px 0' }} />

          <h4 style={{ color: '#0d6e6e', fontWeight: 700, marginBottom: 12 }}>
            <TeamOutlined style={{ marginRight: 6 }} /> 3. Danh sách hành khách đi tour
          </h4>

          <Form.List name="passengers">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, background: '#f8fafc', borderColor: '#e2e8f0', borderRadius: 10 }}
                    title={<span style={{ fontWeight: 700, fontSize: 13.5 }}>Hành khách #{index + 1}</span>}
                    extra={fields.length > 1 ? <Button danger type="text" size="small" onClick={() => remove(name)}>Xóa</Button> : null}
                  >
                    <Row gutter={12}>
                      <Col xs={24} sm={10}>
                        <Form.Item
                          {...restField}
                          name={[name, 'fullName']}
                          label="Họ tên"
                          rules={[{ required: true, message: 'Nhập họ tên hành khách!' }]}
                          style={{ marginBottom: 4 }}
                        >
                          <Input placeholder="Lê Văn Khách" />
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={7}>
                        <Form.Item
                          {...restField}
                          name={[name, 'passengerType']}
                          label="Độ tuổi"
                          initialValue="ADULT"
                          rules={[{ required: true, message: 'Chọn độ tuổi!' }]}
                          style={{ marginBottom: 4 }}
                        >
                          <Select>
                            <Select.Option value="ADULT">Người lớn</Select.Option>
                            <Select.Option value="CHILD">Trẻ em</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={12} sm={7}>
                        <Form.Item
                          {...restField}
                          name={[name, 'gender']}
                          label="Giới tính"
                          initialValue="MALE"
                          rules={[{ required: true, message: 'Chọn giới tính!' }]}
                          style={{ marginBottom: 4 }}
                        >
                          <Select>
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ passengerType: 'ADULT', gender: 'MALE', requiresSingleRoom: false })}
                  block
                  style={{ marginBottom: 12 }}
                  disabled={selectedDeparture && fields.length >= selectedDeparture.availableSeats}
                >
                  {selectedDeparture && fields.length >= selectedDeparture.availableSeats
                    ? `Đã đạt giới hạn số chỗ trống (${selectedDeparture.availableSeats} ghế)`
                    : '+ Thêm hành khách đi cùng'}
                </Button>
              </>
            )}
          </Form.List>

          <Divider style={{ margin: '14px 0' }} />

          <h4 style={{ color: '#0d6e6e', fontWeight: 700, marginBottom: 10 }}>4. Mã giảm giá / Voucher</h4>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Input
              placeholder="Nhập mã ưu đãi (VD: HE2026)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <Button icon={<TagOutlined />} onClick={handleCheckPromo} style={{ fontWeight: 600 }}>
              Áp dụng
            </Button>
          </div>
          {discountInfo && (
            <Tag color="green" style={{ marginBottom: 14, padding: '4px 10px', borderRadius: 8 }}>
              ✓ Đã áp dụng [{discountInfo.code}]: Giảm{' '}
              {discountInfo.discountType === 'PERCENTAGE'
                ? `${discountInfo.discountValue}%`
                : `${Number(discountInfo.discountValue).toLocaleString('vi-VN')} đ`}
            </Tag>
          )}

          {/* BẢNG TẠM TÍNH TRỰC QUAN TRƯỚC KHI XÁC NHẬN */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 12,
              padding: '14px 18px',
              marginTop: 8,
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#475569', marginBottom: 6 }}>
              <span>
                Hành khách: <strong>{estimatedSummary.adults}</strong> người lớn
                {estimatedSummary.children > 0 ? `, ${estimatedSummary.children} trẻ em` : ''}
              </span>
              <span>{estimatedSummary.subtotal.toLocaleString('vi-VN')} đ</span>
            </div>
            {estimatedSummary.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#16a34a', marginBottom: 6 }}>
                <span>Giảm giá voucher</span>
                <span>- {estimatedSummary.discount.toLocaleString('vi-VN')} đ</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
                borderTop: '1px dashed #cbd5e1',
              }}
            >
              <strong style={{ fontSize: 15, color: '#0f172a' }}>Tổng thanh toán tạm tính</strong>
              <strong style={{ fontSize: 20, color: '#e85d04' }}>
                {estimatedSummary.total.toLocaleString('vi-VN')} đ
              </strong>
            </div>
          </div>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsBookingModalOpen(false)}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={submittingBooking}
                style={{ background: '#e85d04', borderColor: '#e85d04', fontWeight: 700, paddingInline: 28 }}
              >
                Xác Nhận Đặt Tour
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TourDetailPage;
