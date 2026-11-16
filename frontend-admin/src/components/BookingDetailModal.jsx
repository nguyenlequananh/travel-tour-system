import React from 'react';
import { Modal, Descriptions, Table, Tag, Button } from 'antd';
import dayjs from 'dayjs';

const BookingDetailModal = ({ open, booking, onClose }) => {
  if (!booking) return null;

  const passengerColumns = [
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
  ];

  return (
    <Modal
      title={`Chi tiết đơn hàng: ${booking.bookingCode}`}
      open={open}
      onCancel={onClose}
      width={750}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Mã Đơn">{booking.bookingCode}</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt">
          {dayjs(booking.bookingDate).format('DD/MM/YYYY HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Tour">{booking.tourName}</Descriptions.Item>
        <Descriptions.Item label="Thời gian">
          {dayjs(booking.departureDate).format('DD/MM/YYYY')} ➤{' '}
          {dayjs(booking.returnDate).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Người liên hệ">{booking.contactName}</Descriptions.Item>
        <Descriptions.Item label="Số điện thoại">{booking.contactPhone}</Descriptions.Item>
        <Descriptions.Item label="Email" span={2}>{booking.contactEmail}</Descriptions.Item>
        <Descriptions.Item label="Điểm đón khách" span={2}>
          {booking.pickupLocationName ? (
            <span>
              📍 <b>{booking.pickupLocationName}</b>
              {booking.pickupTime ? ` (Đón lúc: ${booking.pickupTime})` : ''}
            </span>
          ) : (
            <span style={{ color: '#888' }}>Tự túc / Chưa chọn điểm đón</span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
          {booking.specialRequests || 'Không có'}
        </Descriptions.Item>
      </Descriptions>

      <h4 style={{ marginTop: 20, marginBottom: 8 }}>Danh sách hành khách đi cùng:</h4>
      <Table
        dataSource={booking.passengers || []}
        rowKey="id"
        pagination={false}
        size="small"
        columns={passengerColumns}
      />
    </Modal>
  );
};

export default BookingDetailModal;
