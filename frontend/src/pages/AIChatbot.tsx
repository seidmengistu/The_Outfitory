import React from 'react';
import { ChatProvider } from '../contexts/AiChatContext';
import { ChatContainer } from '../components/features/recommendations/ChatContainer';


const AIChatbot: React.FC = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex flex-col">
        <ChatContainer />
      </div>
    </ChatProvider>
  );
};

export default AIChatbot;