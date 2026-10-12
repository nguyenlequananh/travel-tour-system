import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, message, Space, Card, Empty, Spin } from 'antd';
import { ShoppingOutlined, RollbackOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../../api/axiosClient';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancelForm] = Form.useForm();
  
  // Lấy thông tin user đang đăng nhập từ localStorage
  const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');

  // Tải danh sách đơn đặt của CHÍNH NGƯỜI ĐANG ĐĂNG NHẬP
  const fetchMyBookings = async () => {
    // 1. Nếu chưa đăng nhập thì dừng lại, không gọi API
    if (!savedUser.id) {
      setBookings([]);
      return;
    }

    setLoading(true);
    try {
      // 2. GỌI ĐÚNG ID CỦA NGƯỜI ĐANG ĐĂNG NHẬP (KHÔNG CÒN SỐ 3 NỮA!)
      const res = await axiosClient.get(`/bookings/my-bookings?userId=${savedUser.id}`);
      setBookings(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải lịch sử vé!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // Gửi yêu cầu hủy vé
  const handleRequestCancel = async (values) => {
    try {
      await axiosClient.post('/bookings/cancel', {
        bookingId: selectedBookingId,
        reason: values.reason,
      });
      message.success('Đã gửi yêu cầu hủy vé thành công!');
      setCancelModalOpen(false);
      cancelForm.resetFields();
      fetchMyBookings(); // Tải lại danh sách sau khi hủy
    } catch (err) {
      message.error(err.message || 'Không thể hủy vé này!');
    }
  };

  const columns = [
    {
      title: 'Mã Đơn',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Tên Tour',
      dataIndex: 'tourName',
      key: 'tourName',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Ngày khởi hành',
      dataIndex: 'departureDate',
      key: 'departureDate',
      render: (d) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Số người',
      dataIndex: 'totalPassengers',
      key: 'totalPassengers',
      render: (count) => `${count} khách`,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (p) => <strong style={{ color: '#d4380d' }}>{Number(p).toLocaleString()} đ</strong>,
    },
    {
      title: 'Trạng thái vé',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (s) => (
        <Tag color={s === 'CONFIRMED' ? 'green' : s === 'CANCELLED' ? 'red' : 'gold'}>
          {s === 'CONFIRMED' ? 'Đã xác nhận' : s === 'CANCELLED' ? 'Đã hủy' : 'Chờ xử lý'}
        </Tag>
      ),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (p) => (
        <Tag color={p === 'PAID' ? 'green' : p === 'REFUNDED' ? 'purple' : 'orange'}>
          {p === 'PAID' ? 'Đã thanh toán' : p === 'REFUNDED' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.bookingStatus !== 'CANCELLED' && (
            <Button
              danger
              size="small"
              icon={<RollbackOutlined />}
              onClick={() => {
                setSelectedBookingId(record.id);
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

  // Nếu chưa đăng nhập thì hiện giao diện nhắc đăng nhập
  if (!savedUser.id) {
    return (
      <div style={{ maxWidth: 800, margin: '60px auto', textAlign: 'center' }}>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Bạn chưa đăng nhập tài khoản. Vui lòng đăng nhập để xem danh sách vé của mình!"
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2><ShoppingOutlined style={{ marginRight: 8 }} /> Danh Sách Vé Du Lịch Của Tôi</h2>
        <span style={{ color: '#888' }}>
          Tài khoản: <b>{savedUser.fullName}</b> ({savedUser.email})
        </span>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: 'Bạn chưa đặt vé tour nào. Hãy dạo quanh trang chủ để chọn tour nhé!' }}
        />
      </Card>

      {/* POPUP NHẬP LÝ DO HỦY VÉ */}
      <Modal
        title="Yêu Cầu Hủy Vé Tour"
        open={cancelModalOpen}
        onCancel={() => setCancelModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={cancelForm} layout="vertical" onFinish={handleRequestCancel}>
          <p style={{ color: '#888' }}>
            Hệ thống sẽ tự động tính tỷ lệ phạt và tiền hoàn dựa trên số ngày còn lại đến ngày khởi hành theo đúng chính sách công ty.
          </p>
          <Form.Item name="reason" label="Lý do bạn muốn hủy tour" rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}>
            <Input.TextArea rows={3} placeholder="VD: Bận việc gia đình đột xuất..." />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCancelModalOpen(false)}>Quay lại</Button>
              <Button type="primary" danger htmlType="submit">
                Xác Nhận Gửi Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyBookingsPage;