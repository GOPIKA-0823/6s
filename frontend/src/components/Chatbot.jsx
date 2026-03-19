import React from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import config from './chatbotConfig';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';

const ChatbotComponent = ({ userType }) => {
  const actionProvider = ActionProvider(userType);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={actionProvider}
      />
    </div>
  );
};

export default ChatbotComponent;