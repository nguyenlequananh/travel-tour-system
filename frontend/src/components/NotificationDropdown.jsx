import React, { useEffect, useState, useRef } from 'react';
import { Badge, Button, List, Popover, message, Avatar, Space, Typography, Tooltip } from 'antd';
import {
  BellOutlined, CheckOutlined, ShoppingOutlined,
  CreditCardOutlined, RollbackOutlined, InfoCircleOutlined,
  FlagOutlined, TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import notificationService from '../services/notificationService';
import SockJS from 'sockjs-client';
import { over } from 'stompjs';
import { useAuth } from '../context/AuthContext';

const { Text } = Typography;

const NotificationDropdown = ({ userId: propUserId, isAdmin: propIsAdmin }) => {
  const { user, isAdmin: authIsAdmin } = useAuth();
  const userId = propUserId || user?.id;
  const isAdmin = propIsAdmin !== undefined ? propIsAdmin : authIsAdmin;

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingNotif, setLoadingNotif] = useState(false);

  const stompClientRef = useRef(null);
  const receivedNotifIdsRef = useRef(new Set());

  // 1. Tải danh sách thông báo phân trang (Load more)
  const fetchNotifications = async (currentPage = 0) => {
    if (!userId) return;
    setLoadingNotif(true);
    try {
      const res = await notificationService.getMyNotifications(userId, currentPage, 10);

      let notifList = [];
      let isLastPage = true;

      if (res?.data?.data && Array.isArray(res.data.data)) {
        notifList = res.data.data;
        isLastPage = res.data.isLast ?? res.data.last ?? (notifList.length < 10);
      } else if (res?.data && Array.isArray(res.data)) {
        notifList = res.data;
        isLastPage = res.isLast ?? res.last ?? (notifList.length < 10);
      } else if (Array.isArray(res)) {
        notifList = res;
        isLastPage = notifList.length < 10;
      }

      notifList.forEach((n) => {
        if (n?.id) receivedNotifIdsRef.current.add(n.id);
      });

      if (currentPage === 0) {
        setNotifications(notifList);
      } else {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((item) => item.id));
          const newUnique = notifList.filter((item) => !existingIds.has(item.id));
          return [...prev, ...newUnique];
        });
      }

      setHasMore(!isLastPage);
      setPage(currentPage);

      if (currentPage === 0) {
        const countRes = await notificationService.getUnreadCount(userId);
        const unread = typeof countRes?.data === 'number'
          ? countRes.data
          : (typeof countRes === 'number' ? countRes : 0);
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    } finally {
      setLoadingNotif(false);
    }
  };

  // 2. Kết nối WebSocket Real-time
  useEffect(() => {
    if (!userId) return;

    fetchNotifications(0);

    let isSubscribed = true;
    let client = null;

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || (
        window.location.hostname === 'localhost' ? 'http://localhost:8081/ws' : '/ws'
      );
      const socket = new SockJS(wsUrl);
      client = over(socket);
      // Bật debug log STOMP để kiểm tra trực tiếp trong F12 Console
      client.debug = (str) => {
        console.log('[STOMP-DEBUG]', str);
      };

      client.connect({}, () => {
        if (!isSubscribed) {
          try { client.disconnect(); } catch {}
          return;
        }

        stompClientRef.current = client;

        const handleIncomingMessage = (payload) => {
          if (!payload?.body) return;
          try {
            const newNotif = JSON.parse(payload.body);
            if (!newNotif || !newNotif.id) return;

            // Chống nhận trùng 2 lần
            if (receivedNotifIdsRef.current.has(newNotif.id)) {
              return;
            }
            receivedNotifIdsRef.current.add(newNotif.id);

            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((c) => c + 1);
            message.info({
              content: `🔔 ${newNotif.title}: ${newNotif.content || ''}`,
              duration: 4,
            });

            // Bắn event toàn cục để các trang như MyBookingsPage tự động reload dữ liệu ngay lập tức
            window.dispatchEvent(new CustomEvent('booking-status-updated', { detail: newNotif }));
          } catch (err) {
            console.error('Lỗi parse socket notification:', err);
          }
        };

        // Kênh Broadcast cho Quản trị viên
        if (isAdmin) {
          client.subscribe('/topic/admin/notifications', handleIncomingMessage);
        }

        // 1. Kênh cá nhân hoá trực tiếp (Được hỗ trợ bởi SimpleBroker, không phụ thuộc Principal)
        client.subscribe(`/queue/notifications/${userId}`, handleIncomingMessage);

        // 2. Kênh user tiêu chuẩn Spring STOMP
        client.subscribe('/user/queue/notifications', handleIncomingMessage);

        // 3. Kênh dự phòng
        client.subscribe(`/user/${userId}/queue/notifications`, handleIncomingMessage);
      }, (err) => {
        console.error('Lỗi kết nối STOMP:', err);
      });
    } catch (err) {
      console.error('Lỗi tạo SockJS:', err);
    }

    return () => {
      isSubscribed = false;
      if (stompClientRef.current) {
        try { stompClientRef.current.disconnect(); } catch {}
        stompClientRef.current = null;
      } else if (client) {
        try { client.disconnect(); } catch {}
      }
    };
  }, [userId, isAdmin]);

  // 3. Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationService.markAllAsRead(userId);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      message.success('Đã đánh dấu đọc tất cả thông báo!');
    } catch {
      message.error('Lỗi khi đánh dấu thông báo!');
    }
  };

  // 4. Bấm vào 1 thông báo
  const handleReadSingle = async (item) => {
    // Đóng popover ngay lập tức để chuyển hướng trang mượt mà
    setOpen(false);

    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Lỗi đánh dấu đã đọc:', err);
      }
    }

    if (item.referenceUrl) {
      // Khách hàng không có quyền vào /admin
      if (!isAdmin && item.referenceUrl.startsWith('/admin')) {
        navigate('/my-bookings');
      } else {
        navigate(item.referenceUrl);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_BOOKING':
        return <Avatar style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }} icon={<ShoppingOutlined />} />;
      case 'PAYMENT_SUCCESS':
        return <Avatar style={{ backgroundColor: '#f6ffed', color: '#52c41a' }} icon={<CreditCardOutlined />} />;
      case 'BOOKING_CANCEL':
        return <Avatar style={{ backgroundColor: '#fff1f0', color: '#ff4d4f' }} icon={<RollbackOutlined />} />;
      case 'GUIDE_ASSIGNED':
        return <Avatar style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }} icon={<FlagOutlined />} />;
      case 'SYSTEM_ALERT':
        return <Avatar style={{ backgroundColor: '#fff7e6', color: '#fa8c16' }} icon={<TeamOutlined />} />;
      default:
        return <Avatar style={{ backgroundColor: '#fffbe6', color: '#faad14' }} icon={<InfoCircleOutlined />} />;
    }
  };

  const displayedNotifications = activeTab === 'UNREAD'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const renderLoadMoreBtn = () => {
    if (activeTab === 'UNREAD') return null;

    if (hasMore) {
      return (
        <div style={{ textAlign: 'center', padding: '10px 12px 4px' }}>
          <Button
            type="default"
            size="small"
            block
            loading={loadingNotif}
            onClick={() => fetchNotifications(page + 1)}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            {loadingNotif ? 'Đang tải thông báo cũ...' : 'Xem thông báo cũ hơn'}
          </Button>
        </div>
      );
    }

    if (notifications.length > 0) {
      return (
        <div style={{ textAlign: 'center', padding: '10px 0 4px', color: '#8c8c8c', fontSize: 12 }}>
          ✓ Đã hiển thị tất cả thông báo
        </div>
      );
    }

    return null;
  };

  const popoverContent = (
    <div style={{ width: 380, maxHeight: 520, display: 'flex', flexDirection: 'column' }}>
      {/* Header Popover */}
      <div style={{ padding: '4px 6px 10px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
          {unreadCount > 0 && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              style={{ padding: 0, fontSize: 12 }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <Space size="small">
          <Button
            type={activeTab === 'ALL' ? 'primary' : 'default'}
            shape="round"
            size="small"
            onClick={() => setActiveTab('ALL')}
            style={{ fontSize: 12 }}
          >
            Tất cả
          </Button>
          <Button
            type={activeTab === 'UNREAD' ? 'primary' : 'default'}
            shape="round"
            size="small"
            onClick={() => setActiveTab('UNREAD')}
            style={{ fontSize: 12 }}
          >
            Chưa đọc {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Button>
        </Space>
      </div>

      {/* Danh sách thông báo */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '6px 2px' }}>
        <List
          size="small"
          loading={loadingNotif && page === 0}
          loadMore={renderLoadMoreBtn()}
          dataSource={displayedNotifications}
          locale={{
            emptyText: (
              <div style={{ padding: '36px 0', color: '#8c8c8c', textAlign: 'center' }}>
                <BellOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 8 }} />
                <div>{activeTab === 'UNREAD' ? 'Không có thông báo chưa đọc nào.' : 'Chưa có thông báo nào.'}</div>
              </div>
            ),
          }}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleReadSingle(item)}
              style={{
                background: item.isRead ? '#ffffff' : '#f0f7ff',
                borderLeft: item.isRead ? '3px solid transparent' : '3px solid #1677ff',
                borderRadius: 6,
                marginBottom: 6,
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = item.isRead ? '#fafafa' : '#e6f4ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = item.isRead ? '#ffffff' : '#f0f7ff';
              }}
            >
              <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {getNotificationIcon(item.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: item.isRead ? 500 : 700,
                        color: item.isRead ? '#262626' : '#1677ff',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.title}
                    </span>

                    {!item.isRead && (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#1677ff',
                          marginTop: 4,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: item.isRead ? '#595959' : '#1f1f1f',
                      marginTop: 4,
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.content}
                  </div>

                  <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                    {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
    >
      <Tooltip title="Thông báo">
        <Badge count={unreadCount} overflowCount={99} offset={[-2, 4]}>
          <Button
            shape="circle"
            icon={<BellOutlined style={{ fontSize: 18, color: '#262626' }} />}
            style={{ border: '1px solid #d9d9d9' }}
          />
        </Badge>
      </Tooltip>
    </Popover>
  );
};

export default NotificationDropdown;
