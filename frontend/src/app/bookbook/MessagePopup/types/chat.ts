// src/app/bookbook/MessagePopup/types/chat.ts

export interface MessageResponse {
    id: number;        // Integer -> number (JavaScript/TypeScript에서는 구분 없음)
    roomId: string;
    senderId: number;
    senderNickname: string;
    senderProfileImage?: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
    isRead: boolean;
    readTime?: string;
    createdDate: string;
    isMine: boolean;
  }
  
  export interface ChatRoomResponse {
    id: number;        // Integer -> number (JavaScript/TypeScript에서는 구분 없음)
    roomId: string;
    rentId: number;
    bookTitle: string;
    bookImage?: string;
    otherUserId: number;
    otherUserNickname: string;
    otherUserProfileImage?: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    isActive: boolean;
    createdDate: string;
  }
  
  export interface ChatRoomCreateRequest {
    rentId: number;
    lenderId: number;
  }
  
  export interface MessageSendRequest {
    roomId: string;
    content: string;
    messageType?: 'TEXT' | 'IMAGE' | 'SYSTEM';
  }
  
  export interface ApiResponse<T> {
    statusCode: string;
    message: string;
    data: T;
  }