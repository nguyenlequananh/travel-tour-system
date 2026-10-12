import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
        await axiosClient.put(`/admin/users/${editingId}`, {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          address: values.address,
        });
        message.success('Cập nhật người dùng thành công!');
      } else {
        await axiosClient.post('/admin/users', values);
        message.success('Tạo người dùng mới thành công!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosClient.patch(`/admin/users/${id}`);
      message.success('Đổi trạng thái tài khoản thành công!');
      fetchUsers();
    } catch (err) {
      message.error(err.message);
    }
  };

  const columns = [
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', render: (t) => <strong>{t}</strong> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => <Tag color={active ? 'green' : 'volcano'}>{active ? 'Hoạt động' : 'Bị khóa'}</Tag>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => (d ? dayjs(d).format('DD/MM/YYYY') : '—'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Khóa / Mở khóa tài khoản này?" onConfirm={() => handleToggleStatus(record.id)}>
            <Button icon={<LockOutlined />} size="small" danger={record.isActive}>
              {record.isActive ? 'Khóa' : 'Mở'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2><UserOutlined style={{ marginRight: 8 }} /> Quản lý Người dùng & Khách hàng</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
          Thêm Người Dùng
        </Button>
      </div>

      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />

      <Modal
        title={editingId ? 'Sửa Thông Tin Người Dùng' : 'Tạo Tài Khoản Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="example@gmail.com" disabled={!!editingId} />
          </Form.Item>
          {!editingId && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Tối thiểu 6 ký tự" />
            </Form.Item>
          )}
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="0912345678" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Địa chỉ cư trú..." />
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

export default UserManagement;