import React, { useState, useEffect } from 'react';
import type { Message } from './types/message';
import { messageApi } from './services/api';
import { wsService } from './services/websocket';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { UserSetup } from './components/UserSetup';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load initial messages when component mounts
  useEffect(() => {
    if (currentUser) {
      loadMessages();
    }
  }, [currentUser]);

  // Set up WebSocket connection when user is set
  useEffect(() => {
    if (currentUser) {
      // Handle new message creation
      wsService.onMessageCreate((message) => {
        // For new messages, reload to get correct server IDs
        loadMessages();
      });

      // Handle message deletion
      wsService.onMessageDelete((msgId) => {
        setMessages(prev => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          return currentMessages.filter(msg => msg.id !== msgId);
        });
      });

      // Handle message editing
      wsService.onMessageEdit((msgId, content) => {
        setMessages(prev => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          return currentMessages.map(msg => 
            msg.id === msgId ? { ...msg, content } : msg
          );
        });
      });

      wsService.onConnection(setIsConnected);
      wsService.connect();

      return () => {
        wsService.disconnect();
      };
    }
  }, [currentUser]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const fetchedMessages = await messageApi.getAllMessages();
      // Ensure we always set an array
      setMessages(Array.isArray(fetchedMessages) ? fetchedMessages : []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleSendMessage = (content: string) => {
    if (!currentUser || !content.trim()) return;

    const newMessage: Message = {
      id: generateMessageId(),
      author: currentUser,
      content: content.trim(),
      time: Math.floor(Date.now() / 1000),
    };

    // Send via WebSocket for real-time updates
    if (wsService.isConnected()) {
      wsService.sendMessage(newMessage);
      // WebSocket "create" handler will reload messages to get correct server IDs
    } else {
      // Fallback to HTTP if WebSocket is not available
      messageApi.createMessage(newMessage)
        .then(() => {
          loadMessages(); // Reload to get proper server IDs
        })
        .catch(error => {
          console.error('Failed to send message:', error);
        });
    }
  };

  const handleEditMessage = async (id: string, content: string) => {
    try {
      await messageApi.updateMessage({
        msgId: id,
        author: currentUser,
        content: content,
      });

      // Note: WebSocket "edit" broadcast will update the UI automatically
      // No need to manually update local state here
    } catch (error) {
      console.error('Failed to edit message:', error);
      alert('Failed to edit message. Please try again.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await messageApi.deleteMessage({
        msgId: id,
        author: currentUser,
      });

      // Note: WebSocket "delete" broadcast will update the UI automatically
      // No need to manually update local state here
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  if (!currentUser) {
    return <UserSetup onUserSet={setCurrentUser} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Chapp - Real-time Chat</h1>
        <div className="header-info">
          <span className="user-info">User: {currentUser}</span>
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </header>

      <main className="chat-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : (
          <MessageList
            messages={messages}
            currentUser={currentUser}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
        )}
        
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected && !loading}
        />
      </main>

      <footer className="app-footer">
        <p>
          Backend Features: WebSocket Real-time, REST API (GET, POST, PUT, DELETE)
        </p>
      </footer>
    </div>
  );
}

export default App;
