import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Select,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Card,
  Row,
  Col,
} from 'antd';
import {
  EyeOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { bookingService } from '../services';
import BookingDetailModal from '../components/BookingDetailModal';

const BookingManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 1. ĐỌC TOÀN BỘ TIÊU CHÍ LỌC & PHÂN TRANG TỪ URL (Single Source of Truth)
  const keywordFromUrl = searchParams.get('keyword') || '';
  const bookingStatusFromUrl = searchParams.get('bookingStatus') || undefined;
  const paymentStatusFromUrl = searchParams.get('paymentStatus') || undefined;
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // State điều khiển Form nhập
  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [bookingStatus, setBookingStatus] = useState(bookingStatusFromUrl);
  const [paymentStatus, setPaymentStatus] = useState(paymentStatusFromUrl);

  // Phân trang từ Server
  const [pagination, setPagination] = useState({
    current: currentPage,
    pageSize: 10,
    total: 0,
  });

  // Tự động đồng bộ ngược lại các ô input khi URL thay đổi (Back / Forward / F5)
  useEffect(() => {
    setKeyword(keywordFromUrl);
    setBookingStatus(bookingStatusFromUrl);
    setPaymentStatus(paymentStatusFromUrl);
  }, [keywordFromUrl, bookingStatusFromUrl, paymentStatusFromUrl]);

  // 2. GỌI API LẤY DỮ LIỆU CÓ PHÂN TRANG VÀ LỌC TỪ SERVER DỰA TRÊN URL
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pagination.pageSize,
        sortBy: 'id',
        order: 'DESC',
        keyword: keywordFromUrl?.trim() || undefined,
        bookingStatus: bookingStatusFromUrl || undefined,
        paymentStatus: paymentStatusFromUrl || undefined,
      };

      const res = await bookingService.getAdminBookings(params);
      const pageData = res.data;

      setBookings(pageData.data || []);
      setPagination((prev) => ({
        ...prev,
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      }));
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải lại khi URL (searchParams) thay đổi
  useEffect(() => {
    fetchBookings();
  }, [searchParams]);

  // Bấm nút "Lọc": Đẩy toàn bộ tiêu chí lên URL
  const handleSearch = () => {
    const nextParams = new URLSearchParams();
    if (keyword?.trim()) nextParams.set('keyword', keyword.trim());
    if (bookingStatus) nextParams.set('bookingStatus', bookingStatus);
    if (paymentStatus) nextParams.set('paymentStatus', paymentStatus);
    // Áp dụng bộ lọc mới -> Trở về trang 1
    setSearchParams(nextParams);
  };

  // Bấm nút "Làm mới": Xóa sạch tiêu chí và reset URL
  const handleReset = () => {
    setKeyword('');
    setBookingStatus(undefined);
    setPaymentStatus(undefined);
    setSearchParams({});
  };

  // Chuyển trang: Cập nhật param page trên URL
  const handleTableChange = (pagin) => {
    const nextParams = new URLSearchParams(searchParams);
    if (pagin.current > 1) {
      nextParams.set('page', pagin.current.toString());
    } else {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  // 2. Cập nhật trạng thái đơn (PENDING, CONFIRMED, COMPLETED, CANCELLED)
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
      message.success('Cập nhật trạng thái chuyến đi thành công!');
      fetchBookings(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message);
    }
  };

  // 3. Cập nhật trạng thái thanh toán (UNPAID, PAID, REFUNDED)
  const handleUpdatePaymentStatus = async (id, status) => {
    try {
      await bookingService.updatePaymentStatus(id, status);
      message.success('Cập nhật trạng thái thanh toán thành công!');
      fetchBookings(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message);
    }
  };

  // 4. Hủy đơn đặt (Hoàn lại ghế vào kho)
  const handleCancelBooking = async (id) => {
    try {
      await bookingService.cancelBooking(id);
      message.success('Đã hủy đơn và hoàn trả ghế vào kho thành công!');
      fetchBookings(pagination.current - 1, pagination.pageSize);
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
      title: 'Số vé',
      dataIndex: 'totalPassengers',
      key: 'totalPassengers',
      align: 'center',
      render: (count) => <span>{count} vé</span>,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => (
        <span style={{ color: '#d4380d', fontWeight: 'bold' }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </span>
      ),
    },
    {
      title: 'Tiến độ tour',
      key: 'bookingStatus',
      render: (_, record) => (
        <Select
          value={record.bookingStatus}
          style={{ width: 145 }}
          onChange={(newVal) => handleUpdateBookingStatus(record.id, newVal)}
          disabled={record.bookingStatus === 'CANCELLED'}
        >
          <Select.Option value="PENDING">
            <Tag color="gold">Chờ xử lý</Tag>
          </Select.Option>
          <Select.Option value="CONFIRMED">
            <Tag color="cyan">Đã xác nhận</Tag>
          </Select.Option>
          <Select.Option value="COMPLETED">
            <Tag color="green">Đã hoàn thành</Tag>
          </Select.Option>
          <Select.Option value="CANCELLED">
            <Tag color="red">Đã hủy</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: 'Thanh toán',
      key: 'paymentStatus',
      render: (_, record) => (
        <Select
          value={record.paymentStatus}
          style={{ width: 155 }}
          onChange={(newVal) => handleUpdatePaymentStatus(record.id, newVal)}
          disabled={record.bookingStatus === 'CANCELLED'}
        >
          <Select.Option value="UNPAID">
            <Tag color="default">Chưa nộp</Tag>
          </Select.Option>
          <Select.Option value="DEPOSITED">
            <Tag color="orange">Đã cọc</Tag>
          </Select.Option>
          <Select.Option value="PAID">
            <Tag color="success">Đã thanh toán</Tag>
          </Select.Option>
          <Select.Option value="REFUNDED">
            <Tag color="purple">Đã hoàn tiền</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
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
              title="Bạn có chắc chắn muốn hủy đơn này?"
              description="Số vé sẽ được cộng trả lại vào kho ghế trống của chuyến đi."
              onConfirm={() => handleCancelBooking(record.id)}
              okText="Đồng ý hủy"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button icon={<CloseCircleOutlined />} size="small" danger>
                Hủy đơn
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0 }}>
              <ShoppingOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              Quản lý Đơn Đặt Tour
            </h2>
          </Col>
        </Row>

        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={7}>
            <Input
              placeholder="Tìm theo Mã đơn, Tên khách, Email..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="-- Tiến độ tour --"
              value={bookingStatus}
              onChange={(val) => setBookingStatus(val)}
              allowClear
            >
              <Select.Option value="PENDING">Chờ xử lý (PENDING)</Select.Option>
              <Select.Option value="CONFIRMED">Đã xác nhận (CONFIRMED)</Select.Option>
              <Select.Option value="COMPLETED">Hoàn tất (COMPLETED)</Select.Option>
              <Select.Option value="CANCELLED">Đã hủy (CANCELLED)</Select.Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="-- Thanh toán --"
              value={paymentStatus}
              onChange={(val) => setPaymentStatus(val)}
              allowClear
            >
              <Select.Option value="UNPAID">Chưa thanh toán (UNPAID)</Select.Option>
              <Select.Option value="DEPOSITED">Đã đặt cọc (DEPOSITED)</Select.Option>
              <Select.Option value="PAID">Đã thanh toán (PAID)</Select.Option>
              <Select.Option value="REFUNDED">Đã hoàn tiền (REFUNDED)</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={5}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Lọc
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          position: ['bottomCenter'],
          showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />

      <BookingDetailModal
        open={isDetailModalOpen}
        booking={selectedBooking}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
};

export default BookingManagement;
