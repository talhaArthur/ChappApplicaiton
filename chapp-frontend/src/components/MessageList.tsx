import React, { useEffect, useRef } from 'react';
import type { Message } from '../types/message';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUser: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto' 
      });
    }
  };

  useEffect(() => {
    const currentMessageCount = messages.length;
    const prevMessageCount = prevMessageCountRef.current;
    
    // Only auto-scroll if messages were actually added (not reloaded)
    if (currentMessageCount > prevMessageCount) {
      // New message added - smooth scroll
      setTimeout(() => scrollToBottom(true), 50);
    }
    
    prevMessageCountRef.current = currentMessageCount;
  }, [messages]);

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="message-list" ref={containerRef}>
      {safeMessages.length === 0 ? (
        <div className="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        safeMessages.map((message, index) => (
          <MessageItem
            key={message.id || `message-${index}-${message.time || Date.now()}`}
            message={message}
            currentUser={currentUser}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}; 