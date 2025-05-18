
import React from 'react';

export interface ChatMessageProps {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: 'instructor' | 'student';
  };
  timestamp: string;
  isMine: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, sender, timestamp, isMine }) => {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="flex max-w-[75%]">
        {!isMine && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
            {sender.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex flex-col">
          {!isMine && (
            <span className="text-xs text-gray-500 mb-1">{sender.name}</span>
          )}
          
          <div
            className={`rounded-lg py-2 px-3 ${
              isMine 
                ? 'bg-lms-indigo text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <p className="text-sm">{content}</p>
          </div>
          
          <span className="text-xs text-gray-500 mt-1 self-end">
            {formattedTime}
          </span>
        </div>
        
        {isMine && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-lms-indigo flex items-center justify-center ml-2 text-white">
            {sender.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
