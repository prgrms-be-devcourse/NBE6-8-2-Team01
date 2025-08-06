// src/app/bookbook/MessagePopup/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { MessageResponse } from '../types/chat';

// SockJS와 STOMP 정적 import (권장)
// 만약 동적 import가 필요하다면 아래 주석을 해제하세요
// import SockJS from 'sockjs-client';
// import { Stomp } from '@stomp/stompjs';

// SockJS 타입 정의
interface SockJSClass {
  new (url: string): WebSocket;
}

// STOMP Frame 타입 정의
interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

// STOMP Message 타입 정의
interface StompMessage {
  body: string;
  headers: Record<string, string>;
}

// STOMP Subscription 타입 정의
interface StompSubscription {
  unsubscribe: () => void;
}

// STOMP Client 타입 정의
interface StompClient {
  connect: (
    headers: Record<string, string>, 
    connectCallback: (frame: StompFrame) => void, 
    errorCallback: (error: Error | string) => void
  ) => void;
  disconnect: () => void;
  subscribe: (destination: string, callback: (message: StompMessage) => void) => StompSubscription;
  send: (destination: string, headers: Record<string, string>, body: string) => void;
  debug: (message: string) => void;
}

// STOMP over 함수 타입 정의
interface StompStatic {
  over: (socket: WebSocket) => StompClient;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: string) => void;
  messages: MessageResponse[];
  error: string | null;
}

export const useWebSocket = (
  roomId: string,
  onNewMessage: (message: MessageResponse) => void
): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const stompClientRef = useRef<StompClient | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  useEffect(() => {
    if (!roomId) return;

    // WebSocket 연결 설정
    const connectWebSocket = async (): Promise<StompClient | null> => {
      try {
        // 동적 import 사용
        const [SockJSModule, { Stomp }] = await Promise.all([
          import('sockjs-client'),
          import('@stomp/stompjs')
        ]);
        
        // SockJS는 default export
        const SockJS = SockJSModule.default;
        
        if (!SockJS || !Stomp) {
          throw new Error('SockJS 또는 STOMP 라이브러리를 로드할 수 없습니다.');
        }

        const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/chat`);
        const stompClient: StompClient = Stomp.over(socket);

        // 디버그 로그 비활성화 (선택사항)
        stompClient.debug = () => {};

        stompClient.connect(
          {},
          (frame: StompFrame) => {
            console.log('🔌 WebSocket 연결 성공:', frame);
            setIsConnected(true);
            setError(null);
            stompClientRef.current = stompClient;

            // 채팅방 구독
            subscriptionRef.current = stompClient.subscribe(
              `/topic/chat/${roomId}`,
              (message: StompMessage) => {
                try {
                  const receivedMessage: MessageResponse = JSON.parse(message.body);
                  console.log('📨 새 메시지 수신:', receivedMessage);
                  
                  setMessages(prev => [...prev, receivedMessage]);
                  onNewMessage(receivedMessage);
                } catch (error: unknown) {
                  console.error('메시지 파싱 오류:', error);
                }
              }
            );

            // 채팅방 입장 알림
            stompClient.send('/app/chat.addUser', {}, roomId);
          },
          (error: Error | string) => {
            console.error('❌ WebSocket 연결 실패:', error);
            setIsConnected(false);
            
            // error 타입 가드 처리
            let errorMessage = '실시간 채팅 연결에 실패했습니다.';
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }
            
            setError(errorMessage);
            
            // 재연결 시도 (3초 후)
            setTimeout(() => {
              console.log('🔄 WebSocket 재연결 시도...');
              connectWebSocket();
            }, 3000);
          }
        );

        return stompClient;
      } catch (error: unknown) {
        console.error('WebSocket 설정 오류:', error);
        
        // error 타입 가드 처리
        let errorMessage = 'WebSocket 설정 중 오류가 발생했습니다.';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        setError(errorMessage);
        return null;
      }
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      console.log('🔌 WebSocket 연결 해제');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
      setIsConnected(false);
    };
  }, [roomId, onNewMessage]);

  // 메시지 전송 함수
  const sendMessage = (content: string): void => {
    if (!stompClientRef.current || !isConnected) {
      console.error('❌ WebSocket이 연결되지 않았습니다.');
      return;
    }

    const messageData = {
      roomId,
      content,
      messageType: 'TEXT'
    };

    console.log('📤 WebSocket으로 메시지 전송:', messageData);
    stompClientRef.current.send('/app/chat.sendMessage', {}, JSON.stringify(messageData));
  };

  return {
    isConnected,
    sendMessage,
    messages,
    error
  };
};

// 실시간 채팅을 위한 추가 훅 (읽음 상태 처리)
export const useWebSocketReadStatus = (roomId: string) => {
  const stompClientRef = useRef<StompClient | null>(null);

  const markAsRead = (): void => {
    if (stompClientRef.current) {
      console.log('📖 읽음 상태 업데이트:', roomId);
      stompClientRef.current.send('/app/chat.markAsRead', {}, roomId);
    }
  };

  return { markAsRead };
};

// WebSocket 연결 상태를 확인하는 훅
export const useWebSocketConnection = () => {
  const [isOnline, setIsOnline] = useState(() => {
    // SSR 환경에서는 navigator가 undefined일 수 있으므로 체크
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true; // 기본값으로 true 반환
  });

  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return { isOnline };
};