
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Send, MessageCircle } from 'lucide-react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';

interface CourseChatProps {
  courseId: string;
  instructorId: string;
  instructorName: string;
}

// Mock initial messages for demonstration
const getMockMessages = (courseId: string, userId: string, instructorId: string): ChatMessageProps[] => [
  {
    id: '1',
    content: "Welcome to the course chat! Feel free to ask any questions here.",
    sender: {
      id: instructorId,
      name: 'Instructor',
      role: 'instructor'
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    isMine: userId === instructorId
  },
  {
    id: '2',
    content: "Thanks! I'm excited to start learning.",
    sender: {
      id: '1', // Student ID
      name: 'Student',
      role: 'student'
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isMine: userId === '1'
  }
];

const CourseChat: React.FC<CourseChatProps> = ({ courseId, instructorId, instructorName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, this would be a subscription to a real-time database
    if (user) {
      // Load initial messages
      setMessages(getMockMessages(courseId, user.id, instructorId).map(msg => ({
        ...msg,
        isMine: msg.sender.id === user.id
      })));
    }
  }, [courseId, user, instructorId]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    setIsLoading(true);
    
    // In a real app, this would be sent to a real-time database
    const newMsg: ChatMessageProps = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        id: user.id,
        name: user.name,
        role: user.role as 'instructor' | 'student'
      },
      timestamp: new Date().toISOString(),
      isMine: true
    };
    
    // Simulate API delay
    setTimeout(() => {
      setMessages([...messages, newMsg]);
      setNewMessage('');
      setIsLoading(false);
    }, 300);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle size={48} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">Sign in to chat</h3>
        <p className="text-gray-500">
          You need to sign in before you can participate in the course chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh] border rounded-lg overflow-hidden">
      <div className="bg-white px-4 py-3 border-b">
        <h3 className="font-medium">Course Chat</h3>
        <p className="text-sm text-gray-500">
          Chat with {user.role === 'instructor' ? 'students' : 'the instructor'}
        </p>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
        {messages.length > 0 ? (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              {...message}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <MessageCircle size={40} className="mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        onSubmit={handleSubmit}
        className="bg-white px-4 py-3 border-t flex items-center"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow mr-2"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !newMessage.trim()}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default CourseChat;
