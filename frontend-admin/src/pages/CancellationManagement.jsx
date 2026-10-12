import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Popconfirm, message, Space } from 'antd';
import { RollbackOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const CancellationManagement = () => {
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Lấy danh sách yêu cầu hủy
  const fetchCancellations = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/cancellations');
      setCancellations(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancellations();
  }, []);

  // 2. Xác nhận đã hoàn tiền cho khách (Kế toán bấm)
  const handleConfirmRefund = async (id) => {
    try {
      await axiosClient.patch(`/admin/cancellations/${id}/confirm-refund`);
      message.success('Đã xác nhận hoàn tiền thành công!');
      fetchCancellations();
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
      <div style={{ marginBottom: 16 }}>
        <h2>
          <RollbackOutlined style={{ marginRight: 8 }} /> Xử lý Hủy Tour & Hoàn Tiền
        </h2>
      </div>

      <Table
        columns={columns}
        dataSource={cancellations}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default CancellationManagement;