import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, message, Space, Card, Empty } from 'antd';
import { ShoppingOutlined, RollbackOutlined, CreditCardOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

const MyBookingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
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

    // Tự động tải lại bảng vé khi nhận WebSocket thông báo từ Admin mà không cần F5 trang
    const handleAutoReload = () => {
      fetchMyBookings();
    };
    window.addEventListener('booking-status-updated', handleAutoReload);
    return () => {
      window.removeEventListener('booking-status-updated', handleAutoReload);
    };
  }, [user?.id]);

  // Gửi yêu cầu hủy vé
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

  // Thanh toán VNPay
  const handlePayWithVnPay = async (bookingId) => {
    try {
      message.loading({ content: 'Đang kết nối tới cổng thanh toán VNPay...', key: 'vnpay' });
      const res = await paymentService.createVnPayUrl(bookingId);
      window.location.href = res.data;
    } catch (err) {
      message.error({ content: err.message || 'Lỗi kết nối cổng thanh toán VNPay!', key: 'vnpay' });
    }
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (code) => <Tag color="blue" style={{ fontWeight: 600 }}>{code}</Tag>,
    },
    {
      title: 'Tên Chuyến Đi',
      dataIndex: 'tourName',
      key: 'tourName',
      render: (text) => <strong style={{ color: '#1f1f1f' }}>{text}</strong>,
    },
    {
      title: 'Khởi Hành',
      dataIndex: 'departureDate',
      key: 'departureDate',
      render: (d) => (
        <span>
          <CalendarOutlined style={{ marginRight: 6, color: '#1677ff' }} />
          {dayjs(d).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Số Khách',
      dataIndex: 'totalPassengers',
      key: 'totalPassengers',
      render: (count) => (
        <span>
          <TeamOutlined style={{ marginRight: 6, color: '#52c41a' }} />
          {count} khách
        </span>
      ),
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (p) => <strong style={{ color: '#d4380d', fontSize: 14 }}>{Number(p).toLocaleString('vi-VN')} đ</strong>,
    },
    {
      title: 'Trạng Thái Vé',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (s) => {
        let color = 'gold';
        let label = 'Chờ xử lý';
        if (s === 'CONFIRMED') { color = 'green'; label = 'Đã xác nhận'; }
        else if (s === 'CANCELLED') { color = 'red'; label = 'Đã hủy'; }
        else if (s === 'COMPLETED') { color = 'blue'; label = 'Hoàn thành'; }
        return <Tag color={color} style={{ fontWeight: 500 }}>{label}</Tag>;
      },
    },
    {
      title: 'Thanh Toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (p) => {
        let color = 'orange';
        let label = 'Chưa thanh toán';
        if (p === 'PAID') { color = 'green'; label = 'Đã thanh toán'; }
        else if (p === 'DEPOSITED') { color = 'blue'; label = 'Đã đặt cọc'; }
        else if (p === 'REFUNDED') { color = 'purple'; label = 'Đã hoàn tiền'; }
        return <Tag color={color} style={{ fontWeight: 500 }}>{label}</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.paymentStatus === 'UNPAID' && record.bookingStatus !== 'CANCELLED' && (
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              style={{ background: '#005baa', borderColor: '#005baa', fontWeight: 600 }}
              onClick={() => handlePayWithVnPay(record.id)}
            >
              Thanh toán VNPay
            </Button>
          )}

          {record.bookingStatus !== 'CANCELLED' && record.bookingStatus !== 'COMPLETED' && (
            <Button
              danger
              size="small"
              icon={<RollbackOutlined />}
              onClick={() => {
                setSelectedBooking(record);
                setCancelModalOpen(true);
              }}
            >
              Hủy vé
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (!isAuthenticated || !user?.id) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center' }}>
        <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Vui lòng đăng nhập để xem danh sách vé và quản lý đơn đặt tour của bạn!"
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1f1f1f' }}>
          <ShoppingOutlined style={{ marginRight: 10, color: '#1677ff' }} />
          Danh Sách Vé Du Lịch Của Tôi
        </h2>
        <p style={{ color: '#8c8c8c', marginTop: 4 }}>
          Tài khoản: <b>{user.fullName || user.email}</b>
        </p>
      </div>

      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: 'Bạn chưa đặt vé tour nào. Hãy dạo quanh trang chủ để chọn tour nhé!' }}
          pagination={{
            position: ['bottomCenter'],
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} đơn`,
          }}
        />
      </Card>

      {/* POPUP NHẬP LÝ DO HỦY VÉ */}
      <Modal
        title={
          <span style={{ fontSize: 17, fontWeight: 600, color: '#ff4d4f' }}>
            <RollbackOutlined style={{ marginRight: 8 }} />
            Yêu Cầu Hủy Vé Tour — {selectedBooking?.bookingCode}
          </span>
        }
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={cancelForm} layout="vertical" onFinish={handleRequestCancel}>
          <div style={{ background: '#fffbe6', padding: '10px 14px', borderRadius: 6, border: '1px solid #ffe58f', marginBottom: 16, fontSize: 13, color: '#ad6800' }}>
            💡 <b>Chính sách hoàn hủy của TravelHub:</b>
            <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
              <li>Hủy trước 15 ngày khởi hành: Hoàn tiền 100%.</li>
              <li>Hủy trước 7 - 14 ngày: Phạt phí 30%, hoàn lại 70%.</li>
              <li>Hủy trước 3 - 6 ngày: Phạt phí 70%, hoàn lại 30%.</li>
              <li>Hủy dưới 3 ngày: Không hoàn tiền.</li>
            </ul>
          </div>

          <Form.Item
            name="reason"
            label="Lý do hủy tour"
            rules={[{ required: true, message: 'Vui lòng cung cấp lý do bạn muốn hủy vé!' }]}
          >
            <Input.TextArea rows={3} placeholder="Ví dụ: Có lịch công tác đột xuất, người thân bị ốm..." />
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
