import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ScheduleOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const TourItineraryManagement = () => {
  const [tours, setTours] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axiosClient.get('/admin/tours');
        const list = res.data || [];
        setTours(list);
        if (list.length > 0) setSelectedTourId(list[0].id);
      } catch (err) {
        message.error(err.message);
      }
    };
    fetchTours();
  }, []);

  const fetchItineraries = async (tourId) => {
    if (!tourId) return;
    setLoading(true);
    try {
      const res = await axiosClient.get(`/admin/itineraries/tour/${tourId}`);
      setItineraries(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTourId) fetchItineraries(selectedTourId);
  }, [selectedTourId]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { ...values, tourId: selectedTourId };
      if (editingId) {
        await axiosClient.put(`/admin/itineraries/${editingId}`, payload);
        message.success('Cập nhật lịch trình thành công!');
      } else {
        await axiosClient.post('/admin/itineraries', payload);
        message.success('Thêm ngày lịch trình thành công!');
      }
      setIsModalOpen(false);
      fetchItineraries(selectedTourId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/itineraries/${id}`);
      message.success('Xóa lịch trình ngày thành công!');
      fetchItineraries(selectedTourId);
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Ngày thứ', dataIndex: 'dayNumber', key: 'dayNumber', width: 90, render: (d) => <b>Ngày {d}</b> },
    { title: 'Tiêu đề hoạt động', dataIndex: 'title', key: 'title', render: (t) => <strong>{t}</strong> },
    { title: 'Bữa ăn', dataIndex: 'meals', key: 'meals' },
    { title: 'Khách sạn/Nơi ở', dataIndex: 'accommodation', key: 'accommodation' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa ngày này?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><ScheduleOutlined style={{ marginRight: 8 }} /> Quản lý Lịch Trình Chi Tiết</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)} disabled={!selectedTourId}>
          Thêm Ngày Lịch Trình
        </Button>
      </div>

      <div style={{ marginBottom: 16, background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
        <span style={{ marginRight: 8, fontWeight: 'bold' }}>Chọn Tour để thiết lập lịch trình:</span>
        <Select style={{ width: 450 }} value={selectedTourId} onChange={(val) => setSelectedTourId(val)}>
          {tours.map((t) => (
            <Select.Option key={t.id} value={t.id}>
              [{t.tourCode}] {t.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table columns={columns} dataSource={itineraries} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? 'Sửa Lịch Trình Ngày' : 'Thêm Ngày Lịch Trình Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="dayNumber" label="Ngày thứ mấy" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 1, 2, 3..." />
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề ngày" rules={[{ required: true }]}>
            <Input placeholder="VD: TP.HCM - Phú Quốc - Tham quan Grand World" />
          </Form.Item>
          <Form.Item name="details" label="Chi tiết lịch trình hoạt động" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Sáng: đón khách tại sân bay, trưa nhận phòng..." />
          </Form.Item>
          <Form.Item name="meals" label="Bữa ăn trong ngày">
            <Input placeholder="VD: Sáng / Trưa / Tối" />
          </Form.Item>
          <Form.Item name="accommodation" label="Khách sạn / Lưu trú">
            <Input placeholder="VD: Khách sạn Vinpearl 5 sao" />
          </Form.Item>
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

export default TourItineraryManagement;