import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Select,
  Button,
  Space,
  Modal,
  Descriptions,
  Popconfirm,
  message,
} from 'antd';
import {
  EyeOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null); // Chi tiết đơn đang xem
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 1. Lấy tất cả đơn
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/bookings');
      setBookings(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 2. Cập nhật trạng thái đơn (PENDING, CONFIRMED, COMPLETED, CANCELLED)
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/admin/bookings/${id}/status?status=${status}`);
      message.success('Cập nhật trạng thái chuyến đi thành công!');
      fetchBookings();
    } catch (err) {
      message.error(err.message);
    }
  };

  // 3. Cập nhật trạng thái thanh toán (UNPAID, PAID, REFUNDED)
  const handleUpdatePaymentStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/admin/bookings/${id}/payment-status?status=${status}`);
      message.success('Cập nhật trạng thái thanh toán thành công!');
      fetchBookings();
    } catch (err) {
      message.error(err.message);
    }
  };

  // 4. Hủy đơn đặt (Hoàn lại ghế vào kho)
  const handleCancelBooking = async (id) => {
    try {
      await axiosClient.patch(`/admin/bookings/${id}/cancel`);
      message.success('Đã hủy đơn và hoàn trả ghế vào kho thành công!');
      fetchBookings();
    } catch (err) {
      message.error(err.message);
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
      title: 'Tour & Khởi hành',
      key: 'tourInfo',
      render: (_, record) => (
        <div>
          <strong>{record.tourName}</strong>
          <div style={{ fontSize: 12, color: '#888' }}>
            Khởi hành: {dayjs(record.departureDate).format('DD/MM/YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Người liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>{record.contactName}</div>
          <div style={{ fontSize: 12, color: '#555' }}>{record.contactPhone}</div>
        </div>
      ),
    },
    {
      title: 'Số khách',
      dataIndex: 'totalPassengers',
      key: 'totalPassengers',
      render: (count) => <Tag color="cyan">{count} khách</Tag>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <strong style={{ color: '#d4380d' }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </strong>
      ),
    },
    {
      title: 'Trạng thái Chuyến đi',
      key: 'bookingStatus',
      render: (_, record) => (
        <Select
          value={record.bookingStatus}
          style={{ width: 140 }}
          onChange={(val) => handleUpdateBookingStatus(record.id, val)}
          disabled={record.bookingStatus === 'CANCELLED'}
        >
          <Select.Option value="PENDING">Chờ xử lý</Select.Option>
          <Select.Option value="CONFIRMED">Đã xác nhận</Select.Option>
          <Select.Option value="COMPLETED">Hoàn thành</Select.Option>
          <Select.Option value="CANCELLED" disabled>Đã hủy</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Thanh toán',
      key: 'paymentStatus',
      render: (_, record) => (
        <Select
          value={record.paymentStatus}
          style={{ width: 140 }}
          onChange={(val) => handleUpdatePaymentStatus(record.id, val)}
        >
          <Select.Option value="UNPAID">Chưa thanh toán</Select.Option>
          <Select.Option value="PAID">Đã thanh toán</Select.Option>
          <Select.Option value="REFUNDED">Đã hoàn tiền</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedBooking(record);
              setIsDetailModalOpen(true);
            }}
          >
            Chi tiết
          </Button>

          {record.bookingStatus !== 'CANCELLED' && (
            <Popconfirm
              title="Bạn chắc chắn muốn hủy đơn này và trả ghế về kho?"
              onConfirm={() => handleCancelBooking(record.id)}
              okText="Hủy đơn"
              cancelText="Không"
            >
              <Button icon={<CloseCircleOutlined />} danger size="small">
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>
          <ShoppingOutlined style={{ marginRight: 8 }} /> Quản lý Đơn Đặt Tour
        </h2>
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 7 }}
      />

      {/* MODAL XEM CHI TIẾT ĐƠN HÀNG VÀ DANH SÁCH HÀNH KHÁCH */}
      <Modal
        title={`Chi tiết đơn hàng: ${selectedBooking?.bookingCode}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        width={750}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedBooking && (
          <div>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Mã Đơn">{selectedBooking.bookingCode}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(selectedBooking.bookingDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Tour">{selectedBooking.tourName}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {dayjs(selectedBooking.departureDate).format('DD/MM/YYYY')} ➔{' '}
                {dayjs(selectedBooking.returnDate).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Người liên hệ">{selectedBooking.contactName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedBooking.contactPhone}</Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>{selectedBooking.contactEmail}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {selectedBooking.contactAddress || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
                {selectedBooking.specialRequests || 'Không có'}
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginTop: 20, marginBottom: 8 }}>Danh sách hành khách đi cùng:</h4>
            <Table
              dataSource={selectedBooking.passengers || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
                {
                  title: 'Loại khách',
                  dataIndex: 'passengerType',
                  key: 'passengerType',
                  render: (t) => (t === 'ADULT' ? <Tag color="blue">Người lớn</Tag> : <Tag color="orange">Trẻ em</Tag>),
                },
                {
                  title: 'Giới tính',
                  dataIndex: 'gender',
                  key: 'gender',
                  render: (g) => (g === 'MALE' ? 'Nam' : 'Nữ'),
                },
                {
                  title: 'CCCD / Hộ chiếu',
                  dataIndex: 'idCardOrPassport',
                  key: 'idCardOrPassport',
                  render: (text) => text || 'Chưa cung cấp',
                },
                {
                  title: 'Phòng đơn',
                  dataIndex: 'requiresSingleRoom',
                  key: 'requiresSingleRoom',
                  render: (req) => (req ? <Tag color="purple">Có</Tag> : 'Không'),
                },
                {
                  title: 'Giá vé',
                  dataIndex: 'price',
                  key: 'price',
                  render: (p) => `${Number(p).toLocaleString('vi-VN')} đ`,
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingManagement;