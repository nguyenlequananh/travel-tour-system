import React, { useEffect, useState } from 'react';
import { Table, Rate, Button, Popconfirm, message, Space, Tag, Card } from 'antd';
import { StarOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { reviewService } from '../services';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchReviews = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const params = { page, size, sortBy: 'id', order: 'DESC' };
      const res = await reviewService.getAdminReviews(params);
      const pageData = res.data;

      setReviews(pageData.data || []);
      setPagination({
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      });
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(0, pagination.pageSize);
  }, []);

  const handleTableChange = (pagin) => {
    fetchReviews(pagin.current - 1, pagin.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      await reviewService.deleteReview(id);
      message.success('Đã xóa đánh giá thành công!');
      fetchReviews(pagination.current - 1, pagination.pageSize);
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
      <Card style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>
          <StarOutlined style={{ color: '#faad14', marginRight: 8 }} />
          Quản lý Đánh Giá & Nhận Xét
        </h2>
        <span style={{ color: '#888' }}>Kiểm duyệt các phản hồi từ khách hàng sau khi đi tour</span>
      </Card>

      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ReviewManagement;
