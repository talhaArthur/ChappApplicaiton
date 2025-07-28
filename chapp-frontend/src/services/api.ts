import type { Message, DeleteMsgPayload, EditMsgPayload } from '../types/message';

const API_BASE_URL = 'http://localhost:8080';

export const messageApi = {
  // Get all messages
  getAllMessages: async (): Promise<Message[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/msg`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const text = await response.text();
      
      // Handle empty response
      if (!text || text.trim() === '') {
        return [];
      }
      
      // Parse JSON
      const parsed = JSON.parse(text);
      
      if (Array.isArray(parsed)) {
        // If it's already an array, return as is
        return parsed;
      } else if (parsed && typeof parsed === 'object') {
        // If it's an object (like your server returns), extract the values
        // Use the root-level keys as the actual message IDs for operations
        const messages = Object.entries(parsed).map(([rootKey, messageData]) => ({
          ...(messageData as Message),
          id: rootKey, // Use root key as the operational ID
          originalId: (messageData as Message).id, // Keep original nested ID for reference
        }));
        
        // Sort messages by time (oldest first)
        return messages.sort((a, b) => (a.time || 0) - (b.time || 0));
      } else {
        // If it's neither array nor object, return empty array
        return [];
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      return []; // Always return an array on error
    }
  },

  // Create new message via HTTP
  createMessage: async (message: Message): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/msg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    if (!response.ok) {
      throw new Error('Failed to create message');
    }
  },

  // Delete message
  deleteMessage: async (payload: DeleteMsgPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/msg`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  },

  // Update message
  updateMessage: async (payload: EditMsgPayload): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/msg`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Failed to update message');
    }
  },
}; 