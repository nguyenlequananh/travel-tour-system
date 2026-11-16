import React, { useEffect, useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Spin, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import userService from '../../services/userService';

const { Title } = Typography;

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 1. Tải thông tin cá nhân từ Token
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      profileForm.setFieldsValue(res.data);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải thông tin cá nhân!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (values) => {
    setSaving(true);
    try {
      const res = await userService.updateProfile({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address,
      });

      // Cập nhật lại thông tin trong localStorage để thanh Header đổi tên ngay lập tức
      const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');
      savedUser.fullName = res.data.fullName;
      localStorage.setItem('travel_user', JSON.stringify(savedUser));

      message.success('Cập nhật thông tin thành công!');
    } catch (err) {
      message.error(err.message || 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  // 3. Đổi mật khẩu
  const handleChangePassword = async (values) => {
    try {
      await userService.changePassword(values);
      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Đổi mật khẩu thất bại!');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: 'Thông tin cá nhân',
      children: (
        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile} style={{ maxWidth: 500 }}>
          <Form.Item name="email" label="Email đăng nhập">
            <Input prefix={<MailOutlined />} disabled style={{ color: '#888', background: '#f5f5f5' }} />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input prefix={<PhoneOutlined />} placeholder="0912345678" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input prefix={<HomeOutlined />} placeholder="Địa chỉ của bạn..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            Lưu thay đổi
          </Button>
        </Form>
      ),
    },
    {
      key: '2',
      label: 'Đổi mật khẩu',
      children: (
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword} style={{ maxWidth: 500 }}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 6, message: 'Mật khẩu mới ít nhất 6 ký tự!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
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
          <Button type="primary" danger htmlType="submit">
            Cập nhật mật khẩu
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <Title level={3} style={{ marginBottom: 20 }}>
          <UserOutlined style={{ marginRight: 8, color: '#1677ff' }} /> Tài Khoản Của Tôi
        </Title>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>
    </div>
  );
};

export default ProfilePage;
