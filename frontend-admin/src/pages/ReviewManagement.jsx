import React, { useEffect, useState } from 'react';
import { Table, Rate, Button, Popconfirm, message, Space, Tag, Card } from 'antd';
import { StarOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tải toàn bộ đánh giá trong hệ thống
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/reviews');
      setReviews(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // 2. Xóa đánh giá spam / tiêu cực
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/reviews/${id}`);
      message.success('Đã xóa đánh giá thành công!');
      fetchReviews();
    } catch (err) {
      message.error(err.message || 'Lỗi khi xóa đánh giá!');
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Tour được đánh giá',
      key: 'tour',
      render: (_, r) => (
        <div>
          <Tag color="blue">{r.tourCode}</Tag>
          <div>{r.tourName}</div>
        </div>
      ),
    },
    {
      title: 'Số sao',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      render: (stars) => <Rate disabled value={stars} style={{ fontSize: 14 }} />,
    },
    {
      title: 'Nội dung nhận xét',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => <span style={{ color: '#555' }}>"{text}"</span>,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa đánh giá này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button icon={<DeleteOutlined />} danger size="small">
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2><StarOutlined style={{ color: '#faad14', marginRight: 8 }} /> Quản lý Đánh Giá & Nhận Xét</h2>
        <span style={{ color: '#888' }}>Kiểm duyệt các phản hồi từ khách hàng sau khi đi tour</span>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default ReviewManagement;