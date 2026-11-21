import React, { useEffect, useState } from 'react';
import { Result, Button, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import paymentService from '../../services/paymentService';

const PaymentCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [amount, setAmount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const searchParams = location.search;
        const params = new URLSearchParams(searchParams);
        setBookingCode(params.get('vnp_TxnRef') || '');
        const rawAmount = Number(params.get('vnp_Amount') || 0) / 100;
        setAmount(rawAmount);

        const res = await paymentService.verifyVnPayCallback(searchParams);
        setIsSuccess(res.data === true);
      } catch (err) {
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location]);

  if (loading) {
    return (
      <div className="th-section-card" style={{ maxWidth: 560, margin: '60px auto', padding: '64px 24px', textAlign: 'center' }}>
        <Spin size="large" />
        <h3 style={{ marginTop: 20, marginBottom: 6, color: '#0f172a' }}>Đang xác thực giao dịch với VNPay...</h3>
        <p style={{ color: '#64748b', margin: 0 }}>Vui lòng không đóng hoặc tải lại trình duyệt trong giây lát.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '36px auto' }}>
      <div className="th-section-card" style={{ padding: '24px 28px' }}>
        {isSuccess ? (
          <Result
            status="success"
            title="Thanh Toán Tour Du Lịch Thành Công!"
            subTitle={
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px 20px',
                  marginTop: 14,
                  textAlign: 'left',
                  maxWidth: 440,
                  marginInline: 'auto',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#64748b' }}>Mã đơn đặt tour:</span>
                  <strong style={{ color: '#0d6e6e', fontSize: 15 }}>{bookingCode}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: '#64748b' }}>Số tiền đã thanh toán:</span>
                  <strong style={{ color: '#e85d04', fontSize: 17 }}>{amount.toLocaleString('vi-VN')} đ</strong>
                </div>
                <div style={{ fontSize: 13, color: '#475569', borderTop: '1px dashed #cbd5e1', paddingTop: 10 }}>
                  Hệ thống đã gửi email xác nhận & hóa đơn chi tiết vào hộp thư của bạn.
                </div>
              </div>
            }
            extra={[
              <Button type="primary" size="large" key="bookings" onClick={() => navigate('/my-bookings')}>
                Xem Vé Của Tôi
              </Button>,
              <Button size="large" key="home" onClick={() => navigate('/')}>
                Về Trang Chủ
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Giao Dịch Thanh Toán Chưa Hoàn Tất"
            subTitle="Giao dịch đã bị hủy hoặc gặp lỗi từ phía ngân hàng. Đơn đặt tour của bạn vẫn đang được giữ chỗ trong thời hạn quy định, bạn có thể thử thanh toán lại."
            extra={[
              <Button
                type="primary"
                danger
                size="large"
                key="retry"
                onClick={() => navigate('/my-bookings')}
              >
                Quay Lại Thanh Toán
              </Button>,
              <Button size="large" key="home" onClick={() => navigate('/')}>
                Về Trang Chủ
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage;
