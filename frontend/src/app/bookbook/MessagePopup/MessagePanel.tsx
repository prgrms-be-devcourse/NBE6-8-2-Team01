// src/app/bookbook/MessagePopup/MessagePanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Clock, User } from 'lucide-react';
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
  
  const router = useRouter();

  // 채팅방 목록 조회
  useEffect(() => {
    const fetchChatRooms = async () => {
      setLoading(true);
      setError(null);

      try {
        // 채팅방 목록 조회
        const response = await fetch('http://localhost:8080/api/v1/bookbook/chat/rooms?page=0&size=20', {
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
        setChatRooms(result.data?.content || []);

        // 읽지 않은 메시지 총 개수 조회
        const unreadResponse = await fetch('http://localhost:8080/api/v1/bookbook/chat/unread-count', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (unreadResponse.ok) {
          const unreadResult: ApiResponse<number> = await unreadResponse.json();
          setUnreadCount(unreadResult.data || 0);
        }

      } catch (err: any) {
        console.error('채팅방 목록 조회 실패:', err);
        setError(err.message || '채팅방 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, []);

  // 채팅방 클릭 핸들러
  const handleChatRoomClick = (chatRoom: ChatRoomResponse) => {
    onClose(); // 패널 닫기
    router.push(`/bookbook/MessagePopup/${chatRoom.roomId}?bookTitle=${encodeURIComponent(chatRoom.bookTitle)}&otherUserNickname=${encodeURIComponent(chatRoom.otherUserNickname)}`);
  };

  // 시간 포맷팅
  const formatTime = (dateString?: string) => {
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
  const truncateMessage = (message: string, maxLength: number = 50) => { // 30 → 50으로 늘림
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="fixed inset-0 flex justify-end z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}> {/* 인라인 스타일로 반투명 배경 적용 */}
      <div className="bg-white w-96 h-full shadow-xl overflow-hidden"> {/* w-64 → w-96으로 1.5배 확대 (384px) */}
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50"> {/* p-4 → p-5로 여백 증가 */}
          <div className="flex items-center space-x-3"> {/* space-x-2 → space-x-3 */}
            <MessageCircle className="w-6 h-6 text-blue-500" /> {/* w-5 h-5 → w-6 h-6 */}
            <h2 className="text-xl font-bold text-gray-800">메시지</h2> {/* text-lg → text-xl */}
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"> {/* p-1 → p-2 */}
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // 로딩 상태
            <div className="flex items-center justify-center py-16"> {/* py-12 → py-16 */}
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div> {/* w-8 h-8 → w-10 h-10, mb-2 → mb-3 */}
                <p className="text-gray-500 text-base">채팅방을 불러오는 중...</p> {/* text-sm → text-base */}
              </div>
            </div>
          ) : error ? (
            // 에러 상태
            <div className="flex items-center justify-center py-16"> {/* py-12 → py-16 */}
              <div className="text-center">
                <div className="text-5xl mb-4">😅</div> {/* text-4xl → text-5xl */}
                <p className="text-red-500 text-base mb-4">{error}</p> {/* text-sm → text-base */}
                <button 
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-base"> {/* px-4 → px-5, text-sm → text-base */}
                  다시 시도
                </button>
              </div>
            </div>
          ) : chatRooms.length === 0 ? (
            // 채팅방이 없는 경우
            <div className="flex items-center justify-center py-16"> {/* py-12 → py-16 */}
              <div className="text-center">
                <div className="text-7xl mb-4">💬</div> {/* text-6xl → text-7xl */}
                <p className="text-gray-500 text-xl mb-3">아직 채팅방이 없습니다</p> {/* text-lg → text-xl, mb-2 → mb-3 */}
                <p className="text-gray-400 text-base">책을 빌리거나 빌려주면서</p> {/* text-sm → text-base */}
                <p className="text-gray-400 text-base">새로운 대화를 시작해보세요!</p> {/* text-sm → text-base */}
              </div>
            </div>
          ) : (
            // 채팅방 목록
            <div className="divide-y divide-gray-100">
              {chatRooms.map((chatRoom) => (
                <div
                  key={chatRoom.id}
                  onClick={() => handleChatRoomClick(chatRoom)}
                  className="p-5 hover:bg-gray-50 cursor-pointer transition-colors"> {/* p-4 → p-5 */}
                  <div className="flex items-start space-x-4"> {/* space-x-3 → space-x-4 */}
                    {/* 프로필 아이콘 */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center"> {/* w-12 h-12 → w-14 h-14 */}
                        <User className="w-7 h-7 text-gray-500" /> {/* w-6 h-6 → w-7 h-7 */}
                      </div>
                    </div>

                    {/* 채팅 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2"> {/* mb-1 → mb-2 */}
                        <h3 className="text-base font-semibold text-gray-900 truncate"> {/* text-sm → text-base */}
                          {chatRoom.otherUserNickname}
                        </h3>
                        <div className="flex items-center space-x-2"> {/* space-x-1 → space-x-2 */}
                          {chatRoom.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                              {chatRoom.unreadCount > 99 ? '99+' : chatRoom.unreadCount}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 flex items-center"> {/* text-xs → text-sm */}
                            <Clock className="w-4 h-4 mr-1" /> {/* w-3 h-3 → w-4 h-4 */}
                            {formatTime(chatRoom.lastMessageTime)}
                          </span>
                        </div>
                      </div>

                                             {/* 책 제목 */}
                       <p className="text-sm text-gray-500 mb-2 truncate"> {/* text-xs → text-sm, mb-1 → mb-2 */}
                         {chatRoom.bookTitle}
                       </p>

                      {/* 마지막 메시지 */}
                      <p className="text-sm text-gray-600 truncate"> {/* text-xs → text-sm */}
                        {chatRoom.lastMessage 
                          ? truncateMessage(chatRoom.lastMessage)
                          : '새로운 채팅방이 생성되었습니다.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 */}
        <div className="p-5 border-t border-gray-200 bg-gray-50"> {/* p-4 → p-5 */}
          <p className="text-sm text-gray-500 text-center"> {/* text-xs → text-sm */}
            💡 북북톡으로 책을 안전하게 거래하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessagePanel;