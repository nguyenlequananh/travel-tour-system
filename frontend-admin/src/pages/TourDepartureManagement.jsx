import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, InputNumber, Select, DatePicker, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const TourDepartureManagement = () => {
  const [tours, setTours] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // 1. Tải danh sách Tour để đổ vào Dropdown chọn Tour
  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axiosClient.get('/admin/tours');
        const list = res.data || [];
        setTours(list);
        if (list.length > 0) {
          setSelectedTourId(list[0].id); // Chọn tour đầu tiên mặc định
        }
      } catch (err) {
        message.error(err.message);
      }
    };
    fetchTours();
  }, []);

  // 2. Tải danh sách đợt khởi hành của Tour đang chọn
  const fetchDepartures = async (tourId) => {
    if (!tourId) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/admin/departures/tour/${tourId}`);
      setDepartures(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTourId) {
      fetchDepartures(selectedTourId);
    }
  }, [selectedTourId]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        departureDate: dayjs(record.departureDate),
        returnDate: dayjs(record.returnDate),
        adultPrice: record.adultPrice,
        childPrice: record.childPrice,
        singleRoomSupplement: record.singleRoomSupplement,
        maxSeats: record.maxSeats,
        status: record.status,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        departureDate: values.departureDate.format('YYYY-MM-DD'),
        returnDate: values.returnDate.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await axiosClient.put(`/admin/departures/${editingId}`, payload);
        message.success('Cập nhật đợt khởi hành thành công!');
      } else {
        await axiosClient.post('/admin/departures', { ...payload, tourId: selectedTourId });
        message.success('Mở bán đợt khởi hành mới thành công!');
      }
      setIsModalOpen(false);
      fetchDepartures(selectedTourId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleChangeStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/admin/departures/${id}/status?status=${status}`);
      message.success('Cập nhật trạng thái thành công!');
      fetchDepartures(selectedTourId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    {
      title: 'Thời gian đi',
      key: 'dates',
      render: (_, r) => (
        <div>
          <strong>{dayjs(r.departureDate).format('DD/MM/YYYY')}</strong> ➔ {dayjs(r.returnDate).format('DD/MM/YYYY')}
        </div>
      ),
    },
    {
      title: 'Giá vé người lớn',
      dataIndex: 'adultPrice',
      key: 'adultPrice',
      render: (p) => <strong style={{ color: '#d4380d' }}>{Number(p).toLocaleString('vi-VN')} đ</strong>,
    },
    {
      title: 'Giá vé trẻ em',
      dataIndex: 'childPrice',
      key: 'childPrice',
      render: (p) => `${Number(p).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Ghế trống / Tổng',
      key: 'seats',
      render: (_, r) => (
        <span>
          <b style={{ color: r.availableSeats > 0 ? '#52c41a' : '#f5222d' }}>{r.availableSeats}</b> / {r.maxSeats} chỗ
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, r) => (
        <Select value={r.status} style={{ width: 130 }} onChange={(val) => handleChangeStatus(r.id, val)}>
          <Select.Option value="OPEN">Mở bán</Select.Option>
          <Select.Option value="CLOSED">Khóa sổ</Select.Option>
          <Select.Option value="CANCELLED">Hủy chuyến</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><CalendarOutlined style={{ marginRight: 8 }} /> Quản lý Lịch Khởi Hành</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)} disabled={!selectedTourId}>
          Mở Bán Đợt Mới
        </Button>
      </div>

      <div style={{ marginBottom: 16, background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
        <span style={{ marginRight: 8, fontWeight: 'bold' }}>Chọn Tour để xem lịch:</span>
        <Select
          style={{ width: 450 }}
          value={selectedTourId}
          onChange={(val) => setSelectedTourId(val)}
          placeholder="Chọn tour cần quản lý lịch"
        >
          {tours.map((t) => (
            <Select.Option key={t.id} value={t.id}>
              [{t.tourCode}] {t.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table columns={columns} dataSource={departures} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? 'Cập nhật Đợt Khởi Hành' : 'Mở Bán Đợt Khởi Hành Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="departureDate" label="Ngày khởi hành" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="returnDate" label="Ngày kết thúc" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="adultPrice" label="Giá Người Lớn (VNĐ)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="VD: 3500000" />
          </Form.Item>
          <Form.Item name="childPrice" label="Giá Trẻ Em (VNĐ)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} placeholder="VD: 2500000" />
          </Form.Item>
          <Form.Item name="singleRoomSupplement" label="Phụ thu phòng đơn (VNĐ)" initialValue={0}>
            <InputNumber style={{ width: '100%' }} placeholder="VD: 500000" />
          </Form.Item>
          <Form.Item name="maxSeats" label="Tổng số chỗ mở bán" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 30" />
          </Form.Item>
          {editingId && (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="OPEN">Mở bán (OPEN)</Select.Option>
                <Select.Option value="CLOSED">Khóa sổ (CLOSED)</Select.Option>
                <Select.Option value="CANCELLED">Hủy chuyến (CANCELLED)</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TourDepartureManagement;