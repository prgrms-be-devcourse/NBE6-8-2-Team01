// src/app/bookbook/MessagePopup/components/ChatWindow.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MessageResponse, ApiResponse } from '../types/chat';
import { useWebSocket } from '../hooks/useWebSocket';

// 페이지 응답 타입
interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 채팅방 정보 타입
interface ChatRoomInfo {
  id: number;
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

type ChatWindowProps = {
  roomId: string;
  bookTitle?: string;
  otherUserNickname?: string;
  onBack: () => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, bookTitle, otherUserNickname, onBack }) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [chatRoomInfo, setChatRoomInfo] = useState<ChatRoomInfo | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 🚀 WebSocket 훅 사용
  const { 
    isConnected, 
    sendMessage: sendWebSocketMessage, 
    markAsRead, 
    error: websocketError,
    connectionStatus 
  } = useWebSocket(roomId, (newMessage) => {
    // 실시간으로 새 메시지 수신
    console.log('🎉 실시간 메시지 수신:', newMessage);
    
    setMessages(prev => {
      // 중복 메시지 방지
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log('⚠️ 중복 메시지 무시:', newMessage.id);
        return prev;
      }
      return [...prev, newMessage];
    });
  });

  // WebSocket 에러 처리
  useEffect(() => {
    if (websocketError) {
      console.error('WebSocket 에러:', websocketError);
      // 심각한 에러가 아니라면 사용자에게 직접 보여주지 않음
    }
  }, [websocketError]);

  // 긴 텍스트 생략 함수
  const truncateText = (text: string, maxLength: number = 25): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 이미지 URL 처리 함수
  const getImageUrl = (imageUrl: string | null | undefined): string => {
    if (!imageUrl) return 'https://i.postimg.cc/pLC9D2vW/noimg.gif';
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/uploads/')) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}${imageUrl}`;
    }
    
    if (imageUrl.startsWith('uploads/')) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL}/${imageUrl}`;
    }
    
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${imageUrl}`;
  };

  // 메시지 목록을 최하단으로 스크롤
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 책 상세페이지로 이동
  const handleBookClick = (): void => {
    if (chatRoomInfo?.rentId) {
      router.push(`/bookbook/rent/${chatRoomInfo.rentId}`);
    }
  };

  // 컴포넌트 마운트 시 채팅방 정보와 메시지 목록 로드 (REST API - 초기 로딩용)
  useEffect(() => {
    const fetchChatData = async (): Promise<void> => {
      if (!roomId) return;

      setLoading(true);
      setError(null);

      try {
        // 채팅방 정보 조회
        const roomResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/rooms/${roomId}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (roomResponse.ok) {
          const roomResult: ApiResponse<ChatRoomInfo> = await roomResponse.json();
          setChatRoomInfo(roomResult.data || null);
        }

        // 메시지 목록 조회 (기존 메시지들)
        const messagesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/rooms/${roomId}/messages?page=0&size=50`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!messagesResponse.ok) {
          if (messagesResponse.status === 401) {
            console.log('메시지 조회 권한 없음 - 인터셉터에서 처리됨');
            return;
          } else if (messagesResponse.status === 403) {
            throw new Error('채팅방에 접근할 권한이 없습니다.');
          } else if (messagesResponse.status === 404) {
            throw new Error('채팅방을 찾을 수 없습니다.');
          }
          throw new Error(`메시지 조회 실패: ${messagesResponse.status}`);
        }

        const messagesResult: ApiResponse<PageResponse<MessageResponse>> = await messagesResponse.json();
        if (messagesResult.data?.content) {
          const sortedMessages = [...messagesResult.data.content].reverse();
          setMessages(sortedMessages);
          console.log('📚 기존 메시지 로드 완료:', sortedMessages.length);
        }

      } catch (error: unknown) {
        console.error('채팅 데이터 로드 실패:', error);
        
        // error 타입 가드 처리
        let errorMessage = '채팅 데이터를 불러오는 데 실패했습니다.';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [roomId]);

  // 메시지 목록 변경 시 스크롤 이동 + 읽음 처리
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
      
      // WebSocket 연결되어 있으면 읽음 처리
      if (isConnected) {
        markAsRead();
      }
    }
  }, [messages, isConnected, markAsRead]);

  // 메시지 전송 (WebSocket + REST API 하이브리드)
  const handleSendMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageToSend = newMessage.trim();
    setNewMessage('');

    try {
      if (isConnected) {
        // 🚀 WebSocket으로 전송 (우선)
        console.log('📤 WebSocket으로 메시지 전송');
        sendWebSocketMessage(messageToSend);
        
        // WebSocket으로 전송했으면 REST API 호출 안함
        // (WebSocket에서 브로드캐스트로 자신의 메시지도 다시 받게 됨)
        
      } else {
        // 🔄 WebSocket 연결이 안되어 있으면 REST API 사용 (백업)
        console.log('📡 REST API로 메시지 전송 (WebSocket 연결 없음)');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/messages`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: roomId,
            content: messageToSend,
            messageType: 'TEXT'
          })
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('메시지 전송 권한 없음 - 인터셉터에서 처리됨');
            return;
          } else if (response.status === 403) {
            throw new Error('메시지를 보낼 권한이 없습니다.');
          }
          throw new Error(`메시지 전송 실패: ${response.status}`);
        }

        const result: ApiResponse<MessageResponse> = await response.json();
        const sentMessage = result.data;

        if (sentMessage) {
          setMessages(prev => [...prev, sentMessage]);
        }
      }

    } catch (error: unknown) {
      console.error('메시지 전송 실패:', error);
      
      // error 타입 가드 처리
      let errorMessage = '메시지 전송에 실패했습니다. 다시 시도해주세요.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
      setNewMessage(messageToSend); // 실패한 메시지 복원
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // 메시지 시간 포맷팅
  const formatMessageTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  // 날짜가 바뀌는 경우 날짜 구분선 표시 여부 확인
  const shouldShowDateSeparator = (currentMessage: MessageResponse, previousMessage?: MessageResponse): boolean => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdDate).toDateString();
    const previousDate = new Date(previousMessage.createdDate).toDateString();
    
    return currentDate !== previousDate;
  };

  // 날짜 포맷팅
  const formatDateSeparator = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  // 이미지 에러 핸들러
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    e.currentTarget.src = 'https://i.postimg.cc/pLC9D2vW/noimg.gif';
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
          <button onClick={onBack} className="mr-3">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3 className="font-medium text-lg text-gray-900">{otherUserNickname || '채팅'}</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
          <button onClick={onBack} className="mr-3">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3 className="font-medium text-lg text-gray-900">채팅</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayBookTitle = chatRoomInfo?.bookTitle || bookTitle;
  const displayOtherUserNickname = chatRoomInfo?.otherUserNickname || otherUserNickname;

  return (
    <div className="flex flex-col h-full bg-white max-w-lg mx-auto">
      {/* 헤더 - 카카오톡 스타일 + 연결 상태 표시 */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
        <button onClick={onBack} className="mr-3">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-lg text-gray-900" title={displayOtherUserNickname}>
            {truncateText(displayOtherUserNickname || '채팅', 20)}
          </h3>
          
          {/* 🔥 실시간 연결 상태 표시 */}
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400' : 
              connectionStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs text-gray-500">
              {connectionStatus === 'connected' ? '실시간 연결됨' : 
               connectionStatus === 'connecting' ? '연결 중...' : 
               connectionStatus === 'error' ? '연결 오류' : '연결 끊김'}
            </span>
          </div>
        </div>
      </div>

      {/* 책 정보 카드 */}
      {chatRoomInfo && (
        <div 
          onClick={handleBookClick}
          className="px-4 py-3 border-b border-gray-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {/* 책 이미지 */}
            <div className="flex-shrink-0">
              <img
                src={getImageUrl(chatRoomInfo.bookImage)}
                alt={chatRoomInfo.bookTitle}
                className="w-12 h-12 object-cover rounded border border-gray-200"
                onError={handleImageError}
              />
            </div>
            
            {/* 책 정보 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900" title={chatRoomInfo.bookTitle}>
                {truncateText(chatRoomInfo.bookTitle, 35)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                📖 책 상세보기
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 메시지 영역 - 카카오톡 스타일 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-gray-500 text-sm">대화를 시작해보세요</p>
              {/* 연결 상태에 따른 추가 안내 */}
              {connectionStatus !== 'connected' && (
                <p className="text-orange-500 text-xs mt-2">
                  실시간 연결을 준비하고 있습니다...
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                {/* 날짜 구분선 */}
                {shouldShowDateSeparator(message, messages[index - 1]) && (
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 text-xs text-gray-500 bg-white rounded-full border">
                      {formatDateSeparator(message.createdDate)}
                    </span>
                  </div>
                )}

                {/* 메시지 */}
                <div className="mb-2">
                  {message.messageType === 'SYSTEM' ? (
                    // 시스템 메시지
                    <div className="flex justify-center my-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {message.content}
                      </span>
                    </div>
                  ) : (
                    // 일반 메시지 - 카카오톡 스타일
                    <div className={`flex ${message.isMine ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`flex ${message.isMine ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[75%]`}>
                        {/* 메시지 버블 */}
                        <div
                          className={`px-3 py-2 rounded-lg text-sm ${
                            message.isMine 
                              ? 'bg-yellow-300 text-gray-900' // 카카오톡 노란색
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {message.content}
                        </div>
                        
                        {/* 시간 표시 */}
                        <span className={`text-xs text-gray-400 ${message.isMine ? 'mr-2' : 'ml-2'} mb-1`}>
                          {formatMessageTime(message.createdDate)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
            
            {/* 스크롤 앵커 */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 메시지 입력창 - 카카오톡 스타일 + 연결 상태 표시 */}
      <div className="border-t border-gray-200 bg-white p-3">
        {/* WebSocket 연결 상태에 따른 알림 (연결이 안 될 때만 표시) */}
        {connectionStatus !== 'connected' && (
          <div className="mb-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-600">
            {connectionStatus === 'connecting' ? '실시간 연결 중...' : 
             connectionStatus === 'error' ? '실시간 연결 오류 (메시지는 전송 가능)' : 
             '실시간 연결 끊김 (메시지는 전송 가능)'}
          </div>
        )}
        
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              !newMessage.trim() || sending
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            title={isConnected ? '실시간 전송' : 'REST API 전송'}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;