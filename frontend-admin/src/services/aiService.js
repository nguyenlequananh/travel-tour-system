import axiosClient from '../api/axiosClient';

const aiService = {
  // Gửi tin nhắn tới AI Chatbot
  chat: (userMessage) => {
    return axiosClient.post('/ai/chat', { message: userMessage });
  },
};

export default aiService;
