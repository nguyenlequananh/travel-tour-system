import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Tag, Popconfirm, message, Modal, Form, Input,
  InputNumber, Select, DatePicker, Progress, Row, Col, Card
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import promotionService from '../services/promotionService';

const { RangePicker } = DatePicker;

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState('PERCENTAGE');

  const fetchPromotions = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const res = await promotionService.getAdminPromotions({
        page,
        size,
        sortBy: 'id',
        order: 'DESC'
      });
      const pageData = res.data;

      setPromotions(pageData.data || []);
      setPagination({
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      });
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions(0, pagination.pageSize);
  }, []);

  const handleTableChange = (pagin) => {
    fetchPromotions(pagin.current - 1, pagin.pageSize);
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setDiscountType('PERCENTAGE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingId(record.id);
    setDiscountType(record.discountType);
    form.setFieldsValue({
      code: record.code,
      discountType: record.discountType,
      discountValue: record.discountValue,
      maxDiscountAmount: record.maxDiscountAmount,
      minOrderAmount: record.minOrderAmount,
      usageLimit: record.usageLimit,
      validRange: [dayjs(record.validFrom), dayjs(record.validTo)],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        code: values.code.trim().toUpperCase(),
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscountAmount: values.discountType === 'PERCENTAGE' ? values.maxDiscountAmount || null : null,
        minOrderAmount: values.minOrderAmount || 0,
        usageLimit: values.usageLimit,
        validFrom: values.validRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        validTo: values.validRange[1].format('YYYY-MM-DDTHH:mm:ss'),
      };

      if (editingId) {
        await promotionService.updatePromotion(editingId, payload);
        message.success('Cập nhật khuyến mãi thành công!');
      } else {
        await promotionService.createPromotion(payload);
        message.success('Tạo mã khuyến mãi mới thành công!');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchPromotions(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi lưu mã khuyến mãi!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await promotionService.deletePromotion(id);
      message.success('Xóa khuyến mãi thành công!');
      fetchPromotions(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Lỗi khi xóa khuyến mãi!');
    }
  };

  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      render: (code) => <Tag color="purple" style={{ fontSize: '13px', fontWeight: 'bold' }}>{code}</Tag>,
    },
    {
      title: 'Mức giảm',
      key: 'discount',
      render: (_, record) => {
        if (record.discountType === 'PERCENTAGE') {
          return (
            <div>
              <strong style={{ color: '#eb2f96', fontSize: '14px' }}>Giảm {record.discountValue}%</strong>
              {record.maxDiscountAmount && (
                <div style={{ fontSize: '11px', color: '#888' }}>
                  Tối đa: {Number(record.maxDiscountAmount).toLocaleString('vi-VN')} đ
                </div>
              )}
            </div>
          );
        }
        return <strong style={{ color: '#1677ff', fontSize: '14px' }}>Giảm {Number(record.discountValue).toLocaleString('vi-VN')} đ</strong>;
      },
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderAmount',
      key: 'minOrderAmount',
      render: (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Lượt dùng',
      key: 'usage',
      width: 170,
      render: (_, record) => {
        const percent = record.usageLimit > 0 ? Math.round(((record.usedCount || 0) / record.usageLimit) * 100) : 0;
        return (
          <div>
            <div style={{ fontSize: '12px', marginBottom: 2 }}>
              Đã dùng: <b>{record.usedCount || 0}</b>/{record.usageLimit}
            </div>
            <Progress percent={percent} size="small" status={percent >= 100 ? 'exception' : 'active'} />
          </div>
        );
      },
    },
    {
      title: 'Thời hạn',
      key: 'duration',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>Từ: {record.validFrom ? dayjs(record.validFrom).format('DD/MM/YYYY HH:mm') : '---'}</div>
          <div>Đến: {record.validTo ? dayjs(record.validTo).format('DD/MM/YYYY HH:mm') : '---'}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.isExpired) return <Tag color="volcano">Đã hết hạn</Tag>;
        if (record.isActive === false) return <Tag color="default">Đã tắt</Tag>;
        return <Tag color="green">Đang áp dụng</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} type="primary" ghost size="small" onClick={() => handleOpenEditModal(record)}>
            Sửa
          </Button>
          <Popconfirm title="Bạn có chắc chắn muốn xóa/tắt mã này?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger size="small">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GiftOutlined style={{ color: '#722ed1' }} /> Quản lý Mã Giảm Giá / Khuyến Mãi
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
          Tạo Mã Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingId ? 'Cập nhật Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            discountType: 'PERCENTAGE',
            minOrderAmount: 0,
            usageLimit: 100,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã Voucher"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã voucher!' },
                  { pattern: /^[A-Za-z0-9_-]+$/, message: 'Mã chỉ chứa chữ cái, số, gạch ngang' }
                ]}
              >
                <Input placeholder="VD: TET2026, SUMMER50" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: 'PERCENTAGE', label: 'Theo Phần Trăm (%)' },
                    { value: 'FIXED_AMOUNT', label: 'Số Tiền Cố Định (VNĐ)' },
                  ]}
                  onChange={(val) => setDiscountType(val)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discountValue"
                label={discountType === 'PERCENTAGE' ? 'Mức giảm (%)' : 'Số tiền giảm (VNĐ)'}
                rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm!' }]}
              >
                <InputNumber
                  min={1}
                  max={discountType === 'PERCENTAGE' ? 100 : 1000000000}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            {discountType === 'PERCENTAGE' && (
              <Col span={12}>
                <Form.Item
                  name="maxDiscountAmount"
                  label="Giảm tối đa (VNĐ) - Bỏ trống nếu không giới hạn"
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="VD: 500000"
                  />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minOrderAmount"
                label="Giá trị đơn hàng tối thiểu (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị đơn tối thiểu!' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="usageLimit"
                label="Số lượt dùng tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập lượt dùng tối đa!' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="validRange"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời hạn sử dụng!' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingId ? 'Lưu Thay Đổi' : 'Tạo Khuyến Mãi'}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default PromotionManagement;
