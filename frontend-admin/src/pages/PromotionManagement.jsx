import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Progress,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, GiftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../api/axiosClient';

const { RangePicker } = DatePicker;

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = Thêm mới, có ID = Đang sửa
  const [form] = Form.useForm();
  const [discountType, setDiscountType] = useState('PERCENTAGE');

  // 1. Gọi API lấy danh sách khuyến mãi
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/promotions');
      setPromotions(res.data || []);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // 2. Mở Modal Thêm mới
  const handleOpenCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setDiscountType('PERCENTAGE');
    setIsModalOpen(true);
  };

  // 3. Mở Modal Chỉnh sửa
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

  // 4. Submit Form (Xử lý cả Thêm và Sửa)
  const handleSubmit = async (values) => {
    try {
      const payload = {
        code: values.code.toUpperCase(),
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscountAmount: values.maxDiscountAmount || null,
        minOrderAmount: values.minOrderAmount || 0,
        usageLimit: values.usageLimit,
        validFrom: values.validRange[0].format('YYYY-MM-DDTHH:mm:ss'),
        validTo: values.validRange[1].format('YYYY-MM-DDTHH:mm:ss'),
      };

      if (editingId) {
        // Cập nhật
        await axiosClient.put(`/admin/promotions/${editingId}`, payload);
        message.success('Cập nhật khuyến mãi thành công!');
      } else {
        // Tạo mới
        await axiosClient.post('/admin/promotions', payload);
        message.success('Tạo mã khuyến mãi mới thành công!');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchPromotions();
    } catch (err) {
      message.error(err.message);
    }
  };

  // 5. Xóa / Tắt khuyến mãi
  const handleDelete = async (id) => {
    try {
      await axiosClient.patch(`/admin/promotions/${id}`);
      message.success('Xóa khuyến mãi thành công!');
      fetchPromotions();
    } catch (err) {
      message.error(err.message);
    }
  };

  // Cấu hình các cột của Bảng
  const columns = [
    {
      title: 'Mã Voucher',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <Tag color="purple" style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {code}
        </Tag>
      ),
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
        return (
          <strong style={{ color: '#1677ff', fontSize: '14px' }}>
            Giảm {Number(record.discountValue).toLocaleString('vi-VN')} đ
          </strong>
        );
      },
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderAmount',
      key: 'minOrderAmount',
      render: (amount) => `${Number(amount).toLocaleString('vi-VN')} đ`,
    },
    {
      title: 'Lượt dùng',
      key: 'usage',
      width: 170,
      render: (_, record) => {
        const percent = Math.round((record.usedCount / record.usageLimit) * 100);
        return (
          <div>
            <div style={{ fontSize: '12px', marginBottom: 2 }}>
              Đã dùng: <b>{record.usedCount}</b>/{record.usageLimit} (Còn: {record.remainingUsage})
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
          <div>Từ: {dayjs(record.validFrom).format('DD/MM/YYYY HH:mm')}</div>
          <div>Đến: {dayjs(record.validTo).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.isExpired) {
          return <Tag color="volcano">Đã hết hạn</Tag>;
        }
        if (!record.isActive) {
          return <Tag color="default">Đã tạm tắt</Tag>;
        }
        return <Tag color="green">Đang áp dụng</Tag>;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            type="primary"
            ghost
            size="small"
            onClick={() => handleOpenEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa/tắt mã này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>
          <GiftOutlined style={{ marginRight: 8 }} /> Quản lý Mã Giảm Giá / Khuyến Mãi
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
        pagination={{ pageSize: 6 }}
      />

      {/* POPUP THÊM / SỬA KHUYẾN MÃI */}
      <Modal
        title={editingId ? 'Cập nhật Mã Khuyến Mãi' : 'Tạo Mã Khuyến Mãi Mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Mã Voucher (In hoa và số, vd: HE2026)"
            rules={[
              { required: true, message: 'Vui lòng nhập mã voucher!' },
              { min: 3, max: 20, message: 'Độ dài từ 3 đến 20 ký tự!' },
              { pattern: /^[A-Za-z0-9]+$/, message: 'Chỉ chứa chữ cái và số!' },
            ]}
          >
            <Input
              placeholder="VD: SALE50, HE2026"
              style={{ textTransform: 'uppercase' }}
              disabled={!!editingId} // Đã tạo rồi thì không sửa mã code
            />
          </Form.Item>

          <Form.Item
            name="discountType"
            label="Loại giảm giá"
            initialValue="PERCENTAGE"
            rules={[{ required: true }]}
          >
            <Select onChange={(val) => setDiscountType(val)}>
              <Select.Option value="PERCENTAGE">Giảm theo phần trăm (%)</Select.Option>
              <Select.Option value="FIXED_AMOUNT">Giảm tiền mặt cố định (VNĐ)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discountValue"
            label={discountType === 'PERCENTAGE' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
            rules={[{ required: true, message: 'Vui lòng nhập mức giảm!' }]}
          >
            <InputNumber
              min={1}
              max={discountType === 'PERCENTAGE' ? 100 : undefined}
              style={{ width: '100%' }}
              placeholder={discountType === 'PERCENTAGE' ? 'VD: 15' : 'VD: 200000'}
            />
          </Form.Item>

          {discountType === 'PERCENTAGE' && (
            <Form.Item
              name="maxDiscountAmount"
              label="Số tiền giảm tối đa (VNĐ) - Bỏ trống nếu không giới hạn"
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 500000" />
            </Form.Item>
          )}

          <Form.Item
            name="minOrderAmount"
            label="Giá trị đơn hàng tối thiểu để được áp dụng (VNĐ)"
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 1000000" />
          </Form.Item>

          <Form.Item
            name="usageLimit"
            label="Giới hạn số lượt sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập số lượt dùng tối đa!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="VD: 100" />
          </Form.Item>

          <Form.Item
            name="validRange"
            label="Thời gian áp dụng (Từ ngày -> Đến ngày)"
            rules={[{ required: true, message: 'Vui lòng chọn thời hạn!' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionManagement;