import React, { useEffect, useState } from 'react';
import { Table, Tag, message } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/payments');
      setPayments(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const columns = [
    {
      title: 'Mã Giao Dịch',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      render: (code) => <strong>{code}</strong>,
    },
    {
      title: 'Mã Đơn Đặt',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Số Tiền Thanh Toán',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <strong style={{ color: '#52c41a', fontSize: 14 }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </strong>
      ),
    },
    {
      title: 'Phương Thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        if (method === 'VNPAY') return <Tag color="blue">VNPAY</Tag>;
        if (method === 'MOMO') return <Tag color="magenta">MOMO</Tag>;
        if (method === 'BANK_TRANSFER') return <Tag color="geekblue">Chuyển khoản</Tag>;
        return <Tag color="gold">Tiền mặt</Tag>;
      },
    },
    {
      title: 'Hình thức',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (type) => (
        <Tag color={type === 'FULL_PAYMENT' ? 'green' : 'orange'}>
          {type === 'FULL_PAYMENT' ? 'Thanh toán 100%' : type === 'DEPOSIT' ? 'Đặt cọc' : 'Phần còn lại'}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'paymentTime',
      key: 'paymentTime',
      render: (time) => (time ? dayjs(time).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'SUCCESS' ? 'green' : status === 'FAILED' ? 'red' : 'gold'}>
          {status === 'SUCCESS' ? 'Thành công' : status === 'FAILED' ? 'Thất bại' : 'Chờ xử lý'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2><CreditCardOutlined style={{ marginRight: 8 }} /> Lịch Sử Giao Dịch & Thanh Toán</h2>
      </div>

      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
};

export default PaymentManagement;