// src/app/bookbook/MessagePopup/MessagePanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Clock, User, LogOut, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatRoomResponse, ApiResponse } from './types/chat';

// 페이지 응답 타입 추가
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

interface MessagePanelProps {
  onClose: () => void;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ onClose }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [leavingRoomId, setLeavingRoomId] = useState<string | null>(null);
  
  const router = useRouter();

  // 채팅방 목록 조회
  const fetchChatRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      // 채팅방 목록 조회
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/rooms?page=0&size=20`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // 401 에러는 인터셉터에서 처리되므로 여기서는 무시
          console.log('채팅방 목록 조회 권한 없음 - 인터셉터에서 처리됨');
          return;
        }
        throw new Error(`채팅방 목록 조회 실패: ${response.status}`);
      }

      // 백엔드에서 Page<ChatRoomResponse> 형태로 반환하므로 수정
      const result: ApiResponse<PageResponse<ChatRoomResponse>> = await response.json();
      
      // 백엔드에서 이미 필터링된 결과만 반환하므로 추가 필터링 불필요
      setChatRooms(result.data?.content || []);

      // 읽지 않은 메시지 총 개수 조회
      const unreadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/unread-count`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (unreadResponse.ok) {
        const unreadResult: ApiResponse<number> = await unreadResponse.json();
        setUnreadCount(unreadResult.data || 0);
      }

    } catch (error: unknown) {
      console.error('채팅방 목록 조회 실패:', error);
      
      // error 타입 가드 처리
      let errorMessage = '채팅방 목록을 불러오는 데 실패했습니다.';
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

  useEffect(() => {
    fetchChatRooms();
  }, []);

  // 채팅방 클릭 핸들러
  const handleChatRoomClick = (chatRoom: ChatRoomResponse) => {
    onClose(); // 패널 닫기
    router.push(`/bookbook/MessagePopup/${chatRoom.roomId}?bookTitle=${encodeURIComponent(chatRoom.bookTitle)}&otherUserNickname=${encodeURIComponent(chatRoom.otherUserNickname)}`);
  };

  // 채팅방 나가기 핸들러
  const handleLeaveChatRoom = async (roomId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 채팅방 클릭 이벤트 방지
    
    if (!confirm('이 채팅방을 나가시겠습니까?\n나간 후에는 이전 대화 내용을 볼 수 없습니다.')) {
      return;
    }

    setLeavingRoomId(roomId);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/rooms/${roomId}/leave`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('채팅방 나가기 권한이 없습니다.');
        } else if (response.status === 404) {
          throw new Error('존재하지 않는 채팅방입니다.');
        } else {
          throw new Error(`채팅방 나가기 실패: ${response.status}`);
        }
      }

      // 로컬 상태에서 채팅방 제거
      setChatRooms(prev => prev.filter(room => room.roomId !== roomId));
      
      // 읽지 않은 메시지 개수 다시 조회
      const unreadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/bookbook/chat/unread-count`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (unreadResponse.ok) {
        const unreadResult: ApiResponse<number> = await unreadResponse.json();
        setUnreadCount(unreadResult.data || 0);
      }

      alert('채팅방을 나갔습니다.');
      
    } catch (error: unknown) {
      console.error('채팅방 나가기 실패:', error);
      
      let errorMessage = '채팅방 나가기에 실패했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLeavingRoomId(null);
      setShowMenu(null);
    }
  };

  // 메뉴 토글 핸들러
  const toggleMenu = (roomId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 채팅방 클릭 이벤트 방지
    setShowMenu(showMenu === roomId ? null : roomId);
  };

  // 시간 포맷팅
  const formatTime = (dateString?: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  // 메시지 내용 미리보기 (길이 제한)
  const truncateMessage = (message: string, maxLength: number = 50): string => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // 외부 클릭시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(null);
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="fixed inset-0 flex justify-end z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white w-96 h-full shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">메시지</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // 로딩 상태
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-500 text-base">채팅방을 불러오는 중...</p>
              </div>
            </div>
          ) : error ? (
            // 에러 상태
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="text-5xl mb-4">😅</div>
                <p className="text-red-500 text-base mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base">
                  다시 시도
                </button>
              </div>
            </div>
          ) : chatRooms.length === 0 ? (
            // 채팅방이 없는 경우
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="text-7xl mb-4">💬</div>
                <p className="text-gray-500 text-xl mb-3">아직 채팅방이 없습니다</p>
                <p className="text-gray-400 text-base">책을 빌리거나 빌려주면서</p>
                <p className="text-gray-400 text-base">새로운 대화를 시작해보세요!</p>
              </div>
            </div>
          ) : (
            // 채팅방 목록
            <div className="divide-y divide-gray-100">
              {chatRooms.map((chatRoom) => (
                <div
                  key={chatRoom.id}
                  className="relative p-5 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div 
                    onClick={() => handleChatRoomClick(chatRoom)}
                    className="flex items-start space-x-4">
                    {/* 프로필 아이콘 */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-7 h-7 text-gray-500" />
                      </div>
                    </div>

                    {/* 채팅 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {chatRoom.otherUserNickname}
                        </h3>
                        {/* 읽지 않은 메시지 개수를 메뉴 버튼과 겹치지 않게 왼쪽으로 이동 */}
                        <div className="flex items-center space-x-2 mr-10">
                          {chatRoom.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chatRoom.unreadCount > 99 ? '99+' : chatRoom.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 책 제목 */}
                      <p className="text-sm text-gray-500 mb-2 truncate">
                        {chatRoom.bookTitle}
                      </p>

                      {/* 마지막 메시지 */}
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {chatRoom.lastMessage 
                          ? truncateMessage(chatRoom.lastMessage)
                          : '새로운 채팅방이 생성되었습니다.'
                        }
                      </p>

                      {/* 시간 - 맨 아래로 이동 */}
                      <div className="flex justify-end">
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(chatRoom.lastMessageTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 메뉴 버튼 - 항상 보이게 변경 */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => toggleMenu(chatRoom.roomId, e)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      title="채팅방 옵션">
                      <MoreVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>

                    {/* 나가기 메뉴 */}
                    {showMenu === chatRoom.roomId && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                        <button
                          onClick={(e) => handleLeaveChatRoom(chatRoom.roomId, e)}
                          disabled={leavingRoomId === chatRoom.roomId}
                          className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                          {leavingRoomId === chatRoom.roomId ? (
                            <>
                              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>나가는 중...</span>
                            </>
                          ) : (
                            <>
                              <LogOut className="w-4 h-4" />
                              <span>채팅방 나가기</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 */}
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 text-center">
            💡 북북톡으로 책을 안전하게 거래하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel;