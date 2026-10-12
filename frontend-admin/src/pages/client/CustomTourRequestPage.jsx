import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, DatePicker, Button, Row, Col, message, Result, Space } from 'antd';
import { TeamOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

const CustomTourRequestPage = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Tự động điền thông tin nếu khách đã đăng nhập
  const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        destination: values.destination,
        departureDate: values.departureDate.format('YYYY-MM-DD'),
        estimatedDurationDays: values.estimatedDurationDays,
        estimatedGuests: values.estimatedGuests,
        budgetPerPerson: values.budgetPerPerson || null,
        specialRequirements: values.specialRequirements || null,
      };

      await axiosClient.post('/custom-tours', payload);
      setIsSuccess(true);
      form.resetFields();
    } catch (err) {
      message.error(err.message || 'Lỗi khi gửi yêu cầu tour đoàn!');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto', background: '#fff', padding: 40, borderRadius: 12 }}>
        <Result
          status="success"
          title="Gửi Yêu Cầu Tour Đoàn Thành Công!"
          subTitle="Cảm ơn bạn đã tin tưởng TravelHub. Chuyên viên tư vấn khách đoàn của chúng tôi sẽ liên hệ lại với bạn trong vòng 2 - 4 giờ làm việc để tư vấn và gửi bảng báo giá chi tiết."
          extra={[
            <Button type="primary" key="home" onClick={() => navigate('/')}>
              Về Trang Chủ
            </Button>,
            <Button key="again" onClick={() => setIsSuccess(false)}>
              Gửi Yêu Cầu Khác
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* BANNER GIỚI THIỆU TOUR DOANH NGHIỆP */}
      <div
        style={{
          background: 'linear-gradient(135deg, #003a8c 0%, #1677ff 100%)',
          color: '#fff',
          padding: '35px 30px',
          borderRadius: 12,
          marginBottom: 30,
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#fff', fontSize: 28, marginBottom: 8 }}>
          <TeamOutlined style={{ marginRight: 10 }} /> Thiết Kế Tour Riêng Cho Doanh Nghiệp & Đoàn Thể
        </h1>
        <p style={{ fontSize: 15, opacity: 0.9, maxWidth: 650, margin: '0 auto' }}>
          TravelHub chuyên tổ chức Team Building bãi biển, tiệc Gala Dinner, du lịch khen thưởng và hội nghị cao cấp cho đoàn từ 10 đến 500 khách.
        </p>
      </div>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            fullName: savedUser.fullName,
            email: savedUser.email,
            phoneNumber: savedUser.phoneNumber,
            estimatedDurationDays: 3,
            estimatedGuests: 20,
          }}
        >
          <h3 style={{ color: '#1677ff', marginBottom: 15 }}>1. Thông tin người đại diện liên hệ</h3>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="fullName" label="Họ và tên người liên hệ" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
                <Input placeholder="Nguyễn Văn A" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="phoneNumber" label="Số điện thoại / Zalo" rules={[{ required: true, message: 'Nhập số điện thoại!' }]}>
                <Input placeholder="0912345678" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="email" label="Email nhận báo giá" rules={[{ required: true, type: 'email', message: 'Nhập email hợp lệ!' }]}>
                <Input placeholder="congty@gmail.com" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <h3 style={{ color: '#1677ff', marginTop: 10, marginBottom: 15 }}>2. Kế hoạch chuyến đi của đoàn</h3>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="destination" label="Điểm đến mong muốn" rules={[{ required: true, message: 'Nhập điểm đến!' }]}>
                <Input placeholder="Ví dụ: Nha Trang, Phú Quốc, Quy Nhơn..." size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="departureDate" label="Ngày dự kiến khởi hành" rules={[{ required: true, message: 'Chọn ngày đi!' }]}>
                <DatePicker style={{ width: '100%' }} size="large" format="DD/MM/YYYY" placeholder="Chọn ngày đi" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="estimatedGuests" label="Số lượng khách dự kiến" rules={[{ required: true }]}>
                <InputNumber min={5} style={{ width: '100%' }} size="large" placeholder="VD: 50 người" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="estimatedDurationDays" label="Số ngày đi dự kiến" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} size="large" placeholder="VD: 3 ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="budgetPerPerson" label="Ngân sách dự kiến / người (VNĐ)">
                <InputNumber min={500000} style={{ width: '100%' }} size="large" placeholder="VD: 5000000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="specialRequirements" label="Yêu cầu đặc biệt của đoàn (Team Building, Gala Dinner, Phòng đơn, Bay Vietnam Airlines...)">
            <Input.TextArea rows={4} placeholder="Mô tả chi tiết mong muốn của công ty bạn để chúng tôi lên chương trình phù hợp nhất..." />
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 25 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SendOutlined />}
              loading={submitting}
              style={{ minWidth: 220, height: 48, fontSize: 16, fontWeight: 'bold' }}
            >
              Gửi Yêu Cầu Báo Giá
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CustomTourRequestPage;