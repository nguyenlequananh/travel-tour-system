import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Empty,
  Row,
  Col,
  Segmented,
} from 'antd';
import {
  ShoppingOutlined,
  RollbackOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  TeamOutlined,
  FilePdfOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CompassOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import exportService from '../../services/exportService';
import { useAuth } from '../../context/AuthContext';
import BookingDetailModal from '../../components/BookingDetailModal';

const MyBookingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal chi tiết đơn
  const [detailBooking, setDetailBooking] = useState(null);

  // Modal hủy vé
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelForm] = Form.useForm();

  const fetchMyBookings = async () => {
    if (!user?.id) {
      setBookings([]);
      return;
    }

    setLoading(true);
    try {
      const res = await bookingService.getMyBookings(user.id);
      setBookings(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải lịch sử vé!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMyBookings();
    }

    const handleAutoReload = () => {
      fetchMyBookings();
    };
    window.addEventListener('booking-status-updated', handleAutoReload);
    return () => {
      window.removeEventListener('booking-status-updated', handleAutoReload);
    };
  }, [user?.id]);

  // Thống kê nhanh theo trạng thái
  const stats = useMemo(() => {
    const total = bookings.length;
    const unpaid = bookings.filter(
      (b) => b.paymentStatus === 'UNPAID' && b.bookingStatus !== 'CANCELLED'
    ).length;
    const confirmed = bookings.filter(
      (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED'
    ).length;
    const cancelled = bookings.filter((b) => b.bookingStatus === 'CANCELLED').length;
    return { total, unpaid, confirmed, cancelled };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'UNPAID') {
      return bookings.filter(
        (b) => b.paymentStatus === 'UNPAID' && b.bookingStatus !== 'CANCELLED'
      );
    }
    if (statusFilter === 'CONFIRMED') {
      return bookings.filter(
        (b) => b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED'
      );
    }
    if (statusFilter === 'CANCELLED') {
      return bookings.filter((b) => b.bookingStatus === 'CANCELLED');
    }
    return bookings;
  }, [bookings, statusFilter]);

  const handleRequestCancel = async (values) => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      await bookingService.requestCancel({
        bookingId: selectedBooking.id,
        reason: values.reason,
      });
      message.success('Đã gửi yêu cầu hủy vé thành công! Quản trị viên sẽ sớm xử lý.');
      setCancelModalOpen(false);
      cancelForm.resetFields();
      fetchMyBookings();
    } catch (err) {
      message.error(err.message || 'Không thể gửi yêu cầu hủy vé!');
    } finally {
      setCancelling(false);
    }
  };

  const handlePayWithVnPay = async (bookingId) => {
    try {
      message.loading({ content: 'Đang kết nối tới cổng thanh toán VNPay...', key: 'vnpay' });
      const res = await paymentService.createVnPayUrl(bookingId);
      window.location.href = res.data;
    } catch (err) {
      message.error({ content: err.message || 'Lỗi kết nối cổng thanh toán VNPay!', key: 'vnpay' });
    }
  };

  const handleDownloadTicketPdf = async (bookingId) => {
    try {
      message.loading({ content: 'Đang tạo vé điện tử PDF...', key: 'ticket_pdf' });
      await exportService.exportBookingTicketPdf(bookingId);
      message.success({ content: 'Đã tải vé điện tử & hóa đơn (PDF) thành công!', key: 'ticket_pdf' });
    } catch (err) {
      message.error({ content: err.message || 'Lỗi khi tải file PDF vé tour!', key: 'ticket_pdf' });
    }
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 145,
      render: (code) => (
        <Tag
          style={{
            background: '#e6f4f1',
            color: '#0d6e6e',
            borderColor: '#99d5cc',
            fontWeight: 700,
            borderRadius: 6,
          }}
        >
          {code}
        </Tag>
      ),
    },
    {
      title: 'Chuyến Đi',
      dataIndex: 'tourName',
      key: 'tourName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{text}</div>
          <div style={{ fontSize: 12.5, color: '#64748b' }}>
            <CalendarOutlined style={{ marginRight: 5, color: '#0d6e6e' }} />
            Khởi hành: <strong>{dayjs(record.departureDate).format('DD/MM/YYYY')}</strong>
            <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
            <TeamOutlined style={{ marginRight: 4, color: '#0d6e6e' }} />
            {record.totalPassengers} khách
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 145,
      align: 'right',
      render: (p) => (
        <strong style={{ color: '#e85d04', fontSize: 15 }}>
          {Number(p).toLocaleString('vi-VN')} đ
        </strong>
      ),
    },
    {
      title: 'Trạng Thái',
      key: 'status',
      width: 175,
      render: (_, record) => {
        let bookingColor = 'gold';
        let bookingLabel = 'Chờ xác nhận';
        if (record.bookingStatus === 'CONFIRMED') {
          bookingColor = 'green';
          bookingLabel = 'Đã xác nhận';
        } else if (record.bookingStatus === 'CANCELLED') {
          bookingColor = 'red';
          bookingLabel = 'Đã hủy';
        } else if (record.bookingStatus === 'COMPLETED') {
          bookingColor = 'blue';
          bookingLabel = 'Hoàn thành';
        }

        let payColor = 'orange';
        let payLabel = 'Chưa thanh toán';
        if (record.paymentStatus === 'PAID') {
          payColor = 'green';
          payLabel = 'Đã thanh toán';
        } else if (record.paymentStatus === 'DEPOSITED') {
          payColor = 'blue';
          payLabel = 'Đã đặt cọc';
        } else if (record.paymentStatus === 'REFUNDED') {
          payColor = 'purple';
          payLabel = 'Đã hoàn tiền';
        }

        return (
          <Space direction="vertical" size={4}>
            <Tag color={bookingColor} style={{ margin: 0, borderRadius: 999, fontWeight: 600 }}>
              {bookingLabel}
            </Tag>
            <Tag color={payColor} style={{ margin: 0, borderRadius: 999, fontSize: 11.5 }}>
              {payLabel}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      width: 260,
      render: (_, record) => (
        <Space size={6} wrap>
          {record.paymentStatus === 'UNPAID' && record.bookingStatus !== 'CANCELLED' && (
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              style={{
                background: '#e85d04',
                borderColor: '#e85d04',
                fontWeight: 700,
                height: 32,
              }}
              onClick={() => handlePayWithVnPay(record.id)}
            >
              Thanh toán VNPay
            </Button>
          )}

          {record.paymentStatus === 'PAID' && (
            <Button
              size="small"
              icon={<FilePdfOutlined />}
              style={{
                color: '#0d6e6e',
                borderColor: '#99d5cc',
                backgroundColor: '#e6f4f1',
                fontWeight: 600,
                height: 32,
              }}
              onClick={() => handleDownloadTicketPdf(record.id)}
            >
              Vé PDF
            </Button>
          )}

          <Button
            size="small"
            icon={<EyeOutlined />}
            style={{ height: 32 }}
            onClick={() => setDetailBooking(record)}
          >
            Chi tiết
          </Button>

          {record.bookingStatus !== 'CANCELLED' && record.bookingStatus !== 'COMPLETED' && (
            <Button
              danger
              size="small"
              icon={<RollbackOutlined />}
              style={{ height: 32 }}
              onClick={() => {
                setSelectedBooking(record);
                setCancelModalOpen(true);
              }}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!isAuthenticated || !user?.id) {
    return (
      <div className="th-section-card" style={{ maxWidth: 680, margin: '48px auto', padding: '56px 24px', textAlign: 'center' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div style={{ color: '#475569', fontSize: 15 }}>
              Vui lòng <strong>đăng nhập tài khoản</strong> ở góc trên bên phải để xem và quản lý vé du lịch của bạn.
            </div>
          }
        >
          <Button type="primary" icon={<CompassOutlined />} onClick={() => navigate('/')}>
            Khám phá tour ngay
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      {/* 1. TIÊU ĐỀ TRANG */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
            <ShoppingOutlined style={{ marginRight: 10, color: '#0d6e6e' }} />
            Vé Du Lịch Của Tôi
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>
            Quản lý đơn đặt tour, thanh toán trực tuyến VNPay và tải vé điện tử của{' '}
            <strong style={{ color: '#0f172a' }}>{user.fullName || user.email}</strong>
          </p>
        </div>

        <Button type="primary" icon={<CompassOutlined />} onClick={() => navigate('/')}>
          Đặt thêm tour mới
        </Button>
      </div>

      {/* 2. THẺ THỐNG KÊ NHANH (PROXIMITY + VISUAL SCANNABILITY) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 22 }}>
        <Col xs={12} md={6}>
          <div className="th-section-card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>TỔNG ĐƠN ĐẶT</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{stats.total}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="th-section-card" style={{ padding: '16px 20px', borderLeft: '4px solid #e85d04' }}>
            <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>
              <ClockCircleOutlined style={{ color: '#e85d04', marginRight: 5 }} /> CHỜ THANH TOÁN
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#e85d04' }}>{stats.unpaid}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="th-section-card" style={{ padding: '16px 20px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>
              <CheckCircleOutlined style={{ color: '#16a34a', marginRight: 5 }} /> ĐÃ XÁC NHẬN
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>{stats.confirmed}</div>
          </div>
        </Col>
        <Col xs={12} md={6}>
          <div className="th-section-card" style={{ padding: '16px 20px', borderLeft: '4px solid #dc2626' }}>
            <div style={{ fontSize: 12.5, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>
              <CloseCircleOutlined style={{ color: '#dc2626', marginRight: 5 }} /> ĐÃ HỦY
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#64748b' }}>{stats.cancelled}</div>
          </div>
        </Col>
      </Row>

      {/* 3. BỘ LỌC TRẠNG THÁI & BẢNG ĐƠN */}
      <div className="th-section-card" style={{ padding: 20 }}>
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
          <Segmented
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: `Tất cả (${stats.total})`, value: 'ALL' },
              { label: `Chờ thanh toán (${stats.unpaid})`, value: 'UNPAID' },
              { label: `Đã xác nhận (${stats.confirmed})`, value: 'CONFIRMED' },
              { label: `Đã hủy (${stats.cancelled})`, value: 'CANCELLED' },
            ]}
          />
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Hiển thị <strong>{filteredBookings.length}</strong> đơn hàng
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          loading={loading}
          scroll={{ x: 860 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có đơn đặt tour nào trong mục này."
              />
            ),
          }}
          pagination={{
            position: ['bottomCenter'],
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} đơn`,
          }}
        />
      </div>

      {/* MODAL XEM CHI TIẾT ĐƠN & DANH SÁCH HÀNH KHÁCH */}
      <BookingDetailModal
        open={Boolean(detailBooking)}
        booking={detailBooking}
        onClose={() => setDetailBooking(null)}
      />

      {/* MODAL YÊU CẦU HỦY VÉ */}
      <Modal
        title={
          <span style={{ fontSize: 17, fontWeight: 700, color: '#dc2626' }}>
            <RollbackOutlined style={{ marginRight: 8 }} />
            Yêu Cầu Hủy Vé — {selectedBooking?.bookingCode}
          </span>
        }
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={cancelForm} layout="vertical" onFinish={handleRequestCancel} style={{ marginTop: 10 }}>
          <div
            style={{
              background: '#fffbeb',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid #fde68a',
              marginBottom: 16,
              fontSize: 13.5,
              color: '#92400e',
            }}
          >
            <strong>Chính sách hoàn hủy của TravelHub:</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: 1.7 }}>
              <li>Hủy trước 15 ngày khởi hành: Hoàn tiền 100%.</li>
              <li>Hủy trước 7 – 14 ngày: Hoàn lại 70% (phí 30%).</li>
              <li>Hủy trước 3 – 6 ngày: Hoàn lại 30% (phí 70%).</li>
              <li>Hủy dưới 3 ngày: Không hoàn tiền.</li>
            </ul>
          </div>

          <Form.Item
            name="reason"
            label={<span style={{ fontWeight: 600 }}>Lý do hủy tour</span>}
            rules={[{ required: true, message: 'Vui lòng cung cấp lý do bạn muốn hủy vé!' }]}
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: Có lịch công tác đột xuất, thay đổi kế hoạch cá nhân..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 16 }}>
            <Space>
              <Button onClick={() => setCancelModalOpen(false)}>Quay lại</Button>
              <Button type="primary" danger htmlType="submit" loading={cancelling}>
                Xác Nhận Hủy Vé
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;
