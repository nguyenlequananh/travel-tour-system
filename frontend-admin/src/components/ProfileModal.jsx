import React, { useEffect, useState } from 'react';
import { Modal, Tabs, Form, Input, Button, message, Spin } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const ProfileModal = ({ open, onCancel }) => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 1. Tải thông tin tài khoản khi mở modal
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      profileForm.setFieldsValue(res.data);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải thông tin!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProfile();
      passwordForm.resetFields();
    }
  }, [open]);

  // 2. Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (values) => {
    try {
      const res = await userService.updateProfile({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address,
      });

      updateUser(res.data);
      message.success('Cập nhật thông tin cá nhân thành công!');
      onCancel();
    } catch (err) {
      message.error(err.message || 'Cập nhật thất bại!');
    }
  };

  // 3. Đổi mật khẩu
  const handleChangePassword = async (values) => {
    try {
      await userService.changePassword(values);
      message.success('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
      passwordForm.resetFields();
      onCancel();
    } catch (err) {
      message.error(err.message || 'Đổi mật khẩu thất bại!');
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: 'Thông tin cá nhân',
      children: (
        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item name="email" label="Email đăng nhập">
            <Input prefix={<MailOutlined />} disabled style={{ background: '#f5f5f5', color: '#666' }} />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ của bạn..." />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button type="primary" htmlType="submit">
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: (
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Nhập mật khẩu cũ!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 6, message: 'Mật khẩu mới tối thiểu 6 ký tự!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận lại mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button type="primary" danger htmlType="submit">
              Cập nhật mật khẩu
            </Button>
          </div>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      title="Tài Khoản & Bảo Mật"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
      width={520}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : (
        <Tabs defaultActiveKey="profile" items={tabItems} />
      )}
    </Modal>
  );
};

export default ProfileModal;
