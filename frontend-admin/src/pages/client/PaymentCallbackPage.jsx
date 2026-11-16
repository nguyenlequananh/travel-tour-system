import React, { useEffect, useState } from 'react';
import { Result, Button, Spin, Card } from 'antd';
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
        // 1. Lấy toàn bộ tham số do VNPay gửi về trên thanh URL
        const searchParams = location.search;

        // Trích xuất mã đơn và số tiền để hiển thị lên màn hình
        const params = new URLSearchParams(searchParams);
        setBookingCode(params.get('vnp_TxnRef') || '');
        const rawAmount = Number(params.get('vnp_Amount') || 0) / 100; // Chia lại cho 100
        setAmount(rawAmount);

        // 2. Gọi paymentService để gửi callback sang backend
        const res = await paymentService.verifyVnPayCallback(searchParams);

        // Backend trả về true nếu thanh toán thành công (mã 00)
        if (res.data === true) {
          setIsSuccess(true);
        } else {
          setIsSuccess(false);
        }
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
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <h3 style={{ marginTop: 20 }}>Đang kiểm tra giao dịch với ngân hàng VNPay...</h3>
        <p style={{ color: '#888' }}>Vui lòng không tắt hoặc tải lại trang web.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      <Card bordered={false} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderRadius: 12 }}>
        {isSuccess ? (
          <Result
            status="success"
            title="Thanh Toán Tour Du Lịch Thành Công!"
            subTitle={
              <div>
                <p>Mã đơn đặt tour của quý khách: <strong style={{ color: '#1677ff', fontSize: 16 }}>{bookingCode}</strong></p>
                <p>Số tiền đã thanh toán: <strong style={{ color: '#52c41a', fontSize: 18 }}>{amount.toLocaleString('vi-VN')} đ</strong></p>
                <p style={{ color: '#666' }}>Hệ thống đã gửi email hóa đơn chi tiết vào hộp thư của bạn. Chúc bạn có một chuyến du lịch tuyệt vời!</p>
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
            title="Giao Dịch Thanh Toán Thất Bại!"
            subTitle="Giao dịch của bạn đã bị hủy hoặc xảy ra lỗi trong quá trình trừ tiền từ ngân hàng. Đơn hàng của bạn vẫn được giữ chỗ, vui lòng thử thanh toán lại."
            extra={[
              <Button type="primary" danger size="large" key="retry" onClick={() => navigate('/my-bookings')}>
                Quay Lại Thử Lại
              </Button>,
              <Button size="large" key="home" onClick={() => navigate('/')}>
                Về Trang Chủ
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PaymentCallbackPage;
