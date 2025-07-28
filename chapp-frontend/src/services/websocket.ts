import type { Message, BaseMsgReq, WebSocketResponse, DeleteMsgResPayload, EditMsgResPayload } from '../types/message';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private onMessageCreated: (message: Message) => void = () => {};
  private onMessageDeleted: (msgId: string) => void = () => {};
  private onMessageEdited: (msgId: string, content: string) => void = () => {};
  private onConnectionChange: (connected: boolean) => void = () => {};

  connect(): void {
    //this.ws = new WebSocket('wss://9cdb53b686a6.ngrok-free.app/ws/chat');
    this.ws = new WebSocket('ws://localhost:8080/ws/chat');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.onConnectionChange(true);
    };

    this.ws.onmessage = (event) => {
      try {
        console.log('Raw WebSocket data:', event.data);
        console.log('Type of event.data:', typeof event.data);
        
        let response;
        
        // Handle double-encoded JSON
        if (typeof event.data === 'string') {
          response = JSON.parse(event.data);
          
          // If response is still a string, parse again (double-encoded)
          if (typeof response === 'string') {
            console.log('Double-encoded JSON detected, parsing again...');
            response = JSON.parse(response);
          }
        } else {
          response = event.data;
        }
        
        console.log('Final parsed response:', response);
        console.log('Type of final response:', typeof response);
        console.log('Object.keys(response):', Object.keys(response));
        
        const msgType = response.msgType;
        const payload = response.payload;
        
        console.log('Extracted msgType:', msgType);
        console.log('Extracted payload:', payload);
        
        switch (msgType) {
          case 'create':
            const message = payload as Message;
            console.log('Processing create message:', message);
            this.onMessageCreated(message);
            break;
            
          case 'delete':
            const deletePayload = payload as DeleteMsgResPayload;
            console.log('Processing delete message:', deletePayload);
            this.onMessageDeleted(deletePayload.msgId); // Using correct lowercase msgId
            break;
            
          case 'edit':
            const editPayload = payload as EditMsgResPayload;
            console.log('Processing edit message:', editPayload);
            this.onMessageEdited(editPayload.msgId, editPayload.content); // Using correct lowercase properties
            break;
            
          default:
            console.warn('Unknown WebSocket message type:', msgType);
            console.log('Available properties:', Object.keys(response));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        console.log('Raw data that failed to parse:', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.onConnectionChange(false);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onConnectionChange(false);
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(message: Message): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const request: BaseMsgReq = {
        reqType: 'create',
        payload: message,
      };
      this.ws.send(JSON.stringify(request));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Event handlers for different message types
  onMessageCreate(callback: (message: Message) => void): void {
    this.onMessageCreated = callback;
  }

  onMessageDelete(callback: (msgId: string) => void): void {
    this.onMessageDeleted = callback;
  }

  onMessageEdit(callback: (msgId: string, content: string) => void): void {
    this.onMessageEdited = callback;
  }

  onConnection(callback: (connected: boolean) => void): void {
    this.onConnectionChange = callback;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsService = new WebSocketService(); 