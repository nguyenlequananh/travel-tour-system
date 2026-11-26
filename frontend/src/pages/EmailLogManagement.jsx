import React, { useEffect, useMemo, useState } from 'react';
import { Card, Table, Tag, Button, Input, Row, Col, Statistic, Space, Tooltip, message } from 'antd';
import {
  MailOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const EmailLogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      // Gọi qua API Gateway (:8088/api/v1/email-logs) -> tự đính kèm Bearer JWT Admin
      const res = await axiosClient.get('/email-logs');
      setLogs(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      message.error(err.message || 'Không thể tải nhật ký email từ notification-service!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (item) =>
        item.bookingCode?.toLowerCase().includes(q) ||
        item.recipientEmail?.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q)
    );
  }, [logs, keyword]);

  const totalSent = logs.filter((l) => l.status === 'SENT').length;
  const totalFailed = logs.filter((l) => l.status === 'FAILED').length;

  const formatDateTime = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('vi-VN');
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 65,
    },
    {
      title: 'Mã Đơn',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      width: 145,
      render: (code) => <Tag color="cyan" style={{ fontWeight: 700 }}>{code}</Tag>,
    },
    {
      title: 'Email Nhận',
      dataIndex: 'recipientEmail',
      key: 'recipientEmail',
      width: 220,
    },
    {
      title: 'Loại Email',
      dataIndex: 'emailType',
      key: 'emailType',
      width: 150,
      render: (type) =>
        type === 'REFUND_CONFIRMATION' ? (
          <Tag color="gold">Hoàn tiền</Tag>
        ) : (
          <Tag color="blue">Xác nhận đặt tour</Tag>
        ),
    },
    {
      title: 'Tiêu Đề',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 125,
      render: (status, record) =>
        status === 'SENT' ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            ĐÃ GỬI
          </Tag>
        ) : (
          <Tooltip title={record.errorMessage || 'Lỗi gửi SMTP'}>
            <Tag icon={<CloseCircleOutlined />} color="error" style={{ cursor: 'pointer' }}>
              THẤT BẠI
            </Tag>
          </Tooltip>
        ),
    },
    {
      title: 'Thời Gian Gửi',
      dataIndex: 'sentAt',
      key: 'sentAt',
      width: 175,
      render: formatDateTime,
    },
  ];

  return (
    <Space direction="vertical" size={18} style={{ width: '100%' }}>
      {/* 3 THẺ THỐNG KÊ TỪ NOTIFICATION-SERVICE */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng email đã xử lý"
              value={logs.length}
              prefix={<MailOutlined style={{ color: '#0d6e6e' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Gửi thành công (SENT)"
              value={totalSent}
              valueStyle={{ color: '#16a34a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Gửi thất bại (FAILED)"
              value={totalFailed}
              valueStyle={{ color: '#dc2626' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* BẢNG DANH SÁCH NHẬT KÝ EMAIL */}
      <Card
        title="Nhật ký gửi Email (Notification Microservice — DB riêng travel_notification_db)"
        extra={
          <Space>
            <Input
              allowClear
              placeholder="Tìm mã đơn, email..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 240 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchEmailLogs} loading={loading}>
              Làm mới
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredLogs}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} email` }}
          scroll={{ x: 960 }}
        />
      </Card>
    </Space>
  );
};

export default EmailLogManagement;
