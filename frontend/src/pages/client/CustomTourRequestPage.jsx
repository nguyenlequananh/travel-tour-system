import React, { useState } from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Row, Col, message, Result, Divider } from 'antd';
import {
  TeamOutlined,
  SendOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import customTourService from '../../services/customTourService';

const CustomTourRequestPage = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

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

      await customTourService.submitRequest(payload);
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
      <div className="th-section-card" style={{ maxWidth: 720, margin: '40px auto', padding: 40 }}>
        <Result
          status="success"
          title="Gửi Yêu Cầu Tour Đoàn Thành Công!"
          subTitle="Cảm ơn bạn đã tin tưởng TravelHub. Chuyên viên tư vấn khách đoàn của chúng tôi sẽ liên hệ lại trong vòng 2 – 4 giờ làm việc kèm bảng báo giá chi tiết."
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
    <div>
      {/* BANNER TIÊU ĐỀ */}
      <div
        style={{
          background: 'linear-gradient(125deg, #0b2545 0%, #0d6e6e 100%)',
          color: '#ffffff',
          padding: '36px 36px',
          borderRadius: 20,
          marginBottom: 28,
          boxShadow: '0 12px 30px rgba(11, 37, 69, 0.14)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.14)',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 600,
            color: '#ccfbf1',
            marginBottom: 12,
          }}
        >
          <TeamOutlined /> Giải pháp du lịch Doanh nghiệp & Đoàn thể (10 – 500 khách)
        </div>
        <h1 style={{ color: '#ffffff', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, marginBottom: 8 }}>
          Thiết Kế Tour Riêng Theo Yêu Cầu
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', maxWidth: 680, margin: 0 }}>
          Tổ chức trọn gói Team Building bãi biển, Gala Dinner, hội nghị MICE và du lịch khen thưởng với lịch trình linh hoạt theo ngân sách công ty.
        </p>
      </div>

      {/* BỐ CỤC 2 CỘT CÂN ĐỐI: QUY TRÌNH TIN CẬY (TRÁI) + FORM YÊU CẦU (PHẢI) */}
      <Row gutter={[28, 28]} align="top">
        <Col xs={24} lg={9}>
          <div className="th-section-card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
              Quy trình 3 bước nhanh gọn
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  step: '01',
                  title: 'Gửi yêu cầu trực tuyến',
                  desc: 'Điền số lượng khách, điểm đến và mong muốn cơ bản của đoàn.',
                },
                {
                  step: '02',
                  title: 'Nhận lịch trình & báo giá',
                  desc: 'Chuyên viên B2B liên hệ tư vấn và gửi 2–3 phương án trong vòng 2 giờ.',
                },
                {
                  step: '03',
                  title: 'Ký hợp đồng & khởi hành',
                  desc: 'Đội ngũ điều hành và hướng dẫn viên chuyên nghiệp đồng hành xuyên suốt.',
                },
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: '#e6f4f1',
                      color: '#0d6e6e',
                      fontWeight: 800,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14.5, marginBottom: 2 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.55 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Divider style={{ margin: '20px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: '#334155' }}>
              <div><CheckCircleOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />Xuất hóa đơn VAT đầy đủ cho doanh nghiệp</div>
              <div><ClockCircleOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />Phản hồi báo giá trong 2 – 4 giờ làm việc</div>
              <div><SafetyCertificateOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />Bảo hiểm du lịch trọn gói theo đoàn</div>
            </div>
          </div>

          <div
            style={{
              background: '#e6f4f1',
              border: '1px solid #99d5cc',
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div style={{ fontWeight: 700, color: '#0d6e6e', fontSize: 14, marginBottom: 4 }}>
              <PhoneOutlined style={{ marginRight: 6 }} /> Cần tư vấn trực tiếp ngay?
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0b2545', marginBottom: 4 }}>1900 8888</div>
            <div style={{ fontSize: 13, color: '#475569' }}>Hỗ trợ khách đoàn & doanh nghiệp 24/7</div>
          </div>
        </Col>

        <Col xs={24} lg={15}>
          <div className="th-section-card" style={{ padding: 28 }}>
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
              <h3 style={{ color: '#0d6e6e', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                1. Thông tin người đại diện liên hệ
              </h3>
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên!' }]}>
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

              <Divider style={{ margin: '12px 0 20px' }} />

              <h3 style={{ color: '#0d6e6e', fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                2. Kế hoạch chuyến đi của đoàn
              </h3>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="destination" label="Điểm đến mong muốn" rules={[{ required: true, message: 'Nhập điểm đến!' }]}>
                    <Input placeholder="Ví dụ: Nha Trang, Phú Quốc, Đà Lạt..." size="large" />
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
                    <InputNumber min={5} style={{ width: '100%' }} size="large" placeholder="VD: 50" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="estimatedDurationDays" label="Số ngày đi dự kiến" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: '100%' }} size="large" placeholder="VD: 3" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="budgetPerPerson" label="Ngân sách / người (VNĐ)">
                    <InputNumber min={500000} step={500000} style={{ width: '100%' }} size="large" placeholder="VD: 5000000" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="specialRequirements"
                label="Yêu cầu đặc biệt (Team Building, Gala Dinner, hạng khách sạn, vé máy bay...)"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Mô tả chi tiết nhu cầu của đoàn để chúng tôi thiết kế lịch trình phù hợp nhất..."
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SendOutlined />}
                  loading={submitting}
                  style={{
                    minWidth: 220,
                    height: 48,
                    fontSize: 15.5,
                    fontWeight: 700,
                    background: '#e85d04',
                    borderColor: '#e85d04',
                  }}
                >
                  Gửi Yêu Cầu Báo Giá
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CustomTourRequestPage;
