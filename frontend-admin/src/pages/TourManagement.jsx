import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CompassOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const TourManagement = () => {
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/tours');
      setTours(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/admin/categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTours();
    fetchCategories();
  }, []);

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
      if (editingId) {
        await axiosClient.put(`/admin/tours/${editingId}`, values);
        message.success('Cập nhật tour thành công!');
      } else {
        await axiosClient.post('/admin/tours', values);
        message.success('Tạo tour mới thành công!');
      }
      setIsModalOpen(false);
      fetchTours();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.patch(`/admin/tours/${id}`);
      message.success('Ẩn tour thành công!');
      fetchTours();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Mã Tour', dataIndex: 'tourCode', key: 'tourCode', render: (c) => <Tag color="geekblue">{c}</Tag> },
    { title: 'Tên Tour', dataIndex: 'name', key: 'name', render: (t) => <strong>{t}</strong> },
    { title: 'Danh mục', dataIndex: 'categoryName', key: 'categoryName', render: (c) => <Tag color="cyan">{c}</Tag> },
    { title: 'Lộ trình', key: 'route', render: (_, r) => `${r.departureCity} ➔ ${r.destinationCity}` },
    { title: 'Thời gian', key: 'duration', render: (_, r) => `${r.durationDays}N${r.durationNights}Đ` },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={s === 'ACTIVE' ? 'green' : 'volcano'}>{s === 'ACTIVE' ? 'Hoạt động' : 'Tạm ẩn'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Ẩn tour này?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              Ẩn
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><CompassOutlined style={{ marginRight: 8 }} /> Quản lý Tour Du Lịch</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
          Thêm Tour Mới
        </Button>
      </div>

      <Table columns={columns} dataSource={tours} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? 'Cập nhật Tour' : 'Thêm Tour Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="categoryId" label="Danh mục Tour" rules={[{ required: true }]}>
              <Select placeholder="Chọn danh mục">
                {categories.map((c) => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="tourCode" label="Mã Tour" rules={[{ required: true }]}>
              <Input placeholder="VD: TO-DN-01" />
            </Form.Item>
          </div>

          <Form.Item name="name" label="Tên Tour" rules={[{ required: true }]}>
            <Input placeholder="VD: Tour Du Lịch Đà Nẵng 3N2Đ" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="tourType" label="Loại tour" initialValue="DOMESTIC" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="DOMESTIC">Trong nước</Select.Option>
                <Select.Option value="INTERNATIONAL">Quốc tế</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="departureCity" label="Nơi khởi hành" rules={[{ required: true }]}>
              <Input placeholder="VD: TP. Hồ Chí Minh" />
            </Form.Item>
            <Form.Item name="destinationCity" label="Điểm đến" rules={[{ required: true }]}>
              <Input placeholder="VD: Đà Nẵng" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="durationDays" label="Số ngày đi" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder="3" />
            </Form.Item>
            <Form.Item name="durationNights" label="Số đêm nghỉ" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="2" />
            </Form.Item>
          </div>

          <Form.Item name="featuredImage" label="Tên file ảnh / URL ảnh">
            <Input placeholder="phuquoc-thumb.jpg" />
          </Form.Item>
          <Form.Item name="summary" label="Tóm tắt ngắn">
            <Input.TextArea rows={2} placeholder="Tóm tắt nổi bật chuyến đi..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea rows={4} placeholder="Chi tiết giới thiệu tour..." />
          </Form.Item>

          {editingId && (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="ACTIVE">Hoạt động (ACTIVE)</Select.Option>
                <Select.Option value="INACTIVE">Tạm ẩn (INACTIVE)</Select.Option>
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

export default TourManagement;