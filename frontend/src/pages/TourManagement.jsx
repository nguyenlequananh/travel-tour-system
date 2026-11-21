import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Modal, Form, Input, InputNumber,
  Select, Popconfirm, message, Image, List, Card, Row, Col
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, CompassOutlined,
  FileImageOutlined, FileProtectOutlined, CheckCircleOutlined,
  CloseCircleOutlined, InfoCircleOutlined, SearchOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import tourService from '../services/tourService';
import categoryService from '../services/categoryService';

const TourManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. ĐỌC THAM SỐ TỪ URL (Single Source of Truth)
  const keywordFromUrl = searchParams.get('keyword') || '';
  const categoryFromUrl = searchParams.get('categoryId') || undefined;
  const tourTypeFromUrl = searchParams.get('tourType') || undefined;
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // State điều khiển Form tìm kiếm
  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl ? Number(categoryFromUrl) : undefined);
  const [selectedTourType, setSelectedTourType] = useState(tourTypeFromUrl);

  const [pagination, setPagination] = useState({ current: currentPage, pageSize: 10, total: 0 });

  // Tự động đồng bộ ngược lại các ô input khi URL thay đổi (Back / Forward / F5)
  useEffect(() => {
    setKeyword(keywordFromUrl);
    setSelectedCategory(categoryFromUrl ? Number(categoryFromUrl) : undefined);
    setSelectedTourType(tourTypeFromUrl);
  }, [keywordFromUrl, categoryFromUrl, tourTypeFromUrl]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // ================= STATE CHO ALBUM ẢNH (TOUR IMAGE) =================
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedTourForImage, setSelectedTourForImage] = useState(null);
  const [tourImages, setTourImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageForm] = Form.useForm();

  // ================= STATE CHO CHÍNH SÁCH TOUR (TOUR POLICY) =================
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedTourForPolicy, setSelectedTourForPolicy] = useState(null);
  const [tourPolicies, setTourPolicies] = useState([]);
  const [policyLoading, setPolicyLoading] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [policyForm] = Form.useForm();

  // 1. Tải danh sách Tour có Phân trang & Lọc từ Server DỰA TRÊN URL
  const fetchTours = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: pagination.pageSize,
        sortBy: 'id',
        order: 'DESC'
      };
      if (keywordFromUrl && keywordFromUrl.trim()) {
        params.keyword = keywordFromUrl.trim();
      }
      if (categoryFromUrl) {
        params.categoryId = categoryFromUrl;
      }
      if (tourTypeFromUrl) {
        params.tourType = tourTypeFromUrl;
      }

      const res = await tourService.getAdminTours(params);
      const pageData = res.data;

      setTours(pageData.data || []);
      setPagination((prev) => ({
        ...prev,
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      }));
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách tour!');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Tự động tải lại khi URL thay đổi
  useEffect(() => {
    fetchTours();
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Bấm nút "Tìm kiếm": Đẩy toàn bộ tiêu chí lên URL
  const handleSearch = () => {
    const nextParams = new URLSearchParams();
    if (keyword?.trim()) nextParams.set('keyword', keyword.trim());
    if (selectedCategory) nextParams.set('categoryId', selectedCategory.toString());
    if (selectedTourType) nextParams.set('tourType', selectedTourType);
    setSearchParams(nextParams);
  };

  // Bấm nút "Làm mới": Xóa sạch tiêu chí và reset URL
  const handleReset = () => {
    setKeyword('');
    setSelectedCategory(undefined);
    setSelectedTourType(undefined);
    setSearchParams({});
  };

  // Chuyển trang: Cập nhật param page trên URL
  const handleTableChange = (pagin) => {
    const nextParams = new URLSearchParams(searchParams);
    if (pagin.current > 1) {
      nextParams.set('page', pagin.current.toString());
    } else {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  // 2. Xử lý Thêm / Sửa Tour cơ bản
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
    setSubmitting(true);
    try {
      if (editingId) {
        await tourService.updateTour(editingId, values);
        message.success('Cập nhật tour thành công!');
      } else {
        await tourService.createTour(values);
        message.success('Tạo tour mới thành công!');
      }
      setIsModalOpen(false);
      fetchTours(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi lưu tour!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await tourService.deleteTour(id);
      message.success('Ẩn tour thành công!');
      fetchTours(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Lỗi khi ẩn tour!');
    }
  };

  // ================= 3. QUẢN LÝ ALBUM ẢNH (TOUR IMAGE) =================
  const handleOpenImageModal = async (tourRecord) => {
    setSelectedTourForImage(tourRecord);
    setIsImageModalOpen(true);
    imageForm.resetFields();
    setImageLoading(true);
    try {
      const res = await tourService.getTourImages(tourRecord.id);
      setTourImages(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi tải album ảnh!');
    } finally {
      setImageLoading(false);
    }
  };

  const handleAddImage = async (values) => {
    try {
      await tourService.createTourImage({
        tourId: selectedTourForImage.id,
        imageUrl: values.imageUrl.trim(),
      });
      message.success('Thêm ảnh vào album thành công!');
      imageForm.resetFields();

      const res = await tourService.getTourImages(selectedTourForImage.id);
      setTourImages(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi thêm ảnh!');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await tourService.deleteTourImage(imageId);
      message.success('Đã xóa ảnh!');
      setTourImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      message.error(err.message || 'Lỗi xóa ảnh!');
    }
  };

  // ================= 4. QUẢN LÝ CHÍNH SÁCH TOUR (TOUR POLICY) =================
  const handleOpenPolicyModal = async (tourRecord) => {
    setSelectedTourForPolicy(tourRecord);
    setIsPolicyModalOpen(true);
    setEditingPolicyId(null);
    policyForm.resetFields();
    setPolicyLoading(true);
    try {
      const res = await tourService.getTourPolicies(tourRecord.id);
      setTourPolicies(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi tải chính sách tour!');
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleSavePolicy = async (values) => {
    try {
      if (editingPolicyId) {
        await tourService.updateTourPolicy(editingPolicyId, {
          tourId: selectedTourForPolicy.id,
          policyType: values.policyType,
          content: values.content.trim(),
        });
        message.success('Cập nhật chính sách thành công!');
      } else {
        await tourService.createTourPolicy({
          tourId: selectedTourForPolicy.id,
          policyType: values.policyType,
          content: values.content.trim(),
        });
        message.success('Thêm chính sách mới thành công!');
      }

      setEditingPolicyId(null);
      policyForm.resetFields();

      const res = await tourService.getTourPolicies(selectedTourForPolicy.id);
      setTourPolicies(res.data || []);
    } catch (err) {
      message.error(err.message || 'Lỗi lưu chính sách!');
    }
  };

  const handleDeletePolicy = async (policyId) => {
    try {
      await tourService.deleteTourPolicy(policyId);
      message.success('Đã xóa chính sách!');
      setTourPolicies((prev) => prev.filter((p) => p.id !== policyId));
    } catch (err) {
      message.error(err.message || 'Lỗi xóa chính sách!');
    }
  };

  const handleEditPolicy = (record) => {
    setEditingPolicyId(record.id);
    policyForm.setFieldsValue({
      policyType: record.policyType,
      content: record.content,
    });
  };

  // ================= CỘT BẢNG QUẢN LÝ TOUR =================
  const columns = [
    {
      title: 'Mã Tour',
      dataIndex: 'tourCode',
      key: 'tourCode',
      width: 110,
      render: (c) => <Tag color="geekblue" style={{ fontWeight: 'bold' }}>{c}</Tag>
    },
    {
      title: 'Tên Tour',
      dataIndex: 'name',
      key: 'name',
      render: (t, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {r.featuredImage && (
            <Image
              src={r.featuredImage}
              width={50}
              height={36}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="https://via.placeholder.com/50x36?text=Tour"
            />
          )}
          <strong>{t}</strong>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 130,
      render: (c) => <Tag color="cyan">{c}</Tag>
    },
    {
      title: 'Lộ trình',
      key: 'route',
      width: 170,
      render: (_, r) => <span>{r.departureCity} ➔ {r.destinationCity}</span>
    },
    {
      title: 'Thời gian',
      key: 'duration',
      width: 110,
      render: (_, r) => <Tag color="purple">{r.durationDays}N{r.durationNights}Đ</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (s) => <Tag color={s === 'ACTIVE' ? 'green' : 'volcano'}>{s === 'ACTIVE' ? 'Hoạt động' : 'Tạm ẩn'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" type="primary" ghost onClick={() => handleOpenModal(record)}>
            Sửa
          </Button>

          {/* NÚT QUẢN LÝ ALBUM ẢNH */}
          <Button
            icon={<FileImageOutlined />}
            size="small"
            style={{ color: '#13c2c2', borderColor: '#13c2c2' }}
            onClick={() => handleOpenImageModal(record)}
          >
            Ảnh
          </Button>

          {/* NÚT QUẢN LÝ CHÍNH SÁCH */}
          <Button
            icon={<FileProtectOutlined />}
            size="small"
            style={{ color: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => handleOpenPolicyModal(record)}
          >
            Chính sách
          </Button>

          <Popconfirm title="Ẩn tour này?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>
              Ẩn
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CompassOutlined style={{ color: '#0d6e6e' }} /> Quản lý Tour Du Lịch
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
          Thêm Tour Mới
        </Button>
      </div>

      {/* THANH TÌM KIẾM VÀ BỘ LỌC TOUR */}
      <div style={{ marginBottom: 18, padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={10} md={9}>
            <Input
              placeholder="Tìm theo tên hoặc mã tour..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={7} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="-- Danh mục tour --"
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              allowClear
            >
              {categories.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={7} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="-- Loại hình tour --"
              value={selectedTourType}
              onChange={(val) => setSelectedTourType(val)}
              allowClear
            >
              <Select.Option value="DOMESTIC">Trong nước (DOMESTIC)</Select.Option>
              <Select.Option value="INTERNATIONAL">Quốc tế (INTERNATIONAL)</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Tìm kiếm
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Table
        columns={columns}
        dataSource={tours}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1050 }}
        pagination={{
          ...pagination,
          position: ['bottomCenter'],
          showTotal: (total) => `Tổng cộng ${total} tour`,
          showSizeChanger: true,
        }}
        onChange={handleTableChange}
      />

      {/* ================= 1. MODAL THÊM / SỬA TOUR ================= */}
      <Modal
        title={editingId ? 'Cập nhật Tour' : 'Thêm Tour Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="categoryId" label="Danh mục Tour" rules={[{ required: true, message: 'Chọn danh mục!' }]}>
              <Select placeholder="Chọn danh mục">
                {categories.map((c) => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="tourCode" label="Mã Tour" rules={[{ required: true, message: 'Nhập mã tour!' }]}>
              <Input placeholder="VD: TO-DN-01" />
            </Form.Item>
          </div>

          <Form.Item name="name" label="Tên Tour" rules={[{ required: true, message: 'Nhập tên tour!' }]}>
            <Input placeholder="VD: Tour Du Lịch Đà Nẵng 3N2Đ" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="tourType" label="Loại tour" initialValue="DOMESTIC" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="DOMESTIC">Trong nước</Select.Option>
                <Select.Option value="INTERNATIONAL">Quốc tế</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="departureCity" label="Nơi khởi hành" rules={[{ required: true, message: 'Nhập nơi khởi hành!' }]}>
              <Input placeholder="VD: TP. Hồ Chí Minh" />
            </Form.Item>
            <Form.Item name="destinationCity" label="Điểm đến" rules={[{ required: true, message: 'Nhập điểm đến!' }]}>
              <Input placeholder="VD: Đà Nẵng" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="durationDays" label="Số ngày đi" rules={[{ required: true, message: 'Nhập số ngày đi!' }]}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder="3" />
            </Form.Item>
            <Form.Item name="durationNights" label="Số đêm nghỉ" rules={[{ required: true, message: 'Nhập số đêm nghỉ!' }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="2" />
            </Form.Item>
          </div>

          <Form.Item name="featuredImage" label="URL ảnh đại diện (Thumbnail)">
            <Input placeholder="https://images.unsplash.com/photo-..." />
          </Form.Item>
          <Form.Item name="summary" label="Tóm tắt ngắn">
            <Input.TextArea rows={2} placeholder="Tóm tắt điểm nổi bật..." />
          </Form.Item>
          <Form.Item name="description" label="Mô tả chi tiết">
            <Input.TextArea rows={4} placeholder="Chi tiết giới thiệu tour..." />
          </Form.Item>

          {editingId && (
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="ACTIVE">Hoạt động (ACTIVE)</Select.Option>
                <Select.Option value="INACTIVE">Tạm ẩn (INACTIVE)</Select.Option>
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

      {/* ================= 2. MODAL QUẢN LÝ ALBUM ẢNH (TOUR IMAGE) ================= */}
      <Modal
        title={
          <div>
            <FileImageOutlined style={{ color: '#13c2c2', marginRight: 8 }} />
            Album ảnh phụ: <b>{selectedTourForImage?.name}</b>
          </div>
        }
        open={isImageModalOpen}
        onCancel={() => setIsImageModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsImageModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={750}
        destroyOnClose
      >
        <Card size="small" style={{ background: '#f5f5f5', marginBottom: 16 }}>
          <Form form={imageForm} layout="inline" onFinish={handleAddImage}>
            <Form.Item
              name="imageUrl"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Nhập đường dẫn ảnh (URL)!' }]}
            >
              <Input placeholder="Dán link ảnh (https://...)" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Thêm Ảnh
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            loading={imageLoading}
            dataSource={tourImages}
            locale={{ emptyText: 'Chưa có ảnh phụ nào trong album của tour này.' }}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  styles={{ body: { padding: 8 } }}
                  cover={
                    <Image
                      src={item.imageUrl}
                      height={140}
                      style={{ objectFit: 'cover' }}
                      fallback="https://via.placeholder.com/300x140?text=Loi+Anh"
                    />
                  }
                  actions={[
                    <Popconfirm
                      key="delete"
                      title="Xóa ảnh này khỏi album?"
                      onConfirm={() => handleDeleteImage(item.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button type="text" danger size="small" icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  ]}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* ================= 3. MODAL QUẢN LÝ CHÍNH SÁCH TOUR (TOUR POLICY) ================= */}
      <Modal
        title={
          <div>
            <FileProtectOutlined style={{ color: '#722ed1', marginRight: 8 }} />
            Chính sách & Điều khoản: <b>{selectedTourForPolicy?.name}</b>
          </div>
        }
        open={isPolicyModalOpen}
        onCancel={() => setIsPolicyModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsPolicyModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={750}
        destroyOnClose
      >
        <Card size="small" style={{ background: '#f9f9f9', marginBottom: 16 }}>
          <Form form={policyForm} layout="vertical" onFinish={handleSavePolicy}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  name="policyType"
                  label="Loại chính sách"
                  initialValue="INCLUDED"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value="INCLUDED">🟢 Giá bao gồm</Select.Option>
                    <Select.Option value="EXCLUDED">🔴 Không bao gồm</Select.Option>
                    <Select.Option value="POLICY_NOTE">🟡 Lưu ý chung</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  name="content"
                  label="Nội dung điều khoản"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                >
                  <Input.TextArea rows={2} placeholder="VD: Xe đưa đón máy lạnh đời mới, vé tham quan..." />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ textAlign: 'right' }}>
              <Space>
                {editingPolicyId && (
                  <Button onClick={() => { setEditingPolicyId(null); policyForm.resetFields(); }}>
                    Hủy sửa
                  </Button>
                )}
                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                  {editingPolicyId ? 'Cập nhật' : 'Thêm Điều Khoản'}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        <div style={{ maxHeight: 350, overflowY: 'auto' }}>
          <List
            loading={policyLoading}
            dataSource={tourPolicies}
            locale={{ emptyText: 'Chưa có điều khoản chính sách nào được thiết lập.' }}
            renderItem={(item) => {
              const badgeConfig = {
                INCLUDED: { color: 'green', text: 'Bao gồm', icon: <CheckCircleOutlined /> },
                EXCLUDED: { color: 'volcano', text: 'Không bao gồm', icon: <CloseCircleOutlined /> },
                POLICY_NOTE: { color: 'gold', text: 'Lưu ý', icon: <InfoCircleOutlined /> },
              }[item.policyType] || { color: 'blue', text: item.policyType };

              return (
                <List.Item
                  actions={[
                    <Button key="edit" type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditPolicy(item)}>
                      Sửa
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="Xóa điều khoản này?"
                      onConfirm={() => handleDeletePolicy(item.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                        Xóa
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color={badgeConfig.color} icon={badgeConfig.icon}>
                          {badgeConfig.text}
                        </Tag>
                        <span style={{ fontWeight: 400, color: '#333' }}>{item.content}</span>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default TourManagement;
