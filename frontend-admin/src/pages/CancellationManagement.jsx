import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, message, Space, Card } from 'antd';
import { RollbackOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { cancellationService } from '../services';

const CancellationManagement = () => {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchCancellations = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const params = { page, size, sortBy: 'id', order: 'DESC' };
      const res = await cancellationService.getCancellations(params);
      const pageData = res.data;

      setCancellations(pageData.data || []);
      setPagination({
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      });
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách yêu cầu hủy!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancellations(0, pagination.pageSize);
  }, []);

  const handleTableChange = (pagin) => {
    fetchCancellations(pagin.current - 1, pagin.pageSize);
  };

  const handleConfirmRefund = async (id) => {
    try {
      await cancellationService.confirmRefund(id);
      message.success('Đã xác nhận hoàn tiền và kích hoạt gửi email thông báo thành công!');
      fetchCancellations(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    {
      title: 'Mã Đơn Hủy',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (code) => <Tag color="purple">{code}</Tag>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name) => <strong>{name}</strong>,
    },
    {
      title: 'Lý do hủy',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Thời gian hủy',
      dataIndex: 'cancellationDate',
      key: 'cancellationDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Phí phạt hủy (%)',
      dataIndex: 'cancellationFeePercentage',
      key: 'cancellationFeePercentage',
      render: (fee) => (
        <Tag color={fee > 50 ? 'volcano' : fee > 0 ? 'orange' : 'green'}>
          Phạt {Number(fee)}%
        </Tag>
      ),
    },
    {
      title: 'Tiền cần hoàn trả',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      render: (amount) => (
        <strong style={{ color: '#52c41a', fontSize: 15 }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </strong>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'REFUNDED') return <Tag color="green">Đã hoàn tiền</Tag>;
        if (status === 'APPROVED') return <Tag color="blue">Đã duyệt hủy</Tag>;
        return <Tag color="gold">Chờ xử lý</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status !== 'REFUNDED' ? (
            <Popconfirm
              title="Bạn đã chuyển tiền hoàn cho khách và muốn xác nhận hoàn tất?"
              description="Hệ thống sẽ kích hoạt RabbitMQ gửi email biên lai hoàn tiền cho khách hàng."
              onConfirm={() => handleConfirmRefund(record.id)}
              okText="Đã chuyển tiền"
              cancelText="Hủy"
            >
              <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
                Xác nhận hoàn tiền
              </Button>
            </Popconfirm>
          ) : (
            <span style={{ color: '#888', fontSize: 12 }}>Hoàn tất</span>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          <RollbackOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
          Xử lý Hủy Tour & Hoàn Tiền
        </h2>
      </Card>

      <Table
        columns={columns}
        dataSource={cancellations}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default CancellationManagement;
