import React, { useEffect, useState } from 'react';
import { Tabs, Form, Input, Button, message, Spin, Avatar } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import userService from '../../services/userService';

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      setProfileData(res.data);
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

  const handleUpdateProfile = async (values) => {
    setSaving(true);
    try {
      const res = await userService.updateProfile({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address,
      });

      setProfileData(res.data);
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
      label: (
        <span>
          <UserOutlined style={{ marginRight: 6 }} />
          Thông tin cá nhân
        </span>
      ),
      children: (
        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile} style={{ maxWidth: 520, marginTop: 8 }}>
          <Form.Item name="email" label="Email đăng nhập">
            <Input prefix={<MailOutlined style={{ color: '#94a3b8' }} />} disabled />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
            <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0912345678" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input prefix={<HomeOutlined style={{ color: '#94a3b8' }} />} placeholder="Địa chỉ liên hệ của bạn..." />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} style={{ minWidth: 150 }}>
            Lưu thay đổi
          </Button>
        </Form>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          Đổi mật khẩu
        </span>
      ),
      children: (
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword} style={{ maxWidth: 520, marginTop: 8 }}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 6, message: 'Mật khẩu mới ít nhất 6 ký tự!' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Tối thiểu 6 ký tự" />
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
            <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
          <Button type="primary" danger htmlType="submit" style={{ minWidth: 160 }}>
            Cập nhật mật khẩu
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* HEADER HỒ SƠ */}
      <div
        className="th-section-card"
        style={{
          padding: 24,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          background: 'linear-gradient(120deg, #ffffff 60%, #e6f4f1 100%)',
        }}
      >
        <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#0d6e6e', flexShrink: 0 }} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', color: '#0f172a' }}>
            {profileData?.fullName || 'Tài Khoản Của Tôi'}
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>
            {profileData?.email || 'Cập nhật thông tin liên hệ và bảo mật tài khoản TravelHub'}
          </p>
        </div>
      </div>

      {/* NỘI DUNG TABS */}
      <div className="th-section-card" style={{ padding: '16px 28px 28px' }}>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </div>
    </div>
  );
};

export default ProfilePage;
