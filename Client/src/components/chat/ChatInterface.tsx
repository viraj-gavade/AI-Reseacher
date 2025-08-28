import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { Message } from '../../types';
import { ChatMessage } from './ChatMessage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { chatApi } from '../../utils/api';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    // Add user message and loading indicator
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call API
      const response = await chatApi.sendMessage(userMessage.content);
      
      if (response.success && response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: response.data.message,
          role: 'assistant',
          timestamp: new Date(),
        };

        // Replace loading message with actual response
        setMessages(prev => 
          prev.filter(msg => !msg.isLoading).concat([assistantMessage])
        );
      } else {
        // Handle error
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: `Sorry, I encountered an error: ${response.error || 'Unknown error'}`,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages(prev => 
          prev.filter(msg => !msg.isLoading).concat([errorMessage])
        );
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => 
        prev.filter(msg => !msg.isLoading).concat([errorMessage])
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            icon={Send}
          />
        </form>
      </div>
    </div>
  );
};

export { ChatInterface };
