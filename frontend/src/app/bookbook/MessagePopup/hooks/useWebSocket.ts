// src/app/bookbook/MessagePopup/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

// MessageResponse 타입 정의 (Java DTO와 일치)
interface MessageResponse {
  id: number;
  roomId: string;
  senderId: number;
  senderNickname: string;
  senderProfileImage?: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  isRead: boolean;
  readTime?: string;
  createdDate: string;
  isMine: boolean;
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
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!roomId) return;

    const connectWebSocket = (): void => {
      try {
        // WebSocket URL 구성 (HTTP/HTTPS에 따라 WS/WSS 결정)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
        
        console.log('🔌 WebSocket 연결 시도:', wsUrl);
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = (): void => {
          console.log('🔌 WebSocket 연결 성공');
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;

          // 채팅방 입장 메시지 전송
          const joinMessage = {
            type: 'JOIN',
            roomId: roomId,
            timestamp: new Date().toISOString()
          };
          ws.send(JSON.stringify(joinMessage));
        };

        ws.onmessage = (event: MessageEvent): void => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 새 메시지 수신:', data);
            
            // 메시지 타입에 따른 처리
            if (data.type === 'MESSAGE') {
              const receivedMessage: MessageResponse = {
                id: data.id || Date.now(),
                roomId: data.roomId,
                content: data.content,
                senderId: data.senderId,
                senderNickname: data.senderNickname || '익명',
                senderProfileImage: data.senderProfileImage,
                createdDate: data.createdDate || new Date().toISOString(),
                messageType: data.messageType || 'TEXT',
                isRead: data.isRead || false,
                readTime: data.readTime,
                isMine: data.isMine || false
              };
              
              setMessages(prev => [...prev, receivedMessage]);
              onNewMessage(receivedMessage);
            }
          } catch (error: unknown) {
            console.error('메시지 파싱 오류:', error);
          }
        };

        ws.onclose = (event: CloseEvent): void => {
          console.log('🔌 WebSocket 연결 종료:', event.code, event.reason);
          setIsConnected(false);
          wsRef.current = null;

          // 정상 종료가 아닌 경우 재연결 시도
          if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`🔄 WebSocket 재연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts}) ${delay}ms 후...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connectWebSocket();
            }, delay);
          } else if (reconnectAttempts.current >= maxReconnectAttempts) {
            setError('최대 재연결 시도 횟수를 초과했습니다. 페이지를 새로고침해주세요.');
          }
        };

        ws.onerror = (error: Event): void => {
          console.error('❌ WebSocket 오류:', error);
          setError('WebSocket 연결 중 오류가 발생했습니다.');
        };

      } catch (error: unknown) {
        console.error('WebSocket 설정 오류:', error);
        let errorMessage = 'WebSocket 설정 중 오류가 발생했습니다.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setError(errorMessage);
      }
    };

    connectWebSocket();

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      console.log('🔌 WebSocket 연결 해제');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
      setIsConnected(false);
    };
  }, [roomId, onNewMessage]);

  // 메시지 전송 함수
  const sendMessage = (content: string): void => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket이 연결되지 않았습니다.');
      setError('메시지를 전송할 수 없습니다. 연결을 확인해주세요.');
      return;
    }

    const messageData = {
      type: 'MESSAGE',
      roomId,
      content,
      messageType: 'TEXT',
      timestamp: new Date().toISOString()
    };

    console.log('📤 WebSocket으로 메시지 전송:', messageData);
    wsRef.current.send(JSON.stringify(messageData));
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
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 기존 WebSocket 연결 재사용 또는 새로 생성
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = typeof window !== 'undefined' ? `${protocol}//${window.location.host}/ws/chat` : '';
    
    if (wsUrl && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
      wsRef.current = new WebSocket(wsUrl);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const markAsRead = (): void => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('📖 읽음 상태 업데이트:', roomId);
      const readMessage = {
        type: 'READ',
        roomId,
        timestamp: new Date().toISOString()
      };
      wsRef.current.send(JSON.stringify(readMessage));
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