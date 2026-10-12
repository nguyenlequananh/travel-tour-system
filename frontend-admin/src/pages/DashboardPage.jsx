import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Select, Progress, message, Spin } from 'antd';
import {
  DollarCircleOutlined,
  ShoppingOutlined,
  TeamOutlined,
  CompassOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2026);

  const fetchDashboardStats = async (year) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/admin/dashboard/stats?year=${year}`);
      setData(res.data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(selectedYear);
  }, [selectedYear]);

  // Cột cho bảng Top 5 Tour bán chạy
  const topTourColumns = [
    {
      title: 'Top',
      key: 'rank',
      width: 60,
      render: (_, __, index) => (
        <Tag color={index === 0 ? 'gold' : index === 1 ? 'cyan' : index === 2 ? 'blue' : 'default'}>
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: 'Mã Tour',
      dataIndex: 'tourCode',
      key: 'tourCode',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Tên Tour',
      dataIndex: 'tourName',
      key: 'tourName',
    },
    {
      title: 'Số đơn bán',
      dataIndex: 'totalBookings',
      key: 'totalBookings',
      render: (count) => <Tag color="purple">{count} đơn</Tag>,
    },
    {
      title: 'Doanh thu thu về',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (amount) => (
        <strong style={{ color: '#52c41a' }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </strong>
      ),
    },
  ];

  // Tìm doanh thu tháng cao nhất để tính % chiều cao cột biểu đồ
  const maxRevenue = data?.monthlyRevenues?.reduce((max, item) => Math.max(max, Number(item.revenue)), 0) || 1;

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* THANH TIÊU ĐỀ VÀ BỘ CHỌN NĂM */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2><BarChartOutlined style={{ marginRight: 8 }} /> Báo Cáo & Thống Kê Tổng Quan</h2>
        <div>
          <span style={{ marginRight: 8, fontWeight: 500 }}>Năm xem báo cáo:</span>
          <Select value={selectedYear} style={{ width: 120 }} onChange={(val) => setSelectedYear(val)}>
            <Select.Option value={2026}>Năm 2026</Select.Option>
            <Select.Option value={2025}>Năm 2025</Select.Option>
            <Select.Option value={2024}>Năm 2024</Select.Option>
          </Select>
        </div>
      </div>

      {/* 4 THẺ CHỈ SỐ KPI CARDS */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Statistic
              title="Tổng Doanh Thu Thực Nhận"
              value={Number(data?.totalRevenue || 0)}
              precision={0}
              suffix="đ"
              valueStyle={{ color: '#389e0d', fontWeight: 'bold' }}
              prefix={<DollarCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#e6f4ff', border: '1px solid #91caff' }}>
            <Statistic
              title="Tổng Số Đơn Đặt Tour"
              value={data?.totalBookings || 0}
              valueStyle={{ color: '#0958d9', fontWeight: 'bold' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
            <Statistic
              title="Tổng Lượt Khách Phục Vụ"
              value={data?.totalPassengers || 0}
              valueStyle={{ color: '#d46b08', fontWeight: 'bold' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ background: '#f9f0ff', border: '1px solid #d3adf7' }}>
            <Statistic
              title="Tour Đang Mở Bán"
              value={data?.activeTours || 0}
              valueStyle={{ color: '#531dab', fontWeight: 'bold' }}
              prefix={<CompassOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* BIỂU ĐỒ DOANH THU 12 THÁNG TRỰC QUAN */}
      <Card title={`Biểu Đồ Doanh Thu 12 Tháng Năm ${selectedYear}`} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 220, padding: '20px 10px 0' }}>
          {data?.monthlyRevenues?.map((item) => {
            const heightPercent = maxRevenue > 0 ? (Number(item.revenue) / maxRevenue) * 160 : 0;
            return (
              <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '7%' }}>
                <span style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                  {item.revenue > 0 ? `${(item.revenue / 1000000).toFixed(1)}Tr` : ''}
                </span>
                <div
                  style={{
                    width: '70%',
                    height: `${Math.max(heightPercent, 4)}px`,
                    backgroundColor: item.revenue > 0 ? '#1677ff' : '#f0f0f0',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease',
                  }}
                  title={`Tháng ${item.month}: ${Number(item.revenue).toLocaleString()} đ`}
                />
                <span style={{ marginTop: 8, fontSize: 12, fontWeight: 500 }}>T{item.month}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* TOP 5 TOUR VÀ TRẠNG THÁI ĐƠN */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={<><TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} /> Top 5 Tour Bán Chạy Nhất</>}>
            <Table
              columns={topTourColumns}
              dataSource={data?.topSellingTours || []}
              rowKey="tourId"
              pagination={false}
              size="middle"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Trạng Thái Đơn Hàng">
            {data?.bookingStatusCounts && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hoàn thành (COMPLETED):</span>
                    <strong>{data.bookingStatusCounts.COMPLETED || 0} đơn</strong>
                  </div>
                  <Progress percent={data.totalBookings > 0 ? Math.round(((data.bookingStatusCounts.COMPLETED || 0) / data.totalBookings) * 100) : 0} strokeColor="#52c41a" />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Đã cọc / Xác nhận (CONFIRMED):</span>
                    <strong>{data.bookingStatusCounts.CONFIRMED || 0} đơn</strong>
                  </div>
                  <Progress percent={data.totalBookings > 0 ? Math.round(((data.bookingStatusCounts.CONFIRMED || 0) / data.totalBookings) * 100) : 0} strokeColor="#1677ff" />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Chờ xử lý (PENDING):</span>
                    <strong>{data.bookingStatusCounts.PENDING || 0} đơn</strong>
                  </div>
                  <Progress percent={data.totalBookings > 0 ? Math.round(((data.bookingStatusCounts.PENDING || 0) / data.totalBookings) * 100) : 0} strokeColor="#faad14" />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Đã hủy (CANCELLED):</span>
                    <strong>{data.bookingStatusCounts.CANCELLED || 0} đơn</strong>
                  </div>
                  <Progress percent={data.totalBookings > 0 ? Math.round(((data.bookingStatusCounts.CANCELLED || 0) / data.totalBookings) * 100) : 0} strokeColor="#ff4d4f" />
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;