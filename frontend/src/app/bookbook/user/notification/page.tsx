'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface NotificationApiResponse {
  resultCode: string;
  msg: string;
  data: Array<{
    id: number;
    message: string;
    time: string;
    read: boolean;
    bookTitle: string;
    detailMessage: string;
    imageUrl: string;
    requester: string;
    type: string;
  }> | null;
  statusCode: number;
  success: boolean;
}

interface RentRequestDetail {
  rentListId: number;
  rentId: number; // rent ID 추가
  bookTitle: string;
  bookImage: string;
  requesterNickname: string;
  requestDate: string;
  loanDate: string;
  returnDate: string;
  rentStatus: string;
}

const fetchNotifications = async (): Promise<NotificationApiResponse> => {
  try {
    console.log('🔔 알림 API 호출 시작...');
    
    const response = await fetch('/api/v1/bookbook/user/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('알림 API 응답 상태:', response.status);

    if (!response.ok) {
      console.error('HTTP 에러:', response.status, response.statusText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const parsed = await response.json();
    console.log('파싱된 JSON:', parsed);
    
    return parsed;
  } catch (error) {
    console.error('fetchNotifications 상세 에러:', error);
    throw error;
  }
};

const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    const response = await fetch(`/api/v1/bookbook/user/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('알림 읽음 처리 에러:', error);
    throw error;
  }
};

const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    const response = await fetch(`/api/v1/bookbook/user/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('알림 삭제 에러:', error);
    throw error;
  }
};

const fetchRentRequestDetail = async (notificationId: number): Promise<RentRequestDetail> => {
  try {
    const response = await fetch(`/api/v1/bookbook/user/notifications/${notificationId}/rent-request-detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('대여 신청 상세 정보 조회 에러:', error);
    throw error;
  }
};

// 수정된 수락/거절 API - 올바른 URL 사용
const decideRentRequest = async (rentListId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
  try {
    const response = await fetch(`/api/v1/user/1/rentlist/${rentListId}/decision`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        approved: approved,
        rejectionReason: rejectionReason || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || '요청 처리에 실패했습니다.');
    }
  } catch (error) {
    console.error('대여 신청 수락/거절 에러:', error);
    throw error;
  }
};

type Notification = {
  id: number;
  message: string;
  time: string;
  read: boolean;
  bookTitle: string;
  detailMessage: string;
  imageUrl: string;
  requester: string;
  type: string;
};

export default function NotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [rentRequestDetail, setRentRequestDetail] = useState<RentRequestDetail | null>(null);
  const [isProcessingDecision, setIsProcessingDecision] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedLogin(false);

      const response = await fetchNotifications();

      if (response.resultCode === '401-1') {
        setNeedLogin(true);
        setError(response.msg || '로그인 후 사용해주세요.');
        return;
      }

      if (response.success || response.resultCode.startsWith('200')) {
        setNotifications(response.data || []);
      } else {
        setError(response.msg || '알림 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const msg = error.message;
      
      if (msg.includes('재로그인이 필요합니다')) {
        setNeedLogin(true);
        setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
        setNotifications([]);
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
      } else if (msg.includes('JSON') || msg.includes('Unexpected end')) {
        setError('서버에서 잘못된 응답을 받았습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('알 수 없는 오류가 발생했습니다: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = async (notificationId: number) => {
    const isCurrentlySelected = selectedId === notificationId;
    const notification = notifications.find(n => n.id === notificationId);
    
    setSelectedId(isCurrentlySelected ? null : notificationId);
    
    if (!isCurrentlySelected && notification?.type === 'RENT_REQUEST') {
      try {
        const detail = await fetchRentRequestDetail(notificationId);
        setRentRequestDetail(detail);
      } catch (error) {
        console.error('대여 신청 상세 정보 로드 실패:', error);
        setRentRequestDetail(null);
      }
    } else {
      setRentRequestDetail(null);
    }
    
    if (notification && !notification.read && !isCurrentlySelected) {
      try {
        await markNotificationAsRead(notificationId);
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }
  };

  const handleDeleteNotification = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!confirm('이 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (selectedId === notificationId) {
        setSelectedId(null);
        setRentRequestDetail(null);
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      alert('알림 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleRentDecision = async (approved: boolean, rejectionReason?: string) => {
    if (!rentRequestDetail) return;

    setIsProcessingDecision(true);
    try {
      await decideRentRequest(rentRequestDetail.rentListId, approved, rejectionReason);
      
      alert(approved ? '대여 신청을 수락했습니다!' : '대여 신청을 거절했습니다.');
      
      await loadNotifications();
      setSelectedId(null);
      setRentRequestDetail(null);
      
    } catch (error) {
      console.error('대여 신청 처리 실패:', error);
      alert(`처리에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsProcessingDecision(false);
    }
  };

  // 책 상세페이지로 이동하는 함수 (수정됨)
  const handleBookImageClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // 알림 클릭 이벤트 방지
    
    if (rentRequestDetail?.rentId) {
      // 실제 rent 상세페이지로 이동
      router.push(`/rent/${rentRequestDetail.rentId}`);
    } else {
      console.log('Rent ID를 찾을 수 없습니다.');
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setNeedLogin(false);
    loadNotifications();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <div className="text-lg text-gray-600">🔔 알림을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-6xl mb-4">🔐</div>
        <div className="text-xl font-semibold text-gray-800">로그인이 필요합니다</div>
        <div className="text-sm text-gray-500 text-center">
          {error || '알림을 확인하려면 먼저 로그인이 필요합니다.'}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          새로고침
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-6xl mb-4">❌</div>
        <div className="text-lg text-red-600 text-center font-semibold">오류가 발생했습니다</div>
        <div className="text-sm text-gray-600 text-center max-w-md">{error}</div>
        <div className="flex space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            새로고침
          </button>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🔔 알림 메시지</h1>
        {unreadCount > 0 && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}개의 새 알림
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-xl mb-2 font-semibold">알림이 없습니다</div>
          <div className="text-sm text-gray-400">새로운 알림이 오면 여기에 표시됩니다.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((item) => (
            <div key={item.id}>
              <div
                onClick={() => handleNotificationClick(item.id)}
                className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 relative ${
                  selectedId === item.id
                    ? 'bg-blue-50 border-blue-200 shadow-md'
                    : item.read
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-[#fff9f0] hover:bg-[#fff5e6] border-orange-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3 flex-1">
                    {!item.read && (
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    )}
                    <p
                      className={`text-sm flex-1 ${
                        selectedId === item.id
                          ? 'font-semibold text-blue-800'
                          : item.read
                          ? 'text-gray-600'
                          : 'font-semibold text-gray-800'
                      }`}
                    >
                      {item.message}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleDeleteNotification(item.id, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                      title="알림 삭제"
                    >
                      ✕
                    </button>
                    <span className="text-xs text-gray-400">{item.time}</span>
                    <div className={`transform transition-transform duration-200 ${
                      selectedId === item.id ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {selectedId === item.id && (
                <div className="mt-2 mb-4 p-6 border rounded-lg shadow-md bg-white animate-fade-in">
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      {/* 이미지 URL 검증과 fallback 개선 */}
                      <img
                        src={rentRequestDetail?.bookImage || item.imageUrl || '/book-placeholder.png'}
                        alt="책 이미지"
                        width={120}
                        height={180}
                        className="rounded-lg object-cover shadow-sm cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-blue-300"
                        onError={(e) => {
                          console.log('이미지 로드 실패, placeholder 사용');
                          e.currentTarget.src = '/book-placeholder.png';
                        }}
                        onClick={handleBookImageClick}
                        title="클릭하여 상세 페이지로 이동"
                      />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                          {rentRequestDetail?.bookTitle || item.bookTitle}
                        </h2>
                        <div className="w-12 h-0.5 bg-blue-500 rounded"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[60px]">신청자:</span>
                          <span className="text-gray-800 ml-2">
                            {rentRequestDetail?.requesterNickname || item.requester}
                          </span>
                        </div>
                        {rentRequestDetail && (
                          <>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[60px]">신청일:</span>
                              <span className="text-gray-800 ml-2">{rentRequestDetail.requestDate}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[60px]">대여일:</span>
                              <span className="text-gray-800 ml-2">{rentRequestDetail.loanDate}</span>
                            </div>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-700 min-w-[60px]">반납일:</span>
                              <span className="text-gray-800 ml-2">{rentRequestDetail.returnDate}</span>
                            </div>
                          </>
                        )}
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[60px]">메시지:</span>
                          <span className="text-gray-800 ml-2 leading-relaxed">{item.detailMessage}</span>
                        </div>
                      </div>
                      
                      {/* 대여 신청인 경우 수락/거절 버튼 표시 */}
                      {item.type === 'RENT_REQUEST' && rentRequestDetail && (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleRentDecision(true)}
                              disabled={isProcessingDecision}
                              className="flex-1 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {isProcessingDecision ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  처리 중...
                                </>
                              ) : (
                                '✅ 수락하기'
                              )}
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('거절 사유를 입력해주세요 (선택사항):');
                                if (reason !== null) {
                                  handleRentDecision(false, reason);
                                }
                              }}
                              disabled={isProcessingDecision}
                              className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {isProcessingDecision ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  처리 중...
                                </>
                              ) : (
                                '❌ 거절하기'
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            💡 처리 후에는 신청자에게 결과 알림이 자동으로 발송됩니다.
                          </p>
                        </div>
                      )}
                      
                      {!item.read && (
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">New</span>
                            <span className="text-red-600 font-medium text-sm">읽지 않음</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}