import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Row, Col,
  Statistic, Drawer, Checkbox, Progress, Input, message, Timeline, Space
} from 'antd';
import {
  TeamOutlined, CalendarOutlined, CompassOutlined, PhoneOutlined,
  EnvironmentOutlined, ClockCircleOutlined, IdcardOutlined, FileExcelOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import guideService from '../../services/guideService';
import exportService from '../../services/exportService';

const { Title } = Typography;

const GuideDashboardPage = () => {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho Drawer xem đoàn khách & điểm danh
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [passengerLoading, setPassengerLoading] = useState(false);
  const [searchPassengerKeyword, setSearchPassengerKeyword] = useState('');

  // State lưu trữ trạng thái điểm danh (Check-in) tạm thời trên giao diện
  const [checkedInIds, setCheckedInIds] = useState(new Set());

  // Lấy thông tin HDV đang đăng nhập
  const savedUser = JSON.parse(localStorage.getItem('travel_user') || '{}');

  // 1. Tải danh sách chuyến đi của chính HDV này
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

    // Tự động tải lại lịch dẫn và sĩ số đoàn khi nhận WebSocket thông báo
    const handleAutoReload = () => {
      fetchMyDepartures();
    };
    window.addEventListener('booking-status-updated', handleAutoReload);
    return () => {
      window.removeEventListener('booking-status-updated', handleAutoReload);
    };
  }, []);

  // 2. Mở Drawer xem danh sách đoàn khách & điểm danh
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

  // 2.1 Xuất Excel danh sách đoàn khách
  const handleExportManifest = async (departureId) => {
    try {
      await exportService.exportGuideManifest(departureId, savedUser.id);
      message.success('Đã tải file Excel danh sách đoàn thành công!');
    } catch (err) {
      message.error(err.message || 'Lỗi khi xuất file Excel danh sách đoàn!');
    }
  };

  // 3. Xử lý khi HDV tick chọn Điểm danh khách lên xe
  const handleToggleCheckIn = (passengerId) => {
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      if (next.has(passengerId)) {
        next.delete(passengerId);
      } else {
        next.add(passengerId);
      }
      return next;
    });
  };

  // Lọc hành khách theo từ khóa tìm kiếm (Tên, SĐT, Mã đơn)
  const filteredPassengers = passengers.filter((p) => {
    if (!searchPassengerKeyword) return true;
    const kw = searchPassengerKeyword.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(kw) ||
      p.contactPhone?.toLowerCase().includes(kw) ||
      p.bookingCode?.toLowerCase().includes(kw)
    );
  });

  // Tính toán thống kê nhanh
  const totalTours = departures.length;
  const upcomingTours = departures.filter((d) => dayjs(d.departureDate).isAfter(dayjs())).length;
  const totalGuestsServed = departures.reduce((sum, d) => sum + (d.totalGuests || 0), 0);

  // Tiến độ điểm danh
  const checkedInCount = passengers.filter((p) => checkedInIds.has(p.passengerId)).length;
  const checkInPercent = passengers.length > 0 ? Math.round((checkedInCount / passengers.length) * 100) : 0;

  const columns = [
    {
      title: 'Mã Tour & Tên Chuyến Đi',
      key: 'tourInfo',
      render: (_, r) => (
        <div>
          <Tag color="geekblue">{r.tourCode}</Tag>
          <strong>{r.tourName}</strong>
          <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
            <EnvironmentOutlined style={{ color: '#ff4d4f' }} /> {r.departureCity} ➔ {r.destinationCity}
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian khởi hành',
      key: 'dates',
      render: (_, r) => (
        <div>
          <Tag color="cyan">
            <CalendarOutlined /> {dayjs(r.departureDate).format('DD/MM/YYYY')}
          </Tag>
          <span style={{ fontSize: 12, color: '#888' }}>
            đến {dayjs(r.returnDate).format('DD/MM/YYYY')}
          </span>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'isLeadGuide',
      key: 'isLeadGuide',
      render: (isLead) => (
        isLead ? <Tag color="gold">⭐ Trưởng đoàn</Tag> : <Tag color="blue">Phụ đoàn</Tag>
      ),
    },
    {
      title: 'Số khách',
      dataIndex: 'totalGuests',
      key: 'totalGuests',
      render: (count) => (
        <b style={{ color: count > 0 ? '#1677ff' : '#888', fontSize: 15 }}>
          {count} khách
        </b>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'OPEN' ? 'green' : s === 'CLOSED' ? 'volcano' : 'default'}>
          {s === 'OPEN' ? 'Đang mở' : s === 'CLOSED' ? 'Đã khóa sổ' : 'Đã hủy'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<TeamOutlined />}
            size="small"
            onClick={() => handleOpenManifest(record)}
          >
            Điểm danh ({record.totalGuests || 0})
          </Button>
          <Button
            size="small"
            icon={<FileExcelOutlined />}
            style={{ backgroundColor: '#52c41a', color: '#fff', borderColor: '#52c41a' }}
            onClick={() => handleExportManifest(record.departureId)}
          >
            Xuất Excel
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 20px' }}>
      {/* 1. BANNER CHÀO MỪNG HƯỚNG DẪN VIÊN */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
          color: '#fff',
          padding: '30px',
          borderRadius: 12,
          marginBottom: 25,
          boxShadow: '0 4px 15px rgba(22, 119, 255, 0.2)',
        }}
      >
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          <CompassOutlined style={{ marginRight: 10 }} /> Cổng Thông Tin Hướng Dẫn Viên (Guide Portal)
        </Title>
        <p style={{ marginTop: 8, fontSize: 15, opacity: 0.9 }}>
          Xin chào hướng dẫn viên: <b>{savedUser.fullName || 'HDV'}</b>. Chúc bạn có những chuyến hành trình an toàn và tràn đầy niềm vui!
        </p>
      </div>

      {/* 2. CÁC THẺ THỐNG KÊ NHANH */}
      <Row gutter={[16, 16]} style={{ marginBottom: 25 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#e6f4ff', borderRadius: 8 }}>
            <Statistic
              title="Tổng số tour được phân công"
              value={totalTours}
              prefix={<CalendarOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#f6ffed', borderRadius: 8 }}>
            <Statistic
              title="Chuyến đi sắp tới"
              value={upcomingTours}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ background: '#fff7e6', borderRadius: 8 }}>
            <Statistic
              title="Tổng lượt khách phụ trách"
              value={totalGuestsServed}
              suffix="khách"
              prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 3. BẢNG DANH SÁCH CHUYẾN ĐI ĐƯỢC PHÂN CÔNG */}
      <Card title={<><CalendarOutlined style={{ marginRight: 8 }} /> Lịch trình các chuyến đi phụ trách</>}>
        <Table
          columns={columns}
          dataSource={departures}
          rowKey="departureId"
          loading={loading}
          locale={{ emptyText: 'Bạn hiện chưa được phân công dẫn chuyến đi nào.' }}
        />
      </Card>

      {/* ================= 4. DRAWER DANH SÁCH ĐOÀN KHÁCH & ĐIỂM DANH ================= */}
      <Drawer
        title={
          <div>
            <div style={{ fontSize: 16 }}>
              📋 Danh sách đoàn: <b>{selectedDeparture?.tourName}</b>
            </div>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 'normal' }}>
              Khởi hành: <b>{dayjs(selectedDeparture?.departureDate).format('DD/MM/YYYY')}</b>
            </div>
          </div>
        }
        width={850}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        destroyOnClose
        extra={
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', fontWeight: 600 }}
            onClick={() => handleExportManifest(selectedDeparture?.departureId)}
          >
            Xuất Excel Danh Sách Đoàn
          </Button>
        }
      >
        {selectedDeparture && (
          <div>
            {/* TIẾN ĐỘ ĐIỂM DANH QUÂN SỐ */}
            <div style={{ background: '#fafafa', padding: 15, borderRadius: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Tiến độ đón khách lên xe:</span>
                <b>
                  {checkedInCount} / {passengers.length} khách đã có mặt
                </b>
              </div>
              <Progress percent={checkInPercent} strokeColor="#52c41a" status="active" />
            </div>

            {/* Ô TÌM KIẾM HÀNH KHÁCH */}
            <Input
              placeholder="🔍 Tìm nhanh theo tên khách, số điện thoại hoặc mã vé..."
              allowClear
              value={searchPassengerKeyword}
              onChange={(e) => setSearchPassengerKeyword(e.target.value)}
              style={{ marginBottom: 16 }}
              size="large"
            />

            {/* BẢNG ĐIỂM DANH HÀNH KHÁCH */}
            <Table
              dataSource={filteredPassengers}
              rowKey="passengerId"
              loading={passengerLoading}
              pagination={false}
              size="middle"
              columns={[
                {
                  title: 'Điểm danh',
                  key: 'checkIn',
                  width: 90,
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
                        <strong style={{ fontSize: 14, textDecoration: isChecked ? 'line-through' : 'none', color: isChecked ? '#888' : '#333' }}>
                          {r.fullName}
                        </strong>
                        <div>
                          <Tag color={r.passengerType === 'ADULT' ? 'blue' : 'orange'}>
                            {r.passengerType === 'ADULT' ? 'Người lớn' : 'Trẻ em'}
                          </Tag>
                          <Tag>{r.gender === 'MALE' ? 'Nam' : 'Nữ'}</Tag>
                          {r.requiresSingleRoom && <Tag color="purple">Phòng đơn</Tag>}
                        </div>
                        {r.idCardOrPassport && (
                          <div style={{ fontSize: 11, color: '#888' }}>
                            <IdcardOutlined /> CCCD: {r.idCardOrPassport}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: 'Điểm đón & Giờ xe đón',
                  key: 'pickup',
                  render: (_, r) => (
                    <div>
                      <div style={{ color: '#0958d9', fontWeight: 500 }}>
                        📍 {r.pickupLocationName}
                      </div>
                      {r.pickupTime && (
                        <div style={{ fontSize: 12, color: '#d4380d' }}>
                          <ClockCircleOutlined /> Đón lúc: <b>{r.pickupTime}</b>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Người đặt & SĐT liên hệ',
                  key: 'contact',
                  render: (_, r) => (
                    <div>
                      <div style={{ fontSize: 13 }}>{r.contactName}</div>
                      <a href={`tel:${r.contactPhone}`} style={{ fontWeight: 'bold' }}>
                        <PhoneOutlined /> {r.contactPhone}
                      </a>
                      <div style={{ fontSize: 11, color: '#aaa' }}>Mã: {r.bookingCode}</div>
                    </div>
                  ),
                },
              ]}
            />

            <div style={{ margin: '25px 0 15px', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <h4>
                <EnvironmentOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                Lộ trình dừng đón xe của chuyến đi:
              </h4>
              {selectedDeparture.pickupPoints?.length > 0 ? (
                <Timeline
                  style={{ marginTop: 15 }}
                  items={selectedDeparture.pickupPoints.map((pt) => ({
                    color: 'blue',
                    children: (
                      <span>
                        <b>{pt.locationName}</b> — <span style={{ color: '#d4380d' }}>{pt.pickupTime}</span>
                      </span>
                    )
                  }))}
                />
              ) : (
                <p style={{ color: '#888' }}>Chưa có danh sách điểm dừng cụ thể.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default GuideDashboardPage;
