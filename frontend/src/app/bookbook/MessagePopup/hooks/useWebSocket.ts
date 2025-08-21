// src/app/bookbook/MessagePopup/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// MessageResponse 타입 정의 (기존과 동일)
interface MessageResponse {
  id: number;
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

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: string) => void;
  markAsRead: () => void;
  error: string | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const useWebSocket = (
  roomId: string,
  onNewMessage: (message: MessageResponse) => void
): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const onNewMessageRef = useRef(onNewMessage);
  const mountedRef = useRef(true);
  const isConnectingRef = useRef(false);
  
  const maxReconnectAttempts = 5;

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/v1/bookbook/users/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.id) {
            setCurrentUserId(result.data.id);
            console.log('🆔 현재 사용자 ID:', result.data.id);
          }
        } else {
          console.error('❌ 사용자 정보 조회 실패:', response.status);
        }
      } catch (error) {
        console.error('❌ 사용자 정보 조회 오류:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // onNewMessage ref 업데이트
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  // 컴포넌트 마운트 상태 추적
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 메시지 수신 콜백 (의존성 없이 고정)
  const handleMessageReceived = useCallback((message: MessageResponse) => {
    if (!mountedRef.current) return;
    
    // 현재 사용자 ID가 있으면 isMine 값을 올바르게 계산
    if (currentUserId !== null) {
      message.isMine = message.senderId === currentUserId;
    }
    
    console.log('📨 새 메시지 수신:', message);
    onNewMessageRef.current(message);
  }, [currentUserId]); // currentUserId를 의존성에 추가

  // 연결 정리 함수
  const cleanupConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (clientRef.current) {
      try {
        if (clientRef.current.connected) {
          // 채팅방 나가기 알림
          clientRef.current.publish({
            destination: '/app/chat.leaveUser',
            body: roomId
          });
        }
        clientRef.current.deactivate();
      } catch (error) {
        console.error('❌ STOMP 해제 오류:', error);
      }
      clientRef.current = null;
    }

    isConnectingRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (!roomId || currentUserId === null) {
      console.log('❌ roomId 또는 currentUserId가 없습니다.');
      return;
    }

    const connectSTOMP = (): void => {
      // 이미 연결 중이거나 컴포넌트가 언마운트된 경우 중단
      if (isConnectingRef.current || !mountedRef.current) {
        return;
      }

      try {
        isConnectingRef.current = true;
        setConnectionStatus('connecting');
        setError(null);
        console.log('🔌 STOMP 연결 시도...');

        // 기존 연결이 있다면 해제
        if (clientRef.current) {
          clientRef.current.deactivate();
          clientRef.current = null;
        }

        // STOMP 클라이언트 생성
        const client = new Client({
          // SockJS를 통한 WebSocket 연결
          webSocketFactory: () => {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
            const sockJsUrl = `${baseUrl}/ws/chat`;
            console.log('🔗 SockJS URL:', sockJsUrl);
            
            try {
              // SockJS 생성 시 더 안정적인 설정
              const sockJS = new SockJS(sockJsUrl, null, {
                transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
                timeout: 10000,
                sessionId: () => Math.random().toString(36).substr(2, 9)
              });
              
              return sockJS;
            } catch (error) {
              console.error('❌ SockJS 생성 실패:', error);
              throw error;
            }
          },
          
          // 연결 헤더
          connectHeaders: {
            'Cookie': document.cookie
          },
          
          // 하트비트 설정
          heartbeatIncoming: 20000,
          heartbeatOutgoing: 20000,
          
          // 디버그 로그
          debug: (str) => {
            console.log('🐛 STOMP Debug:', str);
          },
          
          // 연결 성공
          onConnect: (frame) => {
            if (!mountedRef.current) return;
            
            console.log('✅ STOMP 연결 성공:', frame);
            setIsConnected(true);
            setConnectionStatus('connected');
            setError(null);
            reconnectAttempts.current = 0;
            isConnectingRef.current = false;

            try {
              // 1. 채팅방 메시지 구독
              client.subscribe(`/topic/chat/${roomId}`, (message) => {
                if (!mountedRef.current) return;
                
                try {
                  const messageData: MessageResponse = JSON.parse(message.body);
                  console.log('📨 채팅 메시지 수신:', messageData);
                  handleMessageReceived(messageData);
                } catch (parseError) {
                  console.error('❌ 메시지 파싱 오류:', parseError);
                }
              });

              // 2. 읽음 상태 구독
              client.subscribe(`/topic/chat/${roomId}/read`, (notification) => {
                if (!mountedRef.current) return;
                console.log('📖 읽음 상태 알림:', notification.body);
              });

              // 3. 채팅방 입장 알림
              client.publish({
                destination: '/app/chat.addUser',
                body: roomId
              });

              console.log('🎯 채팅방 구독 완료:', roomId);

            } catch (subscribeError) {
              console.error('❌ 구독 설정 오류:', subscribeError);
              if (mountedRef.current) {
                setError('채팅방 구독 중 오류가 발생했습니다.');
              }
            }
          },
          
          // 연결 해제
          onDisconnect: (frame) => {
            console.log('🔌 STOMP 연결 해제:', frame);
            isConnectingRef.current = false;
            
            if (!mountedRef.current) return;
            
            setIsConnected(false);
            setConnectionStatus('disconnected');

            // 의도적인 해제가 아닌 경우 재연결 시도
            if (mountedRef.current && reconnectAttempts.current < maxReconnectAttempts) {
              const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
              console.log(`🔄 STOMP 재연결 시도 (${reconnectAttempts.current + 1}/${maxReconnectAttempts}) ${delay}ms 후...`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                  reconnectAttempts.current++;
                  connectSTOMP();
                }
              }, delay);
            } else if (reconnectAttempts.current >= maxReconnectAttempts) {
              console.error('❌ 최대 재연결 시도 횟수 초과');
              if (mountedRef.current) {
                setError('연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
                setConnectionStatus('error');
              }
            }
          },
          
          // STOMP 에러
          onStompError: (frame) => {
            console.error('❌ STOMP 에러:', frame);
            isConnectingRef.current = false;
            
            if (mountedRef.current) {
              setError(`STOMP 에러: ${frame.headers?.message || '알 수 없는 오류'}`);
              setConnectionStatus('error');
            }
          },

          // WebSocket 에러
          onWebSocketError: (event) => {
            console.error('❌ WebSocket 에러:', event);
            isConnectingRef.current = false;
            
            if (mountedRef.current) {
              setError('WebSocket 연결 중 오류가 발생했습니다.');
              setConnectionStatus('error');
            }
          },

          // WebSocket 종료
          onWebSocketClose: (event) => {
            console.log('🔌 WebSocket 연결 종료:', event);
            isConnectingRef.current = false;
          }
        });

        clientRef.current = client;
        
        // 연결 시작
        client.activate();

      } catch (error) {
        console.error('❌ STOMP 설정 오류:', error);
        isConnectingRef.current = false;
        
        if (mountedRef.current) {
          setError(error instanceof Error ? error.message : '연결 설정 중 오류가 발생했습니다.');
          setConnectionStatus('error');
        }
      }
    };

    // 초기 연결
    connectSTOMP();

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('🧹 WebSocket 정리 중...');
      cleanupConnection();
      
      if (mountedRef.current) {
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    };
  }, [roomId, currentUserId, handleMessageReceived, cleanupConnection]); // currentUserId 의존성 추가

  // 메시지 전송 함수
  const sendMessage = useCallback((content: string): void => {
    if (!content.trim()) {
      console.warn('⚠️ 빈 메시지는 전송할 수 없습니다.');
      return;
    }

    if (!clientRef.current?.connected) {
      console.error('❌ STOMP 클라이언트가 연결되지 않았습니다.');
      setError('메시지를 전송할 수 없습니다. 연결을 확인해주세요.');
      return;
    }

    try {
      const messageData = {
        roomId,
        content: content.trim(),
        messageType: 'TEXT'
      };

      console.log('📤 STOMP로 메시지 전송:', messageData);
      
      clientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(messageData)
      });

      // 전송 후 에러 초기화
      if (error) {
        setError(null);
      }

    } catch (error) {
      console.error('❌ 메시지 전송 오류:', error);
      setError('메시지 전송 중 오류가 발생했습니다.');
    }
  }, [roomId, error]);

  // 읽음 처리 함수
  const markAsRead = useCallback((): void => {
    if (!clientRef.current?.connected) {
      console.warn('⚠️ STOMP 클라이언트가 연결되지 않았습니다.');
      return;
    }

    try {
      console.log('📖 읽음 처리 요청:', roomId);
      
      clientRef.current.publish({
        destination: '/app/chat.markAsRead',
        body: roomId
      });

    } catch (error) {
      console.error('❌ 읽음 처리 오류:', error);
    }
  }, [roomId]);

  return {
    isConnected,
    sendMessage,
    markAsRead,
    error,
    connectionStatus
  };
};

// 연결 상태 확인용 별도 훅 (기존과 동일)
export const useWebSocketConnection = () => {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
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