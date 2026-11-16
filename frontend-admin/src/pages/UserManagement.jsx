import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, Popconfirm, message, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined, UserOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { userService } from '../services';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // State phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State Modal Phân Quyền
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [roleForm] = Form.useForm();

  const fetchUsers = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const params = { page, size, sortBy: 'id', order: 'DESC' };
      const res = await userService.getAdminUsers(params);
      const pageData = res.data;

      setUsers(pageData.data || []);
      setPagination({
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      });
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(0, pagination.pageSize);
  }, []);

  const handleTableChange = (pagin) => {
    fetchUsers(pagin.current - 1, pagin.pageSize);
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        fullName: record.fullName,
        email: record.email,
        phoneNumber: record.phoneNumber,
        address: record.address,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await userService.updateUser(editingId, {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          address: values.address,
        });
        message.success('Cập nhật người dùng thành công!');
      } else {
        await userService.createUser(values);
        message.success('Tạo người dùng mới thành công!');
      }
      setIsModalOpen(false);
      fetchUsers(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Lỗi thao tác người dùng!');
    }
  };

  const handleOpenRoleModal = (record) => {
    setSelectedUserForRole(record);
    roleForm.setFieldsValue({ roleNames: record.roles || ['ROLE_CUSTOMER'] });
    setIsRoleModalOpen(true);
  };

  const handleSaveRoles = async (values) => {
    try {
      await userService.updateUserRoles(selectedUserForRole.id, {
        roleNames: values.roleNames,
      });
      message.success('Cập nhật quyền thành công!');
      setIsRoleModalOpen(false);
      fetchUsers(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Lỗi cập nhật quyền!');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await userService.deleteUser(id);
      message.success('Đổi trạng thái tài khoản thành công!');
      fetchUsers(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Lỗi đổi trạng thái!');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', render: (t) => <strong>{t}</strong> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber', render: (p) => p || '—' },
    {
      title: 'Vai trò (Roles)',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => (
        <>
          {(roles || []).map((r) => (
            <Tag color={r === 'ROLE_ADMIN' ? 'volcano' : r === 'ROLE_GUIDE' ? 'green' : 'blue'} key={r}>
              {r.replace('ROLE_', '')}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => <Tag color={active ? 'green' : 'volcano'}>{active ? 'Hoạt động' : 'Bị khóa'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>

          <Button
            icon={<SafetyCertificateOutlined />}
            size="small"
            style={{ color: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => handleOpenRoleModal(record)}
          >
            Quyền
          </Button>

          <Popconfirm
            title={`Bạn có chắc muốn ${record.isActive ? 'khóa' : 'mở khóa'} tài khoản này?`}
            onConfirm={() => handleToggleStatus(record.id)}
          >
            <Button
              icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
              size="small"
              danger={record.isActive}
            >
              {record.isActive ? 'Khóa' : 'Mở'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              Quản lý Người dùng & Phân Quyền
            </h2>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
              Thêm Người Dùng
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* MODAL THÊM / SỬA USER */}
      <Modal
        title={editingId ? 'Sửa Thông Tin Người Dùng' : 'Thêm Người Dùng Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          {!editingId && (
            <>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' },
                ]}
              >
                <Input placeholder="VD: nguyen@gmail.com" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password placeholder="Nhập mật khẩu..." />
              </Form.Item>
            </>
          )}

          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="VD: 0901234567" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="VD: Hà Nội, TP.HCM..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL PHÂN QUYỀN (ROLES) */}
      <Modal
        title={`Phân quyền cho: ${selectedUserForRole?.fullName}`}
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" onFinish={handleSaveRoles}>
          <Form.Item
            name="roleNames"
            label="Danh sách quyền hạn"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 quyền!' }]}
          >
            <Select mode="multiple" placeholder="Chọn các quyền...">
              <Select.Option value="ROLE_CUSTOMER">Khách hàng (ROLE_CUSTOMER)</Select.Option>
              <Select.Option value="ROLE_GUIDE">Hướng dẫn viên (ROLE_GUIDE)</Select.Option>
              <Select.Option value="ROLE_ADMIN">Quản trị viên (ROLE_ADMIN)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsRoleModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Cập nhật quyền</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
