export interface Message {
  id: string;
  author: string;
  content: string;
  time: number;
  originalId?: string; // Optional field to store the nested ID from server
}

export interface DeleteMsgPayload {
  msgId: string;
  author: string;
}

export interface EditMsgPayload {
  msgId: string;
  author: string;
  content: string;
}

export interface BaseMsgReq {
  reqType: string;
  payload: any;
}

// WebSocket Response Types - matching server format
export interface WebSocketResponse {
  msgType: string;  // lowercase to match server
  payload: any;     // lowercase to match server
}

export interface DeleteMsgResPayload {
  msgId: string;
}

export interface EditMsgResPayload {
  msgId: string;
  content: string;
} 