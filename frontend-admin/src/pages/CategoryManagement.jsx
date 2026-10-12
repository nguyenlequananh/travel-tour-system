import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/categories');
      setCategories(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        await axiosClient.put(`/admin/categories/${editingId}`, values);
        message.success('Cập nhật danh mục thành công!');
      } else {
        await axiosClient.post('/admin/categories', values);
        message.success('Tạo danh mục mới thành công!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/categories/${id}`);
      message.success('Xóa danh mục thành công!');
      fetchCategories();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Tên Danh Mục', dataIndex: 'name', key: 'name', render: (t) => <strong>{t}</strong> },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Bạn có chắc muốn xóa danh mục này?" onConfirm={() => handleDelete(record.id)}>
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
        <h2><AppstoreOutlined style={{ marginRight: 8 }} /> Quản lý Danh mục Tour</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
          Thêm Danh Mục
        </Button>
      </div>

      <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Nhập tên danh mục!' }]}>
            <Input placeholder="VD: Tour Miền Bắc, Tour Biển Đảo" />
          </Form.Item>
          <Form.Item name="slug" label="Slug (Đường dẫn tĩnh)" rules={[{ required: true, message: 'Nhập slug!' }]}>
            <Input placeholder="VD: tour-mien-bac" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn về danh mục..." />
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

export default CategoryManagement;