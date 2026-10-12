import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Tag, Button, Timeline, Modal, Form,
  Input, Select, Space, message, Spin, Divider, Rate, List, Avatar
} from 'antd';
import {
  CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined,
  TagOutlined, TeamOutlined, StarOutlined, UserOutlined, SendOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axiosClient from '../../api/axiosClient';

const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState(null);

  // State đánh giá (Reviews)
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewForm] = Form.useForm();
  const [submittingReview, setSubmittingReview] = useState(false);

  // State cho Modal đặt tour
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm] = Form.useForm();
  const [promoCode, setPromoCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState(null);

  // 1. Tải chi tiết tour
  const fetchTourDetail = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/tours/${id}`);
      setData(res.data);
      if (res.data?.departures?.length > 0) {
        const firstOpen = res.data.departures.find(d => d.status === 'OPEN' && d.availableSeats > 0);
        setSelectedDeparture(firstOpen || res.data.departures[0]);
      }
    } catch (err) {
      message.error('Không tìm thấy thông tin tour!');
    } finally {
      setLoading(false);
    }
  };

  // 2. Tải danh sách đánh giá & điểm sao trung bình
  const fetchReviews = async () => {
    try {
      const [resReviews, resRating] = await Promise.all([
        axiosClient.get(`/reviews/tour/${id}`),
        axiosClient.get(`/reviews/tour/${id}/rating`),
      ]);
      setReviews(resReviews.data || []);
      setAvgRating(resRating.data || 0);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    }
  };

  useEffect(() => {
    fetchTourDetail();
    fetchReviews();
  }, [id]);

  // 3. Khách gửi đánh giá mới
  const handleSubmitReview = async (values) => {
    const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');
    if (!savedUser.id) {
      return message.warning('Vui lòng đăng nhập tài khoản để viết đánh giá!');
    }

    setSubmittingReview(true);
    try {
      await axiosClient.post(`/reviews?userId=${savedUser.id}`, {
        tourId: Number(id),
        rating: values.rating,
        comment: values.comment,
      });
      message.success('Cảm ơn bạn đã gửi đánh giá!');
      reviewForm.resetFields();
      fetchReviews(); // Tải lại danh sách review mới
    } catch (err) {
      message.error(err.message || 'Lỗi khi gửi đánh giá!');
    } finally {
      setSubmittingReview(false);
    }
  };

  // 4. Khách kiểm tra mã giảm giá
  const handleCheckPromo = async () => {
    if (!promoCode.trim()) {
      return message.warning('Vui lòng nhập mã giảm giá!');
    }
    try {
      const res = await axiosClient.get(`/promotions/check?code=${promoCode.trim()}`);
      setDiscountInfo(res.data);
      message.success('Áp dụng mã giảm giá thành công!');
    } catch (err) {
      message.error(err.message || 'Mã giảm giá không hợp lệ!');
      setDiscountInfo(null);
    }
  };

  // 5. Khách bấm Xác nhận đặt tour (POST /bookings)
  const handleBookTour = async (values) => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');

      const payload = {
        userId: savedUser.id,
        departureId: selectedDeparture.id,
        promotionCode: discountInfo ? discountInfo.code : null,
        contactName: values.contactName,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        contactAddress: values.contactAddress,
        specialRequests: values.specialRequests,
        passengers: values.passengers,
      };

      await axiosClient.post('/bookings', payload);
      message.success('Đặt tour thành công!');
      setIsBookingModalOpen(false);
      bookingForm.resetFields();
      navigate('/my-bookings');
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi đặt vé!');
    }
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const { tour, departures, itineraries } = data;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* ẢNH BÌA & TIÊU ĐỀ TOUR */}
      <div style={{ marginBottom: 25 }}>
        <Space style={{ marginBottom: 8 }}>
          <Tag color="blue">{tour.categoryName}</Tag>
          {avgRating > 0 && (
            <Tag color="gold" icon={<StarOutlined />}>
              ⭐ {avgRating.toFixed(1)} / 5 ({reviews.length} đánh giá)
            </Tag>
          )}
        </Space>
        <h1 style={{ fontSize: 28, marginBottom: 10 }}>{tour.name}</h1>
        <Space size="large" style={{ color: '#666', fontSize: 14 }}>
          <span><EnvironmentOutlined style={{ color: '#ff4d4f' }} /> {tour.departureCity} ➔ {tour.destinationCity}</span>
          <span><ClockCircleOutlined style={{ color: '#1677ff' }} /> Thời gian: <b>{tour.durationDays}N{tour.durationNights}Đ</b></span>
          <span>Mã tour: <b>{tour.tourCode}</b></span>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* CỘT TRÁI (70%) */}
        <Col xs={24} lg={16}>
          <div style={{ borderRadius: 12, overflow: 'hidden', height: 380, marginBottom: 25 }}>
            <img
              src={tour.featuredImage?.startsWith('http') ? tour.featuredImage : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}
              alt={tour.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* CÁC ĐỢT KHỞI HÀNH */}
          <Card title={<><CalendarOutlined style={{ color: '#1677ff', marginRight: 8 }} /> Các đợt khởi hành đang mở bán (Chọn ngày đi)</>} style={{ marginBottom: 25 }}>
            {departures?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {departures.map((d) => {
                  const isSelected = selectedDeparture?.id === d.id;
                  const isClosed = d.status !== 'OPEN' || d.availableSeats === 0;

                  return (
                    <div
                      key={d.id}
                      onClick={() => !isClosed && setSelectedDeparture(d)}
                      style={{
                        border: isSelected ? '2px solid #1677ff' : '1px solid #e8e8e8',
                        backgroundColor: isSelected ? '#e6f4ff' : isClosed ? '#fafafa' : '#fff',
                        borderRadius: 10,
                        padding: 14,
                        cursor: isClosed ? 'not-allowed' : 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s',
                      }}
                    >
                      {isSelected && (
                        <Tag color="#1677ff" style={{ position: 'absolute', top: -10, right: 10, borderRadius: 10 }}>
                          ✓ Đang chọn
                        </Tag>
                      )}
                      <div style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 6 }}>
                        📅 {dayjs(d.departureDate).format('DD/MM/YYYY')} ➔ {dayjs(d.returnDate).format('DD/MM/YYYY')}
                      </div>
                      <div style={{ color: '#d4380d', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
                        {Number(d.adultPrice).toLocaleString()} đ <span style={{ fontSize: 12, color: '#888', fontWeight: 'normal' }}>/người lớn</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                        Trẻ em: <b>{Number(d.childPrice).toLocaleString()} đ</b>
                      </div>
                      <div style={{ fontSize: 12 }}>
                        {isClosed ? (
                          <Tag color="red">Hết chỗ / Đã đóng</Tag>
                        ) : (
                          <Tag color="green">Còn trống {d.availableSeats} chỗ</Tag>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#888' }}>Hiện chưa có đợt khởi hành nào cho tour này.</p>
            )}
          </Card>

          {/* GIỚI THIỆU TOUR */}
          <Card title="Giới thiệu chuyến đi" style={{ marginBottom: 25 }}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: '#444' }}>{tour.description || tour.summary}</p>
          </Card>

          {/* LỊCH TRÌNH CHI TIẾT */}
          <Card title="Lịch trình chi tiết từng ngày" style={{ marginBottom: 25 }}>
            {itineraries?.length > 0 ? (
              <Timeline
                items={itineraries.map((itin) => ({
                  color: 'blue',
                  children: (
                    <div style={{ marginBottom: 15 }}>
                      <h4 style={{ fontSize: 16, color: '#1677ff', marginBottom: 6 }}>
                        Ngày {itin.dayNumber}: {itin.title}
                      </h4>
                      <p style={{ color: '#555', marginBottom: 6 }}>{itin.details}</p>
                      <Space size="middle" style={{ fontSize: 12, color: '#888' }}>
                        {itin.meals && <span>🍽️ Bữa ăn: <b>{itin.meals}</b></span>}
                        {itin.accommodation && <span>🏨 Khách sạn: <b>{itin.accommodation}</b></span>}
                      </Space>
                    </div>
                  ),
                }))}
              />
            ) : (
              <p style={{ color: '#888' }}>Lịch trình chi tiết đang được cập nhật...</p>
            )}
          </Card>

          {/* ================= KHUNG ĐÁNH GIÁ CỦA KHÁCH HÀNG (REVIEWS) ================= */}
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><StarOutlined style={{ color: '#faad14', marginRight: 8 }} /> Đánh giá từ khách hàng</span>
                <span style={{ fontSize: 14, fontWeight: 'normal', color: '#666' }}>
                  {reviews.length > 0 ? `⭐ ${avgRating.toFixed(1)}/5 (${reviews.length} đánh giá)` : 'Chưa có đánh giá'}
                </span>
              </div>
            }
            style={{ marginBottom: 25 }}
          >
            {/* FORM GỬI ĐÁNH GIÁ MỚI */}
            <div style={{ background: '#fafafa', padding: 18, borderRadius: 8, marginBottom: 25 }}>
              <h4 style={{ marginBottom: 10 }}>Viết nhận xét của bạn:</h4>
              <Form form={reviewForm} layout="vertical" onFinish={handleSubmitReview}>
                <Form.Item name="rating" label="Chấm điểm số sao:" initialValue={5} rules={[{ required: true }]}>
                  <Rate style={{ fontSize: 20 }} />
                </Form.Item>
                <Form.Item name="comment" label="Cảm nhận của bạn về chuyến đi:" rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}>
                  <Input.TextArea rows={3} placeholder="Chia sẻ trải nghiệm về khách sạn, xe cộ, hướng dẫn viên..." />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={submittingReview}>
                  Gửi Đánh Giá
                </Button>
              </Form>
            </div>

            {/* DANH SÁCH BÌNH LUẬN */}
            <List
              itemLayout="horizontal"
              dataSource={reviews}
              locale={{ emptyText: 'Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên đánh giá nhé!' }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />}
                    title={
                      <Space>
                        <b>{item.userName}</b>
                        <Rate disabled value={item.rating} style={{ fontSize: 12 }} />
                        <span style={{ color: '#aaa', fontSize: 12 }}>
                          {dayjs(item.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </Space>
                    }
                    description={<span style={{ color: '#444' }}>{item.comment}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* CỘT PHẢI (30%): TÓM TẮT GIÁ & NÚT ĐẶT VÉ */}
        <Col xs={24} lg={8}>
          <Card
            style={{
              position: 'sticky',
              top: 90,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              borderRadius: 12,
              borderColor: '#91caff',
            }}
          >
            <h3 style={{ marginBottom: 15 }}>Tóm tắt giá vé</h3>
            {selectedDeparture ? (
              <div>
                <div style={{ background: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 20 }}>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>
                    Ngày đi: <b>{dayjs(selectedDeparture.departureDate).format('DD/MM/YYYY')}</b>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>
                    Ngày về: <b>{dayjs(selectedDeparture.returnDate).format('DD/MM/YYYY')}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Giá người lớn:</span>
                    <strong style={{ color: '#d4380d', fontSize: 16 }}>
                      {Number(selectedDeparture.adultPrice).toLocaleString()} đ
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Giá trẻ em:</span>
                    <strong>{Number(selectedDeparture.childPrice).toLocaleString()} đ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Chỗ còn trống:</span>
                    <b style={{ color: '#52c41a' }}>{selectedDeparture.availableSeats} ghế</b>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  style={{ height: 50, fontSize: 16, fontWeight: 'bold' }}
                  disabled={!selectedDeparture || selectedDeparture.availableSeats === 0}
                  onClick={() => {
                    const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');
                    if (!savedUser.id) {
                      return message.warning('Vui lòng đăng nhập tài khoản trước khi đặt tour!');
                    }
                    bookingForm.setFieldsValue({
                      contactName: savedUser.fullName,
                      contactEmail: savedUser.email,
                      contactPhone: savedUser.phoneNumber,
                      passengers: [
                        {
                          fullName: savedUser.fullName,
                          passengerType: 'ADULT',
                          gender: 'MALE',
                          requiresSingleRoom: false,
                        },
                      ],
                    });
                    setIsBookingModalOpen(true);
                  }}
                >
                  Đặt Tour Ngay
                </Button>
              </div>
            ) : (
              <p style={{ color: '#888' }}>Vui lòng chọn đợt khởi hành bên cạnh.</p>
            )}
          </Card>
        </Col>
      </Row>

      {/* MODAL ĐẶT TOUR */}
      <Modal
        title={`Đặt Tour: ${tour.name}`}
        open={isBookingModalOpen}
        onCancel={() => setIsBookingModalOpen(false)}
        footer={null}
        width={750}
        destroyOnHidden
      >
        <Form form={bookingForm} layout="vertical" onFinish={handleBookTour}>
          <h4 style={{ color: '#1677ff', marginBottom: 12 }}>1. Thông tin người đặt vé</h4>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactName" label="Họ và tên" rules={[{ required: true }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input placeholder="0912345678" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactEmail" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="email@gmail.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactAddress" label="Địa chỉ">
                <Input placeholder="Địa chỉ liên hệ..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '15px 0' }} />

          {/* DANH SÁCH HÀNH KHÁCH ĐI CÙNG */}
          <h4 style={{ color: '#1677ff', margin: 0, marginBottom: 12 }}>
            <TeamOutlined style={{ marginRight: 6 }} /> 2. Danh sách hành khách đi tour
          </h4>

          <Form.List name="passengers">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, background: '#fafafa' }}
                    title={`Hành khách #${index + 1}`}
                    extra={fields.length > 1 ? <Button danger type="text" onClick={() => remove(name)}>Xóa</Button> : null}
                  >
                    <Row gutter={12}>
                      <Col span={10}>
                        <Form.Item {...restField} name={[name, 'fullName']} label="Họ tên" rules={[{ required: true }]}>
                          <Input placeholder="Lê Văn Khách" />
                        </Form.Item>
                      </Col>
                      <Col span={7}>
                        <Form.Item {...restField} name={[name, 'passengerType']} label="Độ tuổi" initialValue="ADULT">
                          <Select>
                            <Select.Option value="ADULT">Người lớn</Select.Option>
                            <Select.Option value="CHILD">Trẻ em</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={7}>
                        <Form.Item {...restField} name={[name, 'gender']} label="Giới tính" initialValue="MALE">
                          <Select>
                            <Select.Option value="MALE">Nam</Select.Option>
                            <Select.Option value="FEMALE">Nữ</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add({ passengerType: 'ADULT', gender: 'MALE', requiresSingleRoom: false })} block style={{ marginBottom: 15 }}>
                  + Thêm hành khách đi cùng
                </Button>
              </>
            )}
          </Form.List>

          <Divider style={{ margin: '15px 0' }} />

          {/* VOUCHER */}
          <h4 style={{ color: '#1677ff' }}>3. Mã giảm giá / Voucher</h4>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <Input
              placeholder="VD: HE2024"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <Button type="dashed" icon={<TagOutlined />} onClick={handleCheckPromo}>
              Áp dụng
            </Button>
          </div>
          {discountInfo && (
            <Tag color="green" style={{ marginBottom: 15, padding: '4px 8px' }}>
              ✓ Đã áp dụng [{discountInfo.code}]: Giảm {discountInfo.discountType === 'PERCENTAGE' ? `${discountInfo.discountValue}%` : `${Number(discountInfo.discountValue).toLocaleString()} đ`}
            </Tag>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 20 }}>
            <Space>
              <Button onClick={() => setIsBookingModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" size="large">
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