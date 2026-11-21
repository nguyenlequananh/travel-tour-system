import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Card, Avatar, Spin, message } from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  CloseOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import aiService from '../services/aiService';

const QUICK_PROMPTS = [
  'Gợi ý tour biển 3 ngày từ TP.HCM',
  'Tour miền Bắc ngắm cảnh đẹp',
  'Tour quốc tế nổi bật hiện nay',
];

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là trợ lý du lịch AI của TravelHub. Bạn muốn đi đâu, mấy ngày hoặc ngân sách khoảng bao nhiêu?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (customText) => {
    const textToSend = typeof customText === 'string' ? customText : inputValue;
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
    setInputValue('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await aiService.chat(userMsg);
      const aiReply = res.data?.replyMessage || res.data || 'Xin lỗi, tôi chưa hiểu rõ ý bạn!';
      setMessages((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      message.error(err.message || 'Lỗi kết nối tới trợ lý AI!');
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Xin lỗi, hệ thống AI đang bận. Bạn thử lại sau nhé!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* NÚT MỞ CHAT RÕ RÀNG (CONTRAST + AFFORDANCE) */}
      {!isOpen && (
        <Button
          type="primary"
          size="large"
          icon={<MessageOutlined style={{ fontSize: 18 }} />}
          onClick={() => setIsOpen(true)}
          style={{
            height: 50,
            padding: '0 20px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #0d6e6e 0%, #0b2545 100%)',
            border: 'none',
            boxShadow: '0 10px 24px rgba(11, 37, 69, 0.28)',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Tư vấn Tour AI
        </Button>
      )}

      {/* HỘP THOẠI CHAT AI */}
      {isOpen && (
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar size={32} icon={<RobotOutlined />} style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>Trợ Lý Du Lịch AI</div>
                  <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 400 }}>Gợi ý tour thông minh 24/7</div>
                </div>
              </div>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined style={{ color: '#fff' }} />}
                onClick={() => setIsOpen(false)}
              />
            </div>
          }
          styles={{
            header: {
              background: 'linear-gradient(135deg, #0d6e6e 0%, #0b2545 100%)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: '12px 16px',
              borderBottom: 'none',
            },
            body: {
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              height: 430,
              background: '#f8fafc',
            },
          }}
          style={{
            width: 365,
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: 16,
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.2)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {/* TIN NHẮN */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, marginBottom: 10 }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  marginBottom: 12,
                  gap: 8,
                }}
              >
                {msg.sender === 'ai' && (
                  <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#0d6e6e', flexShrink: 0 }} size={28} />
                )}
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 13px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    backgroundColor: msg.sender === 'user' ? '#0d6e6e' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#e85d04', flexShrink: 0 }} size={28} />
                )}
              </div>
            ))}

            {/* GỢI Ý NHANH KHI MỚI MỞ CHAT */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, paddingLeft: 36 }}>
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    style={{
                      border: '1px solid #99d5cc',
                      background: '#e6f4f1',
                      color: '#0d6e6e',
                      borderRadius: 999,
                      padding: '5px 11px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#0d6e6e' }} size={28} />
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    color: '#475569',
                  }}
                >
                  <Spin size="small" style={{ marginRight: 8 }} />
                  Đang tìm tour phù hợp cho bạn...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô NHẬP LIỆU */}
          <div style={{ display: 'flex', gap: 8, background: '#fff', padding: 6, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <Input
              variant="borderless"
              placeholder="Hỏi về điểm đến, ngân sách..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={() => handleSend()}
              disabled={loading}
              style={{ fontSize: 13.5 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSend()}
              loading={loading}
              style={{ borderRadius: 8, height: 36, width: 40, flexShrink: 0 }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default AiChatWidget;
