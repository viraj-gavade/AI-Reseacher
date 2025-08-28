import React from 'react';
import type { Message } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`chat-message flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        {/* Message bubble */}
        <div className={`rounded-lg px-4 py-2 max-w-[85%] ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-muted-foreground rounded-bl-sm'
        }`}>
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size={14} />
                <span className="text-xs opacity-70">Thinking...</span>
              </div>
            ) : (
              message.content
            )}
          </div>
          
          {/* Timestamp */}
          {!message.isLoading && (
            <div className={`text-xs mt-1 opacity-70 ${
              isUser ? 'text-right' : 'text-left'
            }`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChatMessage };
