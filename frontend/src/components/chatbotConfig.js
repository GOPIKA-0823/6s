import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: 'AI Assistant',
  initialMessages: [
    createChatBotMessage("Hi! I'm your AI assistant. How can I help you today?"),
  ],
  customStyles: {
    botMessageBox: {
      backgroundColor: '#376B7E',
    },
    chatButton: {
      backgroundColor: '#376B7E',
    },
  },
};

export default config;