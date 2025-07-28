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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="message-list">
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