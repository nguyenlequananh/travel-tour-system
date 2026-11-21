import React, { useEffect, useState } from 'react';
import {
  Table, Tag, Select, Button, Modal, Descriptions, message, Space, Card,
  Row, Col, Input, Divider
} from 'antd';
import {
  TeamOutlined, EyeOutlined, PhoneOutlined, MailOutlined,
  SearchOutlined, ReloadOutlined, CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { customTourService } from '../services';

const CustomTourManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Bộ lọc tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(undefined);

  // Modal xem chi tiết
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchRequests = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy: 'id',
        order: 'DESC',
        keyword: keyword?.trim() || undefined,
        status: status || undefined,
      };

      const res = await customTourService.getAdminRequests(params);
      const pageData = res.data;

      setRequests(pageData.data || []);
      setPagination({
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      });

      if (selectedRequest) {
        const updated = pageData.data?.find((item) => item.id === selectedRequest.id);
        if (updated) setSelectedRequest(updated);
      }
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách yêu cầu tour đoàn!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(0, pagination.pageSize);
  }, []);

  const handleSearch = () => {
    fetchRequests(0, pagination.pageSize);
  };

  const handleReset = () => {
    setKeyword('');
    setStatus(undefined);
    setTimeout(() => {
      fetchRequests(0, pagination.pageSize);
    }, 0);
  };

  const handleTableChange = (pagin) => {
    fetchRequests(pagin.current - 1, pagin.pageSize);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await customTourService.updateStatus(id, newStatus);
      message.success('Cập nhật trạng thái xử lý thành công!');
      fetchRequests(pagination.current - 1, pagination.pageSize);
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      message.error(err.message || 'Lỗi khi cập nhật trạng thái!');
    }
  };

  const renderStatusTag = (st) => {
    switch (st) {
      case 'NEW':
        return <Tag color="blue">Mới tạo (NEW)</Tag>;
      case 'CONTACTED':
        return <Tag color="orange">Đã gọi điện tư vấn</Tag>;
      case 'QUOTED':
        return <Tag color="purple">Đã gửi báo giá</Tag>;
      case 'CLOSED':
        return <Tag color="green">Đã chốt / Đóng</Tag>;
      default:
        return <Tag>{st}</Tag>;
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
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '—'),
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
        ) : <span style={{ color: '#888' }}>Thỏa thuận</span>
      ),
    },
    {
      title: 'Trạng thái xử lý',
      key: 'status',
      render: (_, r) => (
        <Select
          value={r.status}
          style={{ width: 175 }}
          onChange={(newVal) => handleUpdateStatus(r.id, newVal)}
        >
          <Select.Option value="NEW">Mới nhận (NEW)</Select.Option>
          <Select.Option value="CONTACTED">Đã liên hệ tư vấn</Select.Option>
          <Select.Option value="QUOTED">Đã gửi báo giá</Select.Option>
          <Select.Option value="CLOSED">Đã chốt / Đóng</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          ghost
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
      <Card style={{ marginBottom: 18 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TeamOutlined style={{ color: '#0d6e6e' }} />
              Quản lý Yêu Cầu Thiết Kế Tour Đoàn
            </h2>
          </Col>
        </Row>

        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Tìm theo tên khách, sđt, email hoặc điểm đến..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="-- Lọc trạng thái --"
              value={status}
              onChange={(val) => setStatus(val)}
              allowClear
            >
              <Select.Option value="NEW">Mới nhận (NEW)</Select.Option>
              <Select.Option value="CONTACTED">Đã liên hệ tư vấn</Select.Option>
              <Select.Option value="QUOTED">Đã gửi báo giá</Select.Option>
              <Select.Option value="CLOSED">Đã chốt / Đóng</Select.Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={6}>
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

      <Card styles={{ body: { padding: 16 } }}>
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1020 }}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      {/* MODAL CHI TIẾT YÊU CẦU TOUR ĐOÀN */}
      <Modal
        title={`Chi tiết yêu cầu tour đoàn #${selectedRequest?.id}`}
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setIsDetailOpen(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedRequest && (
          <div>
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Người liên hệ">{selectedRequest.fullName}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedRequest.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>{selectedRequest.email}</Descriptions.Item>
              <Descriptions.Item label="Điểm đến">{selectedRequest.destination}</Descriptions.Item>
              <Descriptions.Item label="Ngày khởi hành dự kiến">
                {selectedRequest.departureDate ? dayjs(selectedRequest.departureDate).format('DD/MM/YYYY') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng khách">{selectedRequest.estimatedGuests} người</Descriptions.Item>
              <Descriptions.Item label="Thời gian đi">{selectedRequest.estimatedDurationDays} ngày</Descriptions.Item>
              <Descriptions.Item label="Ngân sách dự kiến">
                {selectedRequest.budgetPerPerson
                  ? `${Number(selectedRequest.budgetPerPerson).toLocaleString('vi-VN')} đ / người`
                  : 'Thỏa thuận'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {renderStatusTag(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Yêu cầu đặc biệt" span={2}>
                <div style={{ whiteSpace: 'pre-wrap', background: '#fafafa', padding: 8, borderRadius: 4 }}>
                  {selectedRequest.specialRequirements || 'Không có yêu cầu riêng.'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian gửi form" span={2}>
                {dayjs(selectedRequest.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Cập nhật nhanh tiến độ:</span>
              <Space>
                <Button size="small" onClick={() => handleUpdateStatus(selectedRequest.id, 'CONTACTED')}>
                  Đã liên hệ
                </Button>
                <Button size="small" onClick={() => handleUpdateStatus(selectedRequest.id, 'QUOTED')}>
                  Đã báo giá
                </Button>
                <Button size="small" type="primary" onClick={() => handleUpdateStatus(selectedRequest.id, 'CLOSED')}>
                  Chốt đơn
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomTourManagement;
