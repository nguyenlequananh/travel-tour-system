import React, { useEffect, useState } from 'react';
import {
  Table, Tag, message, Button, Modal, Form, Input,
  InputNumber, Select, Space, Card, Row, Col
} from 'antd';
import {
  CreditCardOutlined, PlusOutlined, SearchOutlined,
  ReloadOutlined, DollarCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { paymentService } from '../services';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Bộ lọc tìm kiếm
  const [keyword, setKeyword] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(undefined);
  const [status, setStatus] = useState(undefined);

  // State Modal ghi nhận thanh toán thủ công
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchPayments = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy: 'id',
        order: 'DESC',
        keyword: keyword?.trim() || undefined,
        paymentMethod: paymentMethod || undefined,
        status: status || undefined,
      };

      const res = await paymentService.getAdminPayments(params);
      const pageData = res.data;

      setPayments(pageData.data || []);
      setPagination({
        current: pageData.pageNumber + 1,
        pageSize: pageData.pageSize,
        total: pageData.totalElements,
      });
    } catch (err) {
      message.error(err.message || 'Lỗi tải danh sách thanh toán!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(0, pagination.pageSize);
  }, []);

  const handleSearch = () => {
    fetchPayments(0, pagination.pageSize);
  };

  const handleReset = () => {
    setKeyword('');
    setPaymentMethod(undefined);
    setStatus(undefined);
    setTimeout(() => {
      fetchPayments(0, pagination.pageSize);
    }, 0);
  };

  const handleTableChange = (pagin) => {
    fetchPayments(pagin.current - 1, pagin.pageSize);
  };

  const handleCreatePayment = async (values) => {
    setSubmitLoading(true);
    try {
      const payload = {
        bookingId: values.bookingId,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentType: values.paymentType,
        gatewayResponseCode: values.gatewayResponseCode || 'COUNTER_CASH_00',
      };

      await paymentService.processManualPayment(payload);
      message.success('Ghi nhận thanh toán tại quầy thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchPayments(pagination.current - 1, pagination.pageSize);
    } catch (err) {
      message.error(err.message || 'Lỗi ghi nhận thanh toán!');
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã Giao Dịch',
      dataIndex: 'transactionCode',
      key: 'transactionCode',
      render: (code) => <strong>{code}</strong>,
    },
    {
      title: 'Mã Đơn Đặt',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Số Tiền Thanh Toán',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <strong style={{ color: '#52c41a', fontSize: 14 }}>
          {Number(amount).toLocaleString('vi-VN')} đ
        </strong>
      ),
    },
    {
      title: 'Phương Thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        if (method === 'VNPAY') return <Tag color="blue">VNPAY</Tag>;
        if (method === 'MOMO') return <Tag color="magenta">MOMO</Tag>;
        if (method === 'BANK_TRANSFER') return <Tag color="geekblue">Chuyển khoản</Tag>;
        return <Tag color="gold">Tiền mặt</Tag>;
      },
    },
    {
      title: 'Hình thức',
      dataIndex: 'paymentType',
      key: 'paymentType',
      render: (type) => (
        <Tag color={type === 'FULL_PAYMENT' ? 'green' : type === 'DEPOSIT' ? 'orange' : 'purple'}>
          {type === 'FULL_PAYMENT' ? 'Thanh toán 100%' : type === 'DEPOSIT' ? 'Đặt cọc' : 'Phần còn lại'}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'paymentTime',
      key: 'paymentTime',
      render: (time) => (time ? dayjs(time).format('DD/MM/YYYY HH:mm') : '—'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <Tag color={st === 'SUCCESS' ? 'green' : st === 'FAILED' ? 'red' : 'gold'}>
          {st === 'SUCCESS' ? 'Thành công' : st === 'FAILED' ? 'Thất bại' : 'Chờ xử lý'}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 18 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCardOutlined style={{ color: '#0d6e6e' }} />
              Lịch Sử Giao Dịch & Thanh Toán
            </h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ background: '#0d6e6e', borderColor: '#0d6e6e' }}
              onClick={() => {
                form.resetFields();
                setIsModalOpen(true);
              }}
            >
              Ghi nhận thanh toán tại quầy
            </Button>
          </Col>
        </Row>

        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={8}>
            <Input
              placeholder="Tìm theo mã giao dịch hoặc mã đơn..."
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col xs={12} sm={5} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="-- Phương thức --"
              value={paymentMethod}
              onChange={(val) => setPaymentMethod(val)}
              allowClear
            >
              <Select.Option value="CASH">💵 Tiền mặt</Select.Option>
              <Select.Option value="BANK_TRANSFER">🏦 Chuyển khoản</Select.Option>
              <Select.Option value="VNPAY">💳 VNPAY</Select.Option>
              <Select.Option value="MOMO">📱 MOMO</Select.Option>
            </Select>
          </Col>
          <Col xs={12} sm={5} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="-- Trạng thái --"
              value={status}
              onChange={(val) => setStatus(val)}
              allowClear
            >
              <Select.Option value="SUCCESS">🟢 Thành công (SUCCESS)</Select.Option>
              <Select.Option value="PENDING">🟡 Chờ xử lý (PENDING)</Select.Option>
              <Select.Option value="FAILED">🔴 Thất bại (FAILED)</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                Lọc
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 16 } }}>
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          scroll={{ x: 960 }}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={
          <div>
            <DollarCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            Ghi nhận thanh toán tại quầy / Chuyển khoản
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePayment}
          initialValues={{
            paymentMethod: 'CASH',
            paymentType: 'FULL_PAYMENT',
          }}
        >
          <Form.Item
            name="bookingId"
            label="ID Đơn Đặt Tour"
            rules={[{ required: true, message: 'Vui lòng nhập ID đơn đặt tour!' }]}
          >
            <InputNumber
              placeholder="Nhập ID đơn (số nguyên ID trong trang Quản lý đơn)"
              min={1}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền thu (VNĐ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền thanh toán!' },
              { type: 'number', min: 1000, message: 'Số tiền tối thiểu là 1.000 đ' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập số tiền thực tế khách đã đóng..."
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item
              name="paymentMethod"
              label="Phương thức thanh toán"
              rules={[{ required: true, message: 'Chọn phương thức!' }]}
            >
              <Select>
                <Select.Option value="CASH">💵 Tiền mặt tại quầy</Select.Option>
                <Select.Option value="BANK_TRANSFER">🏦 Chuyển khoản ngân hàng</Select.Option>
                <Select.Option value="VNPAY">💳 VNPAY POS</Select.Option>
                <Select.Option value="MOMO">📱 Ví MoMo</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="paymentType"
              label="Giai đoạn thanh toán"
              rules={[{ required: true, message: 'Chọn giai đoạn!' }]}
            >
              <Select>
                <Select.Option value="FULL_PAYMENT">Thanh toán 100%</Select.Option>
                <Select.Option value="DEPOSIT">Đặt cọc giữ chỗ</Select.Option>
                <Select.Option value="FINAL_PAYMENT">Thanh toán phần còn lại</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="gatewayResponseCode"
            label="Ghi chú giao dịch / Mã tham chiếu biên lai"
          >
            <Input placeholder="VD: Biên lai số BL-001, hoặc Ủy nhiệm chi ngân hàng..." />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: 16 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitLoading} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                Xác nhận thanh toán
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentManagement;
