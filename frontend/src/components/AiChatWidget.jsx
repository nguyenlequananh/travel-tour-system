import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Avatar, Spin, message } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import aiService from '../services/aiService';

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Xin chào! Tôi là trợ lý ảo TravelHub. Bạn muốn tìm tour du lịch nào hôm nay?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Gửi tin nhắn sang Backend API /ai/chat
  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    
    // Thêm tin nhắn của khách vào danh sách hiển thị
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await aiService.chat(userMsg);
      const aiReply = res.data?.replyMessage || res.data || 'Xin lỗi, tôi chưa hiểu rõ ý bạn!';

      // Thêm câu trả lời của AI vào danh sách
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      message.error(err.message || 'Lỗi kết nối tới trợ lý AI!');
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Xin lỗi, hệ thống AI đang bận.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 25, right: 25, zIndex: 9999 }}>
      {/* 1. NÚT BONG BÓNG CHAT NỔI Ở GÓC MÀN HÌNH */}
      {!isOpen && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<RobotOutlined style={{ fontSize: 26 }} />}
          onClick={() => setIsOpen(true)}
          style={{
            width: 60,
            height: 60,
            backgroundColor: '#1677ff',
            boxShadow: '0 4px 15px rgba(22, 119, 255, 0.4)',
          }}
        />
      )}

      {/* 2. KHUNG HỘP THOẠI CHAT (HIỆN KHI BẤM VÀO BONG BÓNG) */}
      {isOpen && (
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <span><RobotOutlined style={{ marginRight: 8 }} /> Trợ Lý Du Lịch AI</span>
              <Button
                type="text"
                icon={<CloseOutlined style={{ color: '#fff' }} />}
                onClick={() => setIsOpen(false)}
              />
            </div>
          }
          headStyle={{ backgroundColor: '#1677ff', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: '0 16px' }}
          bodyStyle={{ padding: 12, display: 'flex', flexDirection: 'column', height: 380 }}
          style={{
            width: 340,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: 'none',
          }}
        >
          {/* KHU VỰC HIỂN THỊ TIN NHẮN */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 10 }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                }}
              >
                {msg.sender === 'ai' && (
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff', marginRight: 8 }} size="small" />
                )}
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: 13,
                    lineHeight: 1.4,
                    backgroundColor: msg.sender === 'user' ? '#1677ff' : '#f0f0f0',
                    color: msg.sender === 'user' ? '#fff' : '#333',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#52c41a', marginLeft: 8 }} size="small" />
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1677ff', marginRight: 8 }} size="small" />
                <div style={{ background: '#f0f0f0', padding: '8px 12px', borderRadius: 10, fontSize: 13 }}>
                  <Spin size="small" /> Đang tư vấn tour cho bạn...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* KHU VỰC NHẬP VĂN BẢN VÀ GỬI */}
          <div style={{ display: 'flex', gap: 6 }}>
            <Input
              placeholder="Nhập câu hỏi (VD: Đi biển 3 ngày...)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default AiChatWidget;