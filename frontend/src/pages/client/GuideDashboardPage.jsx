import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Row,
  Col,
  Drawer,
  Checkbox,
  Progress,
  Input,
  message,
  Timeline,
  Space,
  Segmented,
  Empty,
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  CompassOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  FileExcelOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import guideService from '../../services/guideService';
import exportService from '../../services/exportService';

const GuideDashboardPage = () => {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL');
  const [departureKeyword, setDepartureKeyword] = useState('');

  // Drawer danh sách đoàn & điểm danh
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [passengerLoading, setPassengerLoading] = useState(false);
  const [searchPassengerKeyword, setSearchPassengerKeyword] = useState('');
  const [checkedInIds, setCheckedInIds] = useState(new Set());

  const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');

  const fetchMyDepartures = async () => {
    if (!savedUser.id) return;
    setLoading(true);
    try {
      const res = await guideService.getMyAssignedDepartures(savedUser.id);
      setDepartures(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải lịch phân công!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDepartures();

    const handleAutoReload = () => {
      fetchMyDepartures();
    };
    window.addEventListener('booking-status-updated', handleAutoReload);
    return () => {
      window.removeEventListener('booking-status-updated', handleAutoReload);
    };
  }, []);

  const handleOpenManifest = async (departure) => {
    setSelectedDeparture(departure);
    setIsDrawerOpen(true);
    setSearchPassengerKeyword('');
    setPassengerLoading(true);

    try {
      const res = await guideService.getDeparturePassengers(departure.departureId, savedUser.id);
      setPassengers(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách đoàn khách!');
    } finally {
      setPassengerLoading(false);
    }
  };

  const handleExportManifest = async (departureId) => {
    try {
      await exportService.exportGuideManifest(departureId, savedUser.id);
      message.success('Đã tải file Excel danh sách đoàn thành công!');
    } catch (err) {
      message.error(err.message || 'Lỗi khi xuất file Excel danh sách đoàn!');
    }
  };

  const handleToggleCheckIn = (passengerId) => {
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      if (next.has(passengerId)) next.delete(passengerId);
      else next.add(passengerId);
      return next;
    });
  };

  const handleCheckInAll = () => {
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      passengers.forEach((p) => next.add(p.passengerId));
      return next;
    });
  };

  const handleClearCheckIn = () => {
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      passengers.forEach((p) => next.delete(p.passengerId));
      return next;
    });
  };

  // Thống kê nhanh
  const totalTours = departures.length;
  const upcomingTours = departures.filter((d) => !dayjs(d.departureDate).isBefore(dayjs(), 'day')).length;
  const totalGuestsServed = departures.reduce((sum, d) => sum + (d.totalGuests || 0), 0);

  // Lọc bảng chuyến đi
  const filteredDepartures = useMemo(() => {
    return departures.filter((d) => {
      if (filterTab === 'UPCOMING' && dayjs(d.departureDate).isBefore(dayjs(), 'day')) return false;
      if (filterTab === 'OPEN' && d.status !== 'OPEN') return false;
      if (filterTab === 'CLOSED' && d.status !== 'CLOSED') return false;

      if (departureKeyword.trim()) {
        const kw = departureKeyword.toLowerCase();
        return (
          d.tourName?.toLowerCase().includes(kw) ||
          d.tourCode?.toLowerCase().includes(kw) ||
          d.destinationCity?.toLowerCase().includes(kw)
        );
      }
      return true;
    });
  }, [departures, filterTab, departureKeyword]);

  // Lọc hành khách trong Drawer
  const filteredPassengers = passengers.filter((p) => {
    if (!searchPassengerKeyword) return true;
    const kw = searchPassengerKeyword.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(kw) ||
      p.contactPhone?.toLowerCase().includes(kw) ||
      p.bookingCode?.toLowerCase().includes(kw)
    );
  });

  const checkedInCount = passengers.filter((p) => checkedInIds.has(p.passengerId)).length;
  const checkInPercent = passengers.length > 0 ? Math.round((checkedInCount / passengers.length) * 100) : 0;

  const columns = [
    {
      title: 'Chuyến Đi & Lộ Trình',
      key: 'tourInfo',
      render: (_, r) => (
        <div>
          <Space size={8} style={{ marginBottom: 4 }}>
            <Tag
              style={{
                margin: 0,
                background: '#e6f4f1',
                color: '#0d6e6e',
                borderColor: '#99d5cc',
                fontWeight: 700,
                borderRadius: 6,
              }}
            >
              {r.tourCode}
            </Tag>
            <strong style={{ color: '#0f172a', fontSize: 14.5 }}>{r.tourName}</strong>
          </Space>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            <EnvironmentOutlined style={{ color: '#0d6e6e', marginRight: 5 }} />
            {r.departureCity} ➔ <strong style={{ color: '#334155' }}>{r.destinationCity}</strong>
          </div>
        </div>
      ),
    },
    {
      title: 'Lịch Khởi Hành',
      key: 'dates',
      width: 210,
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
            <CalendarOutlined style={{ color: '#0d6e6e', marginRight: 6 }} />
            {dayjs(r.departureDate).format('DD/MM/YYYY')}
          </div>
          <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
            Về ngày: {dayjs(r.returnDate).format('DD/MM/YYYY')}
          </div>
        </div>
      ),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'isLeadGuide',
      key: 'isLeadGuide',
      width: 130,
      render: (isLead) =>
        isLead ? (
          <Tag color="gold" style={{ borderRadius: 999, fontWeight: 600 }}>
            ⭐ Trưởng đoàn
          </Tag>
        ) : (
          <Tag style={{ borderRadius: 999, background: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}>
            Phụ đoàn
          </Tag>
        ),
    },
    {
      title: 'Sĩ Số',
      dataIndex: 'totalGuests',
      key: 'totalGuests',
      width: 110,
      align: 'center',
      render: (count) => (
        <strong style={{ color: count > 0 ? '#0d6e6e' : '#94a3b8', fontSize: 15 }}>
          {count || 0} khách
        </strong>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      width: 125,
      render: (s) => (
        <Tag
          color={s === 'OPEN' ? 'green' : s === 'CLOSED' ? 'volcano' : 'default'}
          style={{ borderRadius: 999, fontWeight: 600 }}
        >
          {s === 'OPEN' ? 'Đang mở' : s === 'CLOSED' ? 'Đã khóa sổ' : 'Đã hủy'}
        </Tag>
      ),
    },
    {
      title: 'Thao Tác Hiện Trường',
      key: 'action',
      width: 245,
      render: (_, record) => (
        <Space size={8}>
          <Button
            type="primary"
            icon={<TeamOutlined />}
            size="small"
            style={{ height: 34, fontWeight: 600 }}
            onClick={() => handleOpenManifest(record)}
          >
            Điểm danh ({record.totalGuests || 0})
          </Button>
          <Button
            size="small"
            icon={<FileExcelOutlined />}
            style={{
              height: 34,
              color: '#15803d',
              borderColor: '#bbf7d0',
              background: '#f0fdf4',
              fontWeight: 600,
            }}
            onClick={() => handleExportManifest(record.departureId)}
          >
            Excel
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 1. BANNER CHÀO MỪNG HƯỚNG DẪN VIÊN */}
      <div
        style={{
          background: 'linear-gradient(125deg, #0b2545 0%, #0d6e6e 100%)',
          color: '#ffffff',
          padding: '30px 32px',
          borderRadius: 18,
          marginBottom: 24,
          boxShadow: '0 10px 28px rgba(11, 37, 69, 0.14)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.14)',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              color: '#ccfbf1',
              marginBottom: 10,
            }}
          >
            <CompassOutlined /> Lịch trình phân công trực tiếp
          </div>
          <h1 style={{ color: '#ffffff', fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>
            Xin chào, {savedUser.fullName || 'Hướng dẫn viên'}
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: 'rgba(255,255,255,0.86)' }}>
            Theo dõi lịch dẫn tour, điểm danh hành khách lên xe theo điểm đón và tải danh sách đoàn Excel nhanh chóng.
          </p>
        </div>
      </div>

      {/* 2. 3 THẺ THỐNG KÊ KPI NHANH (CONTRAST + REPETITION) */}
      <Row gutter={[18, 18]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <div className="th-section-card" style={{ padding: '18px 22px', borderLeft: '4px solid #0d6e6e' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              <CalendarOutlined style={{ color: '#0d6e6e', marginRight: 6 }} />
              TỔNG CHUYẾN ĐƯỢC PHÂN CÔNG
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{totalTours}</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="th-section-card" style={{ padding: '18px 22px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              <ClockCircleOutlined style={{ color: '#16a34a', marginRight: 6 }} />
              CHUYẾN ĐI SẮP KHỞI HÀNH
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{upcomingTours}</div>
          </div>
        </Col>
        <Col xs={24} sm={8}>
          <div className="th-section-card" style={{ padding: '18px 22px', borderLeft: '4px solid #e85d04' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
              <TeamOutlined style={{ color: '#e85d04', marginRight: 6 }} />
              TỔNG LƯỢT KHÁCH PHỤ TRÁCH
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#e85d04' }}>
              {totalGuestsServed} <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>khách</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* 3. BẢNG LỊCH PHÂN CÔNG + THANH LỌC NHANH */}
      <div className="th-section-card" style={{ padding: 22 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 2px', fontSize: 19 }}>
              <CalendarOutlined style={{ color: '#0d6e6e', marginRight: 8 }} />
              Lịch trình chuyến đi phụ trách
            </h2>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Bấm <strong>Điểm danh</strong> để xem chi tiết từng hành khách & lộ trình xe đón
            </span>
          </div>

          <Space wrap>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tìm mã tour, điểm đến..."
              allowClear
              value={departureKeyword}
              onChange={(e) => setDepartureKeyword(e.target.value)}
              style={{ width: 230 }}
            />
            <Segmented
              value={filterTab}
              onChange={setFilterTab}
              options={[
                { label: 'Tất cả', value: 'ALL' },
                { label: 'Sắp đi', value: 'UPCOMING' },
                { label: 'Đang mở', value: 'OPEN' },
                { label: 'Khóa sổ', value: 'CLOSED' },
              ]}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredDepartures}
          rowKey="departureId"
          loading={loading}
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có chuyến đi nào trong danh sách này."
              />
            ),
          }}
        />
      </div>

      {/* 4. DRAWER DANH SÁCH ĐOÀN & ĐIỂM DANH */}
      <Drawer
        title={
          <div>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: '#0f172a' }}>
              Danh sách đoàn: {selectedDeparture?.tourName}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 2 }}>
              Khởi hành: <strong style={{ color: '#0d6e6e' }}>{dayjs(selectedDeparture?.departureDate).format('DD/MM/YYYY')}</strong>
              {' '}• Sĩ số: <strong>{passengers.length} hành khách</strong>
            </div>
          </div>
        }
        width={880}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        destroyOnHidden
        extra={
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            style={{ backgroundColor: '#15803d', borderColor: '#15803d', fontWeight: 600 }}
            onClick={() => handleExportManifest(selectedDeparture?.departureId)}
          >
            Xuất Excel Đoàn
          </Button>
        }
      >
        {selectedDeparture && (
          <div>
            {/* THANH TIẾN ĐỘ ĐIỂM DANH */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                borderRadius: 12,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                  <CheckCircleOutlined style={{ color: '#0d6e6e', marginRight: 6 }} />
                  Tiến độ đón khách lên xe:{' '}
                  <strong style={{ color: '#0d6e6e' }}>
                    {checkedInCount} / {passengers.length}
                  </strong>{' '}
                  khách đã có mặt
                </span>
                <Space size={6}>
                  <Button size="small" onClick={handleCheckInAll} disabled={passengers.length === 0}>
                    Chọn tất cả
                  </Button>
                  <Button size="small" onClick={handleClearCheckIn} disabled={checkedInCount === 0}>
                    Bỏ chọn
                  </Button>
                </Space>
              </div>
              <Progress percent={checkInPercent} strokeColor="#0d6e6e" railColor="#e2e8f0" />
            </div>

            {/* TÌM NHANH HÀNH KHÁCH */}
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tìm nhanh theo tên hành khách, số điện thoại hoặc mã vé..."
              allowClear
              value={searchPassengerKeyword}
              onChange={(e) => setSearchPassengerKeyword(e.target.value)}
              style={{ marginBottom: 16 }}
              size="large"
            />

            {/* BẢNG ĐIỂM DANH */}
            <Table
              dataSource={filteredPassengers}
              rowKey="passengerId"
              loading={passengerLoading}
              pagination={false}
              size="middle"
              scroll={{ x: 700 }}
              columns={[
                {
                  title: 'Có mặt',
                  key: 'checkIn',
                  width: 82,
                  align: 'center',
                  render: (_, r) => (
                    <Checkbox
                      checked={checkedInIds.has(r.passengerId)}
                      onChange={() => handleToggleCheckIn(r.passengerId)}
                    />
                  ),
                },
                {
                  title: 'Hành khách',
                  key: 'passenger',
                  render: (_, r) => {
                    const isChecked = checkedInIds.has(r.passengerId);
                    return (
                      <div>
                        <strong
                          style={{
                            fontSize: 14.5,
                            textDecoration: isChecked ? 'line-through' : 'none',
                            color: isChecked ? '#94a3b8' : '#0f172a',
                          }}
                        >
                          {r.fullName}
                        </strong>
                        <div style={{ marginTop: 4 }}>
                          <Tag color={r.passengerType === 'ADULT' ? 'cyan' : 'orange'} style={{ borderRadius: 999 }}>
                            {r.passengerType === 'ADULT' ? 'Người lớn' : 'Trẻ em'}
                          </Tag>
                          <Tag style={{ borderRadius: 999 }}>{r.gender === 'MALE' ? 'Nam' : 'Nữ'}</Tag>
                          {r.requiresSingleRoom && (
                            <Tag color="purple" style={{ borderRadius: 999 }}>Phòng đơn</Tag>
                          )}
                        </div>
                        {r.idCardOrPassport && (
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                            <IdcardOutlined style={{ marginRight: 4 }} /> CCCD: {r.idCardOrPassport}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: 'Điểm đón & Giờ hẹn',
                  key: 'pickup',
                  render: (_, r) => (
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>
                        <EnvironmentOutlined style={{ color: '#0d6e6e', marginRight: 5 }} />
                        {r.pickupLocationName || 'Tập trung tại điểm hẹn chính'}
                      </div>
                      {r.pickupTime && (
                        <div style={{ fontSize: 12.5, color: '#e85d04', fontWeight: 700, marginTop: 2 }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} /> Đón lúc: {r.pickupTime}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Liên hệ & Mã vé',
                  key: 'contact',
                  render: (_, r) => (
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{r.contactName}</div>
                      <a
                        href={`tel:${r.contactPhone}`}
                        style={{ color: '#0d6e6e', fontWeight: 700, fontSize: 13.5 }}
                      >
                        <PhoneOutlined style={{ marginRight: 4 }} />
                        {r.contactPhone}
                      </a>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>Mã: {r.bookingCode}</div>
                    </div>
                  ),
                },
              ]}
            />

            {/* LỘ TRÌNH ĐIỂM ĐÓN */}
            <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                <EnvironmentOutlined style={{ color: '#0d6e6e', marginRight: 6 }} />
                Lộ trình dừng đón xe của chuyến đi
              </h4>
              {selectedDeparture.pickupPoints?.length > 0 ? (
                <Timeline
                  items={selectedDeparture.pickupPoints.map((pt) => ({
                    color: '#0d6e6e',
                    children: (
                      <span style={{ fontSize: 14 }}>
                        <strong style={{ color: '#0f172a' }}>{pt.locationName}</strong> —{' '}
                        <strong style={{ color: '#e85d04' }}>{pt.pickupTime}</strong>
                      </span>
                    ),
                  }))}
                />
              ) : (
                <p style={{ color: '#64748b', margin: 0 }}>Chưa có danh sách điểm dừng đón cụ thể.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default GuideDashboardPage;
