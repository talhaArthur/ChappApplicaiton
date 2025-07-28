import React, { useState } from 'react';
import type { Message } from '../types/message';

interface MessageItemProps {
  message: Message;
  currentUser: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwnMessage = message.author === currentUser;
  
  // Handle Unix timestamp (seconds) - convert to milliseconds for JavaScript Date
  const timestamp = message.time ? message.time * 1000 : Date.now();
  const messageTime = new Date(timestamp).toLocaleTimeString();

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className={`message-item ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      <div className="message-header">
        <span className="message-author">{message.author}</span>
        <span className="message-time">{messageTime}</span>
      </div>
      
      {isEditing ? (
        <div className="message-edit">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleEdit();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
          <div className="message-edit-buttons">
            <button onClick={handleEdit} className="btn-save">Save</button>
            <button onClick={handleCancel} className="btn-cancel">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="message-content">
          <p>{message.content}</p>
          {isOwnMessage && (
            <div className="message-actions">
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => onDelete(message.id)} className="btn-delete">
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 