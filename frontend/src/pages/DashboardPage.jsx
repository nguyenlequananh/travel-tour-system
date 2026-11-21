import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Tag, Select, Progress, message, Spin, Button, Space } from 'antd';
import {
  DollarCircleOutlined,
  ShoppingOutlined,
  TeamOutlined,
  CompassOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { dashboardService, exportService } from '../services';

const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [exporting, setExporting] = useState(false);

  const handleExportFinancialReport = async () => {
    setExporting(true);
    try {
      await exportService.exportFinancialReport(selectedMonth, selectedYear);
      message.success(`Đã xuất báo cáo tài chính Tháng ${selectedMonth}/${selectedYear} thành công!`);
    } catch (err) {
      message.error(err.message || 'Lỗi khi xuất file Excel báo cáo tài chính!');
    } finally {
      setExporting(false);
    }
  };

  const fetchDashboardStats = async (year) => {
    setLoading(true);
    try {
      const res = await dashboardService.getStats(year);
      setData(res.data);
    } catch (err) {
      message.error(err.message || 'Lỗi tải thống kê doanh thu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(selectedYear);
  }, [selectedYear]);

  const topTourColumns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 72,
      align: 'center',
      render: (_, __, index) => (
        <Tag
          color={index === 0 ? 'gold' : index === 1 ? 'cyan' : index === 2 ? 'blue' : 'default'}
          style={{ borderRadius: 999, fontWeight: 700, margin: 0 }}
        >
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: 'Mã Tour',
      dataIndex: 'tourCode',
      key: 'tourCode',
      width: 120,
      render: (text) => (
        <Tag style={{ background: '#e6f4f1', color: '#0d6e6e', borderColor: '#99d5cc', fontWeight: 700 }}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Tên Tour',
      dataIndex: 'tourName',
      key: 'tourName',
      render: (t) => <strong style={{ color: '#0f172a' }}>{t}</strong>,
    },
    {
      title: 'Số đơn',
      dataIndex: 'totalBookings',
      key: 'totalBookings',
      width: 105,
      align: 'center',
      render: (count) => <Tag style={{ borderRadius: 999, fontWeight: 600 }}>{count} đơn</Tag>,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 155,
      align: 'right',
      render: (amount) => (
        <strong style={{ color: '#0d6e6e', fontSize: 14.5 }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </strong>
      ),
    },
  ];

  const maxRevenue =
    data?.monthlyRevenues?.reduce((max, item) => Math.max(max, Number(item.revenue)), 0) || 1;

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'TỔNG DOANH THU THỰC NHẬN',
      value: `${Number(data?.totalRevenue || 0).toLocaleString('vi-VN')} đ`,
      icon: <DollarCircleOutlined style={{ fontSize: 22 }} />,
      color: '#0d6e6e',
      softBg: '#e6f4f1',
    },
    {
      title: 'TỔNG SỐ ĐƠN ĐẶT TOUR',
      value: Number(data?.totalBookings || 0).toLocaleString('vi-VN'),
      icon: <ShoppingOutlined style={{ fontSize: 22 }} />,
      color: '#0b2545',
      softBg: '#e2e8f0',
    },
    {
      title: 'TỔNG LƯỢT KHÁCH PHỤC VỤ',
      value: Number(data?.totalPassengers || 0).toLocaleString('vi-VN'),
      icon: <TeamOutlined style={{ fontSize: 22 }} />,
      color: '#e85d04',
      softBg: '#fff4ed',
    },
    {
      title: 'TOUR ĐANG MỞ BÁN',
      value: Number(data?.activeTours || 0).toLocaleString('vi-VN'),
      icon: <CompassOutlined style={{ fontSize: 22 }} />,
      color: '#16a34a',
      softBg: '#f0fdf4',
    },
  ];

  const statusRows = [
    { label: 'Hoàn thành (COMPLETED)', count: data?.bookingStatusCounts?.COMPLETED || 0, color: '#16a34a' },
    { label: 'Đã xác nhận (CONFIRMED)', count: data?.bookingStatusCounts?.CONFIRMED || 0, color: '#0d6e6e' },
    { label: 'Chờ xử lý (PENDING)', count: data?.bookingStatusCounts?.PENDING || 0, color: '#d97706' },
    { label: 'Đã hủy (CANCELLED)', count: data?.bookingStatusCounts?.CANCELLED || 0, color: '#dc2626' },
  ];

  return (
    <div>
      {/* THANH TIÊU ĐỀ & BỘ CHỌN BÁO CÁO */}
      <div
        className="th-section-card"
        style={{
          padding: '18px 24px',
          marginBottom: 22,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChartOutlined style={{ color: '#0d6e6e' }} />
            Báo Cáo & Thống Kê Doanh Thu
          </h2>
          <span style={{ color: '#64748b', fontSize: 13.5 }}>
            Theo dõi hiệu quả kinh doanh theo năm và xuất báo cáo tài chính chi tiết định dạng Excel
          </span>
        </div>

        <Space align="center" wrap>
          <Select value={selectedMonth} style={{ width: 112 }} onChange={(val) => setSelectedMonth(val)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <Select.Option key={m} value={m}>Tháng {m}</Select.Option>
            ))}
          </Select>

          <Select value={selectedYear} style={{ width: 112 }} onChange={(val) => setSelectedYear(val)}>
            <Select.Option value={2026}>Năm 2026</Select.Option>
            <Select.Option value={2025}>Năm 2025</Select.Option>
            <Select.Option value={2024}>Năm 2024</Select.Option>
          </Select>

          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            style={{ backgroundColor: '#15803d', borderColor: '#15803d', fontWeight: 600 }}
            loading={exporting}
            onClick={handleExportFinancialReport}
          >
            Xuất Excel Tài Chính
          </Button>
        </Space>
      </div>

      {/* 4 THẺ KPI CHUẨN CONTRAST & ALIGNMENT */}
      <Row gutter={[18, 18]} style={{ marginBottom: 22 }}>
        {kpiCards.map((kpi) => (
          <Col xs={24} sm={12} lg={6} key={kpi.title}>
            <div
              className="th-section-card"
              style={{
                padding: '20px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                borderTop: `3px solid ${kpi.color}`,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', letterSpacing: '0.03em', marginBottom: 6 }}>
                  {kpi.title}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: kpi.color,
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                  }}
                >
                  {kpi.value}
                </div>
              </div>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: kpi.softBg,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {kpi.icon}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* BIỂU ĐỒ DOANH THU 12 THÁNG */}
      <Card
        title={
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            Biểu Đồ Doanh Thu 12 Tháng — Năm {selectedYear}
          </span>
        }
        style={{ marginBottom: 22 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: 230,
            padding: '24px 8px 4px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {data?.monthlyRevenues?.map((item) => {
            const rev = Number(item.revenue || 0);
            const heightPx = maxRevenue > 0 ? (rev / maxRevenue) * 165 : 0;
            const isSelectedMonth = item.month === selectedMonth;
            return (
              <div
                key={item.month}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '7.5%',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isSelectedMonth ? '#e85d04' : '#64748b',
                    marginBottom: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {rev > 0 ? `${(rev / 1000000).toFixed(1)}Tr` : ''}
                </span>
                <div
                  style={{
                    width: '72%',
                    maxWidth: 42,
                    height: `${Math.max(heightPx, 6)}px`,
                    background:
                      rev > 0
                        ? isSelectedMonth
                          ? 'linear-gradient(180deg, #e85d04 0%, #f97316 100%)'
                          : 'linear-gradient(180deg, #0d6e6e 0%, #14b8a6 100%)'
                        : '#e2e8f0',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  title={`Tháng ${item.month}: ${rev.toLocaleString('vi-VN')} đ`}
                  onClick={() => setSelectedMonth(item.month)}
                />
                <span
                  style={{
                    marginTop: 8,
                    fontSize: 12.5,
                    fontWeight: isSelectedMonth ? 800 : 600,
                    color: isSelectedMonth ? '#e85d04' : '#475569',
                  }}
                >
                  T{item.month}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 12.5, color: '#64748b' }}>
          Mẹo: Nhấp trực tiếp vào cột tháng bất kỳ để chọn nhanh tháng xuất báo cáo Excel.
        </div>
      </Card>

      {/* TOP 5 TOUR & PHÂN BỔ TRẠNG THÁI ĐƠN */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                <TrophyOutlined style={{ color: '#d97706', marginRight: 8 }} />
                Top 5 Tour Bán Chạy Nhất
              </span>
            }
          >
            <Table
              columns={topTourColumns}
              dataSource={data?.topSellingTours || []}
              rowKey="tourId"
              pagination={false}
              size="middle"
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={<span style={{ fontSize: 16, fontWeight: 700 }}>Phân Bổ Trạng Thái Đơn Hàng</span>}>
            {data?.bookingStatusCounts ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {statusRows.map((row) => {
                  const pct =
                    data.totalBookings > 0
                      ? Math.round((row.count / data.totalBookings) * 100)
                      : 0;
                  return (
                    <div key={row.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13.5 }}>
                        <span style={{ color: '#475569', fontWeight: 500 }}>{row.label}</span>
                        <strong style={{ color: '#0f172a' }}>{row.count} đơn</strong>
                      </div>
                      <Progress percent={pct} strokeColor={row.color} railColor="#f1f5f9" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>Chưa có dữ liệu đơn hàng.</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
