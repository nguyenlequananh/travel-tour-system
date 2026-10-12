import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Button, Modal, Descriptions, message, Space, Card } from 'antd';
import { TeamOutlined, EyeOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const CustomTourManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 1. Tải danh sách yêu cầu tour đoàn
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/custom-tours');
      setRequests(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách yêu cầu tour đoàn!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // 2. Đổi trạng thái xử lý yêu cầu (PATCH /status)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axiosClient.patch(`/admin/custom-tours/${id}/status?status=${newStatus}`);
      message.success('Cập nhật trạng thái xử lý thành công!');
      fetchRequests();
    } catch (err) {
      message.error(err.message || 'Lỗi khi cập nhật trạng thái!');
    }
  };

  const columns = [
    {
      title: 'Người liên hệ / Doanh nghiệp',
      key: 'contact',
      render: (_, r) => (
        <div>
          <strong>{r.fullName}</strong>
          <div style={{ fontSize: 12, color: '#1677ff' }}><PhoneOutlined /> {r.phoneNumber}</div>
          <div style={{ fontSize: 12, color: '#888' }}><MailOutlined /> {r.email}</div>
        </div>
      ),
    },
    {
      title: 'Điểm đến mong muốn',
      dataIndex: 'destination',
      key: 'destination',
      render: (text) => <b style={{ color: '#0958d9' }}>{text}</b>,
    },
    {
      title: 'Quy mô đoàn',
      key: 'scale',
      render: (_, r) => (
        <div>
          <Tag color="purple">{r.estimatedGuests} khách</Tag>
          <Tag color="cyan">{r.estimatedDurationDays} ngày</Tag>
        </div>
      ),
    },
    {
      title: 'Ngày đi dự kiến',
      dataIndex: 'departureDate',
      key: 'departureDate',
      render: (d) => dayjs(d).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngân sách / người',
      dataIndex: 'budgetPerPerson',
      key: 'budgetPerPerson',
      render: (amount) => (
        amount ? (
          <strong style={{ color: '#52c41a' }}>
            {Number(amount).toLocaleString('vi-VN')} đ
          </strong>
        ) : <span style={{ color: '#aaa' }}>Thỏa thuận</span>
      ),
    },
    {
      title: 'Trạng thái xử lý',
      key: 'status',
      render: (_, r) => (
        <Select
          value={r.status}
          style={{ width: 140 }}
          onChange={(val) => handleUpdateStatus(r.id, val)}
        >
          <Select.Option value="NEW">Mới tạo (NEW)</Select.Option>
          <Select.Option value="CONTACTED">Đã gọi điện</Select.Option>
          <Select.Option value="QUOTED">Đã gửi báo giá</Select.Option>
          <Select.Option value="CLOSED">Đã chốt / Đóng</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedRequest(record);
            setIsDetailOpen(true);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2><TeamOutlined style={{ color: '#1677ff', marginRight: 8 }} /> Quản lý Yêu Cầu Tour Đoàn & Doanh Nghiệp (B2B)</h2>
        <span style={{ color: '#888' }}>Danh sách các công ty, đoàn thể gửi yêu cầu thiết kế tour riêng</span>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* MODAL XEM CHI TIẾT YÊU CẦU ĐẶC BIỆT */}
      <Modal
        title={`Chi tiết yêu cầu của: ${selectedRequest?.fullName}`}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={650}
      >
        {selectedRequest && (
          <Descriptions bordered column={2} size="small" style={{ marginTop: 15 }}>
            <Descriptions.Item label="Người liên hệ">{selectedRequest.fullName}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{selectedRequest.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>{selectedRequest.email}</Descriptions.Item>
            <Descriptions.Item label="Điểm đến">{selectedRequest.destination}</Descriptions.Item>
            <Descriptions.Item label="Ngày đi">{dayjs(selectedRequest.departureDate).format('DD/MM/YYYY')}</Descriptions.Item>
            <Descriptions.Item label="Số lượng khách">{selectedRequest.estimatedGuests} người</Descriptions.Item>
            <Descriptions.Item label="Thời lượng">{selectedRequest.estimatedDurationDays} ngày</Descriptions.Item>
            <Descriptions.Item label="Ngân sách dự kiến" span={2}>
              {selectedRequest.budgetPerPerson ? `${Number(selectedRequest.budgetPerPerson).toLocaleString()} đ/người` : 'Thỏa thuận'}
            </Descriptions.Item>
            <Descriptions.Item label="Yêu cầu đặc biệt (Team building, Gala...)" span={2}>
              <div style={{ background: '#f5f5f5', padding: 10, borderRadius: 6, minHeight: 60 }}>
                {selectedRequest.specialRequirements || 'Không có yêu cầu đặc biệt.'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CustomTourManagement;