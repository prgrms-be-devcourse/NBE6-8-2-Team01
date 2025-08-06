// src/app/bookbook/MessagePopup/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';
import { MessageResponse } from '../types/chat';

// STOMP 관련 타입 정의
interface StompClient {
  connect: (headers: any, connectCallback: (frame: any) => void, errorCallback: (error: any) => void) => void;
  disconnect: () => void;
  subscribe: (destination: string, callback: (message: any) => void) => any;
  send: (destination: string, headers: any, body: string) => void;
  debug: (message: string) => void;
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
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!roomId) return;

    // WebSocket 연결 설정
    const connectWebSocket = async () => {
      try {
        // SockJS와 STOMP 라이브러리 동적 로드
        const SockJS = (await import('sockjs-client')).default;
        const { Stomp } = await import('@stomp/stompjs');

        const socket = new SockJS(`${process.env.NEXT_PUBLIC_API_BASE_URL}/ws/chat`);
        const stompClient: StompClient = Stomp.over(socket);

        // 디버그 로그 비활성화 (선택사항)
        stompClient.debug = () => {};

        stompClient.connect(
          {},
          (frame: any) => {
            console.log('🔌 WebSocket 연결 성공:', frame);
            setIsConnected(true);
            setError(null);
            stompClientRef.current = stompClient;

            // 채팅방 구독
            subscriptionRef.current = stompClient.subscribe(
              `/topic/chat/${roomId}`,
              (message: any) => {
                try {
                  const receivedMessage: MessageResponse = JSON.parse(message.body);
                  console.log('📨 새 메시지 수신:', receivedMessage);
                  
                  setMessages(prev => [...prev, receivedMessage]);
                  onNewMessage(receivedMessage);
                } catch (err) {
                  console.error('메시지 파싱 오류:', err);
                }
              }
            );

            // 채팅방 입장 알림
            stompClient.send('/app/chat.addUser', {}, roomId);
          },
          (error: any) => {
            console.error('❌ WebSocket 연결 실패:', error);
            setIsConnected(false);
            setError('실시간 채팅 연결에 실패했습니다.');
            
            // 재연결 시도 (3초 후)
            setTimeout(() => {
              console.log('🔄 WebSocket 재연결 시도...');
              connectWebSocket();
            }, 3000);
          }
        );

        return stompClient;
      } catch (err) {
        console.error('WebSocket 설정 오류:', err);
        setError('WebSocket 설정 중 오류가 발생했습니다.');
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
  const sendMessage = (content: string) => {
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

  const markAsRead = () => {
    if (stompClientRef.current) {
      console.log('📖 읽음 상태 업데이트:', roomId);
      stompClientRef.current.send('/app/chat.markAsRead', {}, roomId);
    }
  };

  return { markAsRead };
};

// WebSocket 연결 상태를 확인하는 훅
export const useWebSocketConnection = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};