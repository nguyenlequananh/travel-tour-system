import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, message, Tag, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ScheduleOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import itineraryService from '../services/itineraryService';
import tourService from '../services/tourService';

const TourItineraryManagement = () => {
  const [selectedTour, setSelectedTour] = useState(null);
  const [itineraries, setItineraries] = useState([]);
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

  // 2. Tải danh sách lịch trình của Tour đang chọn
  const fetchItineraries = async (tourId) => {
    if (!tourId) return;
    setLoading(true);
    try {
      const res = await itineraryService.getItinerariesByTourId(tourId);
      setItineraries(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi tải lịch trình tour');
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
      fetchItineraries(selectedTour.id);
    }
  }, [selectedTour]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    if (!selectedTour?.id) {
      message.warning('Vui lòng chọn Tour trước!');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...values, tourId: selectedTour.id };

      if (editingId) {
        await itineraryService.updateItinerary(editingId, payload);
        message.success('Cập nhật lịch trình thành công!');
      } else {
        await itineraryService.createItinerary(payload);
        message.success('Thêm ngày lịch trình thành công!');
      }
      setIsModalOpen(false);
      fetchItineraries(selectedTour.id);
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi lưu lịch trình');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await itineraryService.deleteItinerary(id);
      message.success('Xóa lịch trình ngày thành công!');
      fetchItineraries(selectedTour.id);
    } catch (err) {
      message.error(err.message || 'Lỗi khi xóa lịch trình');
    }
  };

  const columns = [
    {
      title: 'Ngày thứ',
      dataIndex: 'dayNumber',
      key: 'dayNumber',
      width: 100,
      render: (d) => <Tag color="blue" style={{ fontWeight: 'bold' }}>Ngày {d}</Tag>
    },
    {
      title: 'Tiêu đề hoạt động',
      dataIndex: 'title',
      key: 'title',
      render: (t, r) => (
        <div>
          <strong style={{ fontSize: 14 }}>{t}</strong>
          {r.details && <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{r.details}</div>}
        </div>
      )
    },
    {
      title: 'Bữa ăn',
      dataIndex: 'meals',
      key: 'meals',
      render: (m) => m ? <Tag color="orange">{m}</Tag> : '---'
    },
    {
      title: 'Khách sạn/Lưu trú',
      dataIndex: 'accommodation',
      key: 'accommodation',
      render: (acc) => acc ? <Tag color="cyan">{acc}</Tag> : '---'
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa ngày này?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScheduleOutlined style={{ color: '#1677ff' }} /> Quản lý Lịch Trình Chi Tiết
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)} disabled={!selectedTour}>
          Thêm Ngày Lịch Trình
        </Button>
      </div>

      {/* THANH HIỂN THỊ TOUR ĐANG CHỌN & NÚT [ĐỔI TOUR] */}
      <div style={{
        marginBottom: 16,
        background: '#e6f4ff',
        border: '1px solid #91caff',
        padding: '12px 16px',
        borderRadius: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ color: '#555', marginRight: 8 }}>Tour đang thiết kế lịch trình:</span>
          {selectedTour ? (
            <strong style={{ fontSize: 16, color: '#0958d9' }}>
              [{selectedTour.tourCode}] {selectedTour.name} ({selectedTour.durationDays} Ngày {selectedTour.durationNights} Đêm)
            </strong>
          ) : (
            <span style={{ color: '#ff4d4f' }}>Chưa chọn tour nào</span>
          )}
        </div>
        <Button type="primary" onClick={handleOpenSelectTourModal}>
          🔍 Chọn / Đổi Tour Khác
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={itineraries}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* ================= MODAL CHỌN TOUR ================= */}
      <Modal
        title="Chọn Tour Để Quản Lý Lịch Trình"
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
            { title: 'Thời lượng', key: 'duration', render: (_, r) => `${r.durationDays}N${r.durationNights}Đ` },
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

      {/* Modal Thêm/Sửa Lịch trình */}
      <Modal
        title={editingId ? 'Sửa Lịch Trình Ngày' : 'Thêm Ngày Lịch Trình Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="dayNumber" label="Ngày thứ mấy" rules={[{ required: true, message: 'Vui lòng nhập số thứ tự ngày!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 1, 2, 3..." />
          </Form.Item>
          <Form.Item name="title" label="Tiêu đề ngày" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề ngày!' }]}>
            <Input placeholder="VD: TP.HCM - Phú Quốc - Tham quan Grand World" />
          </Form.Item>
          <Form.Item name="details" label="Chi tiết lịch trình hoạt động" rules={[{ required: true, message: 'Vui lòng nhập chi tiết hoạt động!' }]}>
            <Input.TextArea rows={4} placeholder="Sáng: đón khách tại sân bay, trưa nhận phòng..." />
          </Form.Item>
          <Form.Item name="meals" label="Bữa ăn trong ngày">
            <Input placeholder="VD: Sáng / Trưa / Tối" />
          </Form.Item>
          <Form.Item name="accommodation" label="Khách sạn / Lưu trú">
            <Input placeholder="VD: Khách sạn Vinpearl 5 sao" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>Lưu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TourItineraryManagement;
