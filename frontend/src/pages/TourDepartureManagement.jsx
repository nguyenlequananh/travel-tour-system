import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Modal, Form, InputNumber, Select,
  DatePicker, message, Input, Card, Checkbox, Popconfirm, Divider, List, TimePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, CalendarOutlined, SearchOutlined,
  CheckOutlined, TeamOutlined, DeleteOutlined, UserOutlined, PhoneOutlined,
  EnvironmentOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import departureService from '../services/departureService';
import guideService from '../services/guideService';
import tourService from '../services/tourService';

const TourDepartureManagement = () => {
  const [selectedTour, setSelectedTour] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // STATE CHO MODAL CHỌN TOUR
  const [isSelectTourModalOpen, setIsSelectTourModalOpen] = useState(false);
  const [tourList, setTourList] = useState([]);
  const [tourLoading, setTourLoading] = useState(false);
  const [tourKeyword, setTourKeyword] = useState('');
  const [tourPagination, setTourPagination] = useState({ current: 1, pageSize: 5, total: 0 });

  // ================= STATE CHO MODAL PHÂN CÔNG HƯỚNG DẪN VIÊN =================
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [selectedDepartureForGuide, setSelectedDepartureForGuide] = useState(null);
  const [assignedGuides, setAssignedGuides] = useState([]);
  const [availableGuides, setAvailableGuides] = useState([]);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideForm] = Form.useForm();

  // ================= STATE CHO MODAL ĐIỂM ĐÓN XE (TOUR PICKUP POINTS) =================
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [selectedDepartureForPickup, setSelectedDepartureForPickup] = useState(null);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [editingPickupId, setEditingPickupId] = useState(null);
  const [pickupForm] = Form.useForm();

  // 1. Tải danh sách Tour cho Modal chọn
  const fetchTourListForModal = async (page = 0, size = 5, keyword = '') => {
    setTourLoading(true);
    try {
      const params = { page, size, sortBy: 'id', order: 'DESC' };
      if (keyword) params.keyword = keyword;

      const res = await tourService.getAdminTours(params);
      const pageData = res.data;

      setTourList(pageData.data || []);
      setTourPagination({
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      });

      if (!selectedTour && pageData.data?.length > 0) {
        setSelectedTour(pageData.data[0]);
      }
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách tour!');
    } finally {
      setTourLoading(false);
    }
  };

  const handleOpenSelectTourModal = () => {
    fetchTourListForModal(0, tourPagination.pageSize, tourKeyword);
    setIsSelectTourModalOpen(true);
  };

  // 2. Tải danh sách đợt khởi hành của Tour đang chọn
  const fetchDepartures = async (tourId) => {
    if (!tourId) return;
    setLoading(true);
    try {
      const res = await departureService.getDeparturesByTourId(tourId);
      setDepartures(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách đợt khởi hành');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initDefaultTour = async () => {
      try {
        const res = await tourService.getAdminTours({ page: 0, size: 1, sortBy: 'id', order: 'DESC' });
        if (res.data?.data?.length > 0) {
          setSelectedTour(res.data.data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    initDefaultTour();
  }, []);

  useEffect(() => {
    if (selectedTour?.id) {
      fetchDepartures(selectedTour.id);
    }
  }, [selectedTour]);

  // 3. Xử lý Thêm / Sửa Đợt khởi hành
  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        departureDate: dayjs(record.departureDate),
        returnDate: dayjs(record.returnDate),
        adultPrice: record.adultPrice,
        childPrice: record.childPrice,
        singleRoomSupplement: record.singleRoomSupplement,
        maxSeats: record.maxSeats,
        status: record.status,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        departureDate: values.departureDate.format('YYYY-MM-DD'),
        returnDate: values.returnDate.format('YYYY-MM-DD'),
      };

      if (editingId) {
        await departureService.updateDeparture(editingId, payload);
        message.success('Cập nhật đợt khởi hành thành công!');
      } else {
        await departureService.createDeparture({ ...payload, tourId: selectedTour.id });
        message.success('Mở bán đợt khởi hành mới thành công!');
      }
      setIsModalOpen(false);
      fetchDepartures(selectedTour.id);
    } catch (err) {
      message.error(err.message || 'Lỗi khi lưu đợt khởi hành');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = async (id, status) => {
    try {
      await departureService.changeStatus(id, status);
      message.success('Cập nhật trạng thái thành công!');
      fetchDepartures(selectedTour.id);
    } catch (err) {
      message.error(err.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // ================= LOGIC CHO MODAL PHÂN CÔNG HƯỚNG DẪN VIÊN =================
  const handleOpenGuideModal = async (departureRecord) => {
    setSelectedDepartureForGuide(departureRecord);
    setIsGuideModalOpen(true);
    guideForm.resetFields();
    setGuideLoading(true);

    try {
      const [resAssigned, resAvailable] = await Promise.all([
        guideService.getGuidesByDepartureId(departureRecord.id),
        guideService.getAvailableGuides(),
      ]);
      setAssignedGuides(resAssigned.data || []);
      setAvailableGuides(resAvailable.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải thông tin HDV!');
    } finally {
      setGuideLoading(false);
    }
  };

  const handleAssignGuideSubmit = async (values) => {
    try {
      await guideService.assignGuide({
        departureId: selectedDepartureForGuide.id,
        userId: values.userId,
        isLeadGuide: values.isLeadGuide || false,
      });
      message.success('Phân công hướng dẫn viên thành công!');
      guideForm.resetFields();

      const resAssigned = await guideService.getGuidesByDepartureId(selectedDepartureForGuide.id);
      setAssignedGuides(resAssigned.data || []);
      fetchDepartures(selectedTour.id);
    } catch (err) {
      message.error(err.message || 'Lỗi phân công!');
    }
  };

  const handleRemoveGuide = async (guideAssignmentId) => {
    try {
      await guideService.removeGuideAssignment(guideAssignmentId);
      message.success('Hủy phân công hướng dẫn viên thành công!');

      const resAssigned = await guideService.getGuidesByDepartureId(selectedDepartureForGuide.id);
      setAssignedGuides(resAssigned.data || []);
      fetchDepartures(selectedTour.id);
    } catch (err) {
      message.error(err.message || 'Lỗi hủy phân công');
    }
  };

  // ================= LOGIC QUẢN LÝ ĐIỂM ĐÓN XE =================
  const fetchPickupPoints = async (departureId) => {
    setPickupLoading(true);
    try {
      const res = await departureService.getAdminPickupPoints(departureId);
      setPickupPoints(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách điểm đón!');
    } finally {
      setPickupLoading(false);
    }
  };

  const handleOpenPickupModal = (record) => {
    setSelectedDepartureForPickup(record);
    setIsPickupModalOpen(true);
    setEditingPickupId(null);
    pickupForm.resetFields();
    fetchPickupPoints(record.id);
  };

  const handleSavePickupPoint = async (values) => {
    try {
      const payload = {
        departureId: selectedDepartureForPickup.id,
        locationName: values.locationName.trim(),
        pickupTime: values.pickupTime.format('HH:mm:ss'),
      };

      if (editingPickupId) {
        await departureService.updatePickupPoint(editingPickupId, payload);
        message.success('Cập nhật điểm đón thành công!');
      } else {
        await departureService.createPickupPoint(payload);
        message.success('Thêm điểm đón mới thành công!');
      }

      setEditingPickupId(null);
      pickupForm.resetFields();
      fetchPickupPoints(selectedDepartureForPickup.id);
    } catch (err) {
      message.error(err.message || 'Lỗi lưu điểm đón!');
    }
  };

  const handleEditPickupPoint = (record) => {
    setEditingPickupId(record.id);
    pickupForm.setFieldsValue({
      locationName: record.locationName,
      pickupTime: dayjs(`2000-01-01 ${record.pickupTime}`),
    });
  };

  const handleDeletePickupPoint = async (id) => {
    try {
      await departureService.deletePickupPoint(id);
      message.success('Đã xóa điểm đón!');
      fetchPickupPoints(selectedDepartureForPickup.id);
    } catch (err) {
      message.error(err.message || 'Lỗi xóa điểm đón!');
    }
  };

  // ================= CÁC CỘT CỦA BẢNG ĐỢT KHỞI HÀNH =================
  const columns = [
    {
      title: 'Thời gian đi',
      key: 'dates',
      render: (_, r) => (
        <div>
          <strong>{dayjs(r.departureDate).format('DD/MM/YYYY')}</strong> ➔ {dayjs(r.returnDate).format('DD/MM/YYYY')}
        </div>
      ),
    },
    {
      title: 'Giá vé người lớn',
      dataIndex: 'adultPrice',
      key: 'adultPrice',
      render: (p) => <strong style={{ color: '#d4380d' }}>{Number(p).toLocaleString('vi-VN')} đ</strong>,
    },
    {
      title: 'Giá vé trẻ em',
      dataIndex: 'childPrice',
      key: 'childPrice',
      render: (p) => `${Number(p).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Ghế trống / Tổng',
      key: 'seats',
      render: (_, r) => (
        <span>
          <b style={{ color: r.availableSeats > 0 ? '#52c41a' : '#f5222d' }}>{r.availableSeats}</b> / {r.maxSeats} chỗ
        </span>
      ),
    },
    {
      title: 'Hướng dẫn viên',
      key: 'guideInfo',
      render: (_, r) => (
        <div>
          {r.leadGuideName ? (
            <div>
              <Tag color="blue" icon={<UserOutlined />}>
                ⭐ {r.leadGuideName}
              </Tag>
              {r.leadGuidePhone && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  <PhoneOutlined /> {r.leadGuidePhone}
                </div>
              )}
            </div>
          ) : (
            <Tag color="orange">⚠️ Chưa có HDV</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, r) => (
        <Select value={r.status} style={{ width: 130 }} onChange={(val) => handleChangeStatus(r.id, val)}>
          <Select.Option value="OPEN">Mở bán</Select.Option>
          <Select.Option value="CLOSED">Khóa sổ</Select.Option>
          <Select.Option value="CANCELLED">Hủy chuyến</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>

          {/* NÚT PHÂN CÔNG HƯỚNG DẪN VIÊN */}
          <Button
            icon={<TeamOutlined />}
            size="small"
            style={{ color: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleOpenGuideModal(record)}
          >
            Phân công HDV
          </Button>

          {/* NÚT QUẢN LÝ ĐIỂM ĐÓN XE */}
          <Button
            icon={<EnvironmentOutlined />}
            size="small"
            style={{ color: '#1890ff', borderColor: '#1890ff' }}
            onClick={() => handleOpenPickupModal(record)}
          >
            Điểm đón xe
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined style={{ color: '#0d6e6e' }} /> Quản lý Lịch Khởi Hành
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)} disabled={!selectedTour}>
          Mở Bán Đợt Mới
        </Button>
      </div>

      {/* THANH HIỂN THỊ TOUR ĐANG CHỌN */}
      <div
        style={{
          marginBottom: 18,
          background: '#e6f4f1',
          border: '1px solid #99d5cc',
          padding: '14px 18px',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span style={{ color: '#475569', marginRight: 8, fontSize: 13.5 }}>Tour đang quản lý lịch:</span>
          {selectedTour ? (
            <strong style={{ fontSize: 15.5, color: '#0b2545' }}>
              [{selectedTour.tourCode}] {selectedTour.name} ({selectedTour.departureCity} ➔ {selectedTour.destinationCity})
            </strong>
          ) : (
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Chưa chọn tour nào</span>
          )}
        </div>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleOpenSelectTourModal}>
          Chọn / Đổi Tour Khác
        </Button>
      </div>

      <Table columns={columns} dataSource={departures} rowKey="id" loading={loading} scroll={{ x: 960 }} />

      {/* ================= 1. MODAL CHỌN TOUR ================= */}
      <Modal
        title="Chọn Tour Du Lịch"
        open={isSelectTourModalOpen}
        onCancel={() => setIsSelectTourModalOpen(false)}
        width={850}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsSelectTourModalOpen(false)}>
            Hoàn Tất Chọn
          </Button>
        ]}
      >
        <div style={{ marginBottom: 12 }}>
          <Input
            placeholder="Nhập mã tour hoặc tên tour cần tìm..."
            prefix={<SearchOutlined />}
            allowClear
            value={tourKeyword}
            onChange={(e) => {
              setTourKeyword(e.target.value);
              fetchTourListForModal(0, tourPagination.pageSize, e.target.value);
            }}
            size="large"
          />
        </div>

        <Table
          dataSource={tourList}
          rowKey="id"
          loading={tourLoading}
          pagination={tourPagination}
          onChange={(pagin) => fetchTourListForModal(pagin.current - 1, pagin.pageSize, tourKeyword)}
          size="small"
          columns={[
            { title: 'Mã Tour', dataIndex: 'tourCode', key: 'tourCode', render: (c) => <Tag color="blue">{c}</Tag> },
            { title: 'Tên Tour', dataIndex: 'name', key: 'name', render: (t) => <strong>{t}</strong> },
            { title: 'Lộ trình', key: 'route', render: (_, r) => `${r.departureCity} ➔ ${r.destinationCity}` },
            {
              title: 'Hành động',
              key: 'action',
              render: (_, record) => {
                const isCurrent = selectedTour?.id === record.id;
                return (
                  <Button
                    type={isCurrent ? 'default' : 'primary'}
                    icon={isCurrent ? <CheckOutlined style={{ color: '#52c41a' }} /> : null}
                    size="small"
                    onClick={() => {
                      setSelectedTour(record);
                      setIsSelectTourModalOpen(false);
                    }}
                  >
                    {isCurrent ? 'Đang chọn' : 'Chọn Tour này'}
                  </Button>
                );
              },
            },
          ]}
        />
      </Modal>

      {/* ================= 2. MODAL THÊM / SỬA ĐỢT KHỞI HÀNH ================= */}
      <Modal
        title={editingId ? 'Sửa Đợt Khởi Hành' : 'Mở Bán Đợt Khởi Hành Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="departureDate" label="Ngày đi" rules={[{ required: true, message: 'Chọn ngày đi!' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="returnDate" label="Ngày về" rules={[{ required: true, message: 'Chọn ngày về!' }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="adultPrice" label="Giá người lớn (VNĐ)" rules={[{ required: true, message: 'Nhập giá vé người lớn!' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="childPrice" label="Giá trẻ em (VNĐ)" rules={[{ required: true, message: 'Nhập giá vé trẻ em!' }]}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="maxSeats" label="Tổng số chỗ mở bán" rules={[{ required: true, message: 'Nhập số chỗ mở bán!' }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="singleRoomSupplement" label="Phụ thu phòng đơn (VNĐ)">
              <InputNumber min={0} style={{ width: '100%' }} defaultValue={0} />
            </Form.Item>
          </div>

          {editingId && (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="OPEN">Mở bán (OPEN)</Select.Option>
                <Select.Option value="CLOSED">Khóa sổ (CLOSED)</Select.Option>
                <Select.Option value="CANCELLED">Hủy chuyến (CANCELLED)</Select.Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* ================= 3. MODAL PHÂN CÔNG HƯỚNG DẪN VIÊN ================= */}
      <Modal
        title={
          <div>
            <TeamOutlined style={{ color: '#1677ff', marginRight: 8 }} />
            Phân công Hướng dẫn viên cho chuyến đi
          </div>
        }
        open={isGuideModalOpen}
        onCancel={() => setIsGuideModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsGuideModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={650}
        destroyOnClose
      >
        {selectedDepartureForGuide && (
          <div>
            {/* THÔNG TIN CHUYẾN ĐI */}
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <div>Tour: <b>{selectedTour?.name}</b></div>
              <div>
                Thời gian: <b>{dayjs(selectedDepartureForGuide.departureDate).format('DD/MM/YYYY')}</b> ➔ <b>{dayjs(selectedDepartureForGuide.returnDate).format('DD/MM/YYYY')}</b>
              </div>
            </div>

            {/* DANH SÁCH HDV HIỆN TẠI */}
            <h4 style={{ marginBottom: 8, color: '#1677ff' }}>Danh sách Hướng dẫn viên phụ trách:</h4>
            <List
              loading={guideLoading}
              dataSource={assignedGuides}
              locale={{ emptyText: 'Chưa có hướng dẫn viên nào được phân công cho chuyến này.' }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      key="delete"
                      title="Hủy phân công hướng dẫn viên này?"
                      onConfirm={() => handleRemoveGuide(item.id)}
                      okText="Hủy phân công"
                      cancelText="Không"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<UserOutlined style={{ fontSize: 20, color: item.isLeadGuide ? '#faad14' : '#1677ff' }} />}
                    title={
                      <Space>
                        <b>{item.guideName}</b>
                        {item.isLeadGuide ? (
                          <Tag color="gold">⭐ Trưởng đoàn</Tag>
                        ) : (
                          <Tag color="blue">Phụ đoàn</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <span style={{ fontSize: 13, color: '#666' }}>
                        <PhoneOutlined /> {item.guidePhone || 'Chưa có SĐT'} | Email: {item.guideEmail}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider style={{ margin: '16px 0' }} />

            {/* FORM GÁN THÊM HDV */}
            <h4 style={{ marginBottom: 12, color: '#1677ff' }}>Thêm Hướng dẫn viên vào chuyến đi:</h4>
            <Form form={guideForm} layout="vertical" onFinish={handleAssignGuideSubmit}>
              <Form.Item
                name="userId"
                label="Chọn nhân viên Hướng dẫn viên"
                rules={[{ required: true, message: 'Vui lòng chọn hướng dẫn viên!' }]}
              >
                <Select
                  placeholder="-- Chọn nhân viên (ROLE_GUIDE) --"
                  showSearch
                  optionFilterProp="children"
                >
                  {availableGuides.map((guide) => (
                    <Select.Option key={guide.id} value={guide.id}>
                      👤 {guide.fullName} ({guide.phoneNumber || guide.email})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="isLeadGuide" valuePropName="checked" initialValue={assignedGuides.length === 0}>
                <Checkbox>Đặt làm Trưởng đoàn (Lead Guide)</Checkbox>
              </Form.Item>

              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                  Lưu Phân Công
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* ================= 4. MODAL QUẢN LÝ ĐIỂM ĐÓN XE (TOUR PICKUP POINTS) ================= */}
      <Modal
        title={
          <div>
            <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Quản lý Điểm đón xe cho chuyến đi
          </div>
        }
        open={isPickupModalOpen}
        onCancel={() => setIsPickupModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPickupModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={700}
        destroyOnClose
      >
        {selectedDepartureForPickup && (
          <div>
            {/* THÔNG TIN CHUYẾN ĐI */}
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <div>Tour: <b>{selectedTour?.name}</b></div>
              <div>
                Khởi hành: <b>{dayjs(selectedDepartureForPickup.departureDate).format('DD/MM/YYYY')}</b>
                {' ➔ '}Về: <b>{dayjs(selectedDepartureForPickup.returnDate).format('DD/MM/YYYY')}</b>
              </div>
            </div>

            {/* FORM THÊM / SỬA ĐIỂM ĐÓN */}
            <Card size="small" style={{ background: '#fafafa', marginBottom: 16 }}>
              <Form form={pickupForm} layout="vertical" onFinish={handleSavePickupPoint}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <Form.Item
                    name="locationName"
                    label="Địa điểm đón khách"
                    rules={[{ required: true, message: 'Vui lòng nhập tên điểm đón!' }]}
                  >
                    <Input placeholder="VD: Nhà hát lớn Hà Nội / Cổng 1 Sân bay TSN" />
                  </Form.Item>
                  <Form.Item
                    name="pickupTime"
                    label="Giờ đón"
                    rules={[{ required: true, message: 'Vui lòng chọn giờ đón!' }]}
                  >
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Space>
                    {editingPickupId && (
                      <Button onClick={() => { setEditingPickupId(null); pickupForm.resetFields(); }}>
                        Hủy sửa
                      </Button>
                    )}
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                      {editingPickupId ? 'Cập nhật điểm đón' : 'Thêm điểm đón mới'}
                    </Button>
                  </Space>
                </div>
              </Form>
            </Card>

            {/* DANH SÁCH ĐIỂM ĐÓN HIỆN CÓ */}
            <h4 style={{ marginBottom: 8, color: '#1890ff' }}>
              Danh sách các điểm đón đã thiết lập ({pickupPoints.length}):
            </h4>
            <Table
              dataSource={pickupPoints}
              rowKey="id"
              loading={pickupLoading}
              size="small"
              pagination={false}
              locale={{ emptyText: 'Chưa có điểm đón nào. Hãy thêm điểm đón ở trên.' }}
              columns={[
                {
                  title: 'Giờ đón',
                  dataIndex: 'pickupTime',
                  key: 'pickupTime',
                  width: 120,
                  render: (t) => (
                    <Tag color="blue" icon={<ClockCircleOutlined />}>
                      {t ? t.substring(0, 5) : '—'}
                    </Tag>
                  ),
                },
                {
                  title: 'Địa điểm đón',
                  dataIndex: 'locationName',
                  key: 'locationName',
                  render: (text) => <strong>{text}</strong>,
                },
                {
                  title: 'Thao tác',
                  key: 'action',
                  width: 140,
                  render: (_, r) => (
                    <Space size="small">
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditPickupPoint(r)}
                      >
                        Sửa
                      </Button>
                      <Popconfirm
                        title="Xóa điểm đón này?"
                        onConfirm={() => handleDeletePickupPoint(r.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                      >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                          Xóa
                        </Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default TourDepartureManagement;
