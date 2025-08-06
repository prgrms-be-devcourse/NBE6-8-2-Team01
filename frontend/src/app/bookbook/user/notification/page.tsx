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
    rentId?: number;
  }> | null;
  statusCode: number;
  success: boolean;
}

interface RentRequestDetail {
  rentListId: number;
  rentId: number;
  bookTitle: string;
  bookImage: string;
  requesterNickname: string;
  requestDate: string;
  loanDate: string;
  returnDate: string;
  rentStatus: string;
  isProcessable: boolean;
  processStatus: string;
}

const fetchNotifications = async (): Promise<NotificationApiResponse> => {
  try {
    const response = await fetch('/api/v1/bookbook/user/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const parsed = await response.json();
    return parsed;
  } catch (error) {
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
    throw error;
  }
};

// 🔧 수정된 부분: 기존 정상 경로 사용 (borrowerUserId는 임시로 1 사용)
const decideRentRequest = async (rentListId: number, approved: boolean, rejectionReason?: string): Promise<void> => {
  try {
    console.log('🚀 대여 신청 처리 시작:', { rentListId, approved, rejectionReason });
    
    // 기존 RentListController 경로 사용 (borrowerUserId는 임시값)
    const response = await fetch(`/api/v1/user/1/rentlist/${rentListId}/decision`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
      body: JSON.stringify({
        approved: approved,
        rejectionReason: rejectionReason || ''
      })
    });

    console.log('📡 응답 상태:', response.status);
    console.log('📡 응답 헤더:', response.headers.get('Content-Type'));
    
    // 응답이 HTML인지 먼저 확인
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('text/html')) {
      const htmlContent = await response.text();
      console.error('❌ HTML 응답 받음:', htmlContent.substring(0, 200));
      
      if (response.status === 401) {
        throw new Error('로그인이 만료되었습니다. 페이지를 새로고침하여 다시 로그인해주세요.');
      } else {
        throw new Error(`서버에서 HTML 응답을 받았습니다 (${response.status}). 서버 오류일 수 있습니다.`);
      }
    }
    
    // JSON 응답 처리
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      console.error('❌ JSON 파싱 실패:', jsonError);
      throw new Error(`서버 오류 (${response.status}): 유효하지 않은 응답 형식입니다.`);
    }
    
    console.log('📄 응답 데이터:', responseData);
    
    if (!response.ok) {
      console.error('❌ 에러 응답:', responseData);
      
      if (response.status === 401) {
        throw new Error('로그인이 필요합니다. 페이지를 새로고침해주세요.');
      } else if (response.status === 403) {
        throw new Error('권한이 없습니다. 본인의 대여 요청만 처리할 수 있습니다.');
      } else if (response.status === 404) {
        throw new Error('요청을 찾을 수 없습니다.');
      } else {
        throw new Error(responseData.msg || `서버 오류 (${response.status})`);
      }
    }
    
    console.log('✅ 처리 성공:', responseData);
    
  } catch (error) {
    console.error('🔥 decideRentRequest 에러:', error);
    throw error;
  }
};

// 🆕 추가된 디버깅 함수들
const testServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/v1/rentlist/ping');
    return response.ok;
  } catch (error) {
    return false;
  }
};

const debugTokenStatus = async (): Promise<any> => {
  try {
    const response = await fetch('/api/v1/public/rentlist/debug-token');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
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
  rentId?: number;
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
  const [imageLoadStates, setImageLoadStates] = useState<{[key: number]: 'loading' | 'loaded' | 'error'}>({});
  const [processedNotifications, setProcessedNotifications] = useState<Set<number>>(new Set());
  // 🆕 디버깅 상태 추가
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

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

  // 🆕 디버깅 정보 로드
  const loadDebugInfo = async () => {
    const serverOnline = await testServerConnection();
    const tokenInfo = await debugTokenStatus();
    
    setDebugInfo({
      serverOnline,
      tokenInfo,
      timestamp: new Date().toISOString()
    });
  };

  const handleNotificationClick = async (notificationId: number) => {
    const isCurrentlySelected = selectedId === notificationId;
    const notification = notifications.find(n => n.id === notificationId);
    
    setSelectedId(isCurrentlySelected ? null : notificationId);
    
    if (!isCurrentlySelected && notification?.type === 'RENT_REQUEST') {
      try {
        const detail = await fetchRentRequestDetail(notificationId);
        setRentRequestDetail(detail);
      } catch (error) {
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
        // 에러 발생 시 무시
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
      
      setProcessedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    } catch (error) {
      alert('알림 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 🔧 수정된 부분: 에러 처리 개선 및 전체 알림 새로고침
  const handleRentDecision = async (approved: boolean, rejectionReason?: string) => {
    if (!rentRequestDetail) return;

    setIsProcessingDecision(true);
    try {
      console.log('🎯 대여 신청 처리 시작:', { 
        rentListId: rentRequestDetail.rentListId, 
        approved, 
        rejectionReason,
        bookTitle: rentRequestDetail.bookTitle 
      });

      await decideRentRequest(rentRequestDetail.rentListId, approved, rejectionReason);
      
      const actionText = approved ? '수락' : '거절';
      alert(`대여 신청을 ${actionText}했습니다!`);
      
      console.log('✅ 대여 신청 처리 완료 - 전체 알림 새로고침 시작');
      
      // 🆕 전체 알림 목록 새로고침 (다른 신청들의 상태 변경 반영)
      await loadNotifications();
      
      // 상세 정보 패널 닫기
      setSelectedId(null);
      setRentRequestDetail(null);
      
      console.log('🔄 알림 목록 새로고침 완료');
      
    } catch (error) {
      console.error('🔥 handleRentDecision 에러:', error);
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      
      // 로그인 관련 에러면 디버깅 정보도 함께 표시
      if (errorMessage.includes('로그인')) {
        await loadDebugInfo();
        setShowDebug(true);
        alert(`처리에 실패했습니다: ${errorMessage}\n\n아래 디버깅 정보를 확인해보세요.`);
      } else {
        alert(`처리에 실패했습니다: ${errorMessage}`);
      }
    } finally {
      setIsProcessingDecision(false);
    }
  };

  const isNotificationProcessable = (notificationId: number): boolean => {
    // 🆕 백엔드에서 받은 상태 우선 확인
    if (rentRequestDetail && selectedId === notificationId) {
      return rentRequestDetail.isProcessable;
    }
    
    // 로컬 상태도 확인 (fallback)
    return !processedNotifications.has(notificationId);
  };

  const getImageUrl = (imageUrl: string | undefined | null): string => {
    if (!imageUrl || imageUrl.trim() === '') {
      return '/book-placeholder.png';
    }
    
    const trimmedUrl = imageUrl.trim();
    
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    } else if (trimmedUrl.startsWith('/')) {
      return `http://localhost:8080${trimmedUrl}`;
    } else if (trimmedUrl.startsWith('uploads/')) {
      return `http://localhost:8080/${trimmedUrl}`;
    } else {
      return `http://localhost:8080/uploads/${trimmedUrl}`;
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, notification: Notification) => {
    const img = e.currentTarget;
    
    setImageLoadStates(prev => ({
      ...prev,
      [notification.id]: 'error'
    }));
    
    if (img.src.includes('book-placeholder.png')) {
      return;
    }
    
    img.src = '/book-placeholder.png';
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, notificationId: number) => {
    setImageLoadStates(prev => ({
      ...prev,
      [notificationId]: 'loaded'
    }));
  };
  
  const handleBookImageClick = (event: React.MouseEvent, notification: Notification) => {
    event.stopPropagation();
    
    let rentId = rentRequestDetail?.rentId;
    
    if (!rentId && notification.rentId) {
      rentId = notification.rentId;
    }
    
    if (!rentId) {
      const patterns = [
        /rentId[:\s]*(\d+)/i,
        /rent\s*id[:\s]*(\d+)/i,
        /글\s*번호[:\s]*(\d+)/i,
        /글\s*ID[:\s]*(\d+)/i,
        /게시글[:\s]*(\d+)/i,
        /번호[:\s]*(\d+)/i,
        /ID[:\s]*(\d+)/i,
        /id[:\s]*(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = notification.message.match(pattern) || notification.detailMessage.match(pattern);
        if (match) {
          rentId = parseInt(match[1]);
          break;
        }
      }
    }
    
    if (rentId && rentId > 0) {
      router.push(`/bookbook/rent/${rentId}`);
    } else {
      alert('해당 글의 상세 정보를 찾을 수 없습니다. 백엔드에서 rent ID를 확인해주세요.');
    }
  };

  const formatRequestDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
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
          {/* 🆕 디버깅 버튼 추가 */}
          <button
            onClick={loadDebugInfo}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            디버그 정보
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
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}개의 새 알림
            </div>
          )}
          {/* 🆕 디버깅 토글 버튼 */}
          <button
            onClick={() => {
              setShowDebug(!showDebug);
              if (!showDebug) loadDebugInfo();
            }}
            className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
          >
            🔧 디버그
          </button>
        </div>
      </div>

      {/* 🆕 디버깅 정보 패널 */}
      {showDebug && debugInfo && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border">
          <h3 className="font-bold mb-2">🔧 디버깅 정보</h3>
          <div className="text-xs space-y-1">
            <div>서버 연결: {debugInfo.serverOnline ? '✅ 정상' : '❌ 실패'}</div>
            <div>JWT 토큰: {debugInfo.tokenInfo?.jwtTokenFound ? '✅ 발견' : '❌ 없음'}</div>
            <div>토큰 유효성: {debugInfo.tokenInfo?.jwtTokenValid ? '✅ 유효' : '❌ 무효'}</div>
            {debugInfo.tokenInfo?.userId && (
              <div>사용자 ID: {debugInfo.tokenInfo.userId}</div>
            )}
            <div>확인 시간: {new Date(debugInfo.timestamp).toLocaleString()}</div>
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-xl mb-2 font-semibold">알림이 없습니다</div>
          <div className="text-sm text-gray-400">새로운 알림이 오면 여기에 표시됩니다.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((item) => (
            <div key={item.id} data-notification-id={item.id}>
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
                      <div className="relative">
                        <img
                          src={getImageUrl(rentRequestDetail?.bookImage || item.imageUrl)}
                          alt="책 이미지"
                          width={120}
                          height={180}
                          className={`rounded-lg object-cover shadow-sm cursor-pointer hover:opacity-80 transition-all duration-200 border-2 border-transparent hover:border-blue-300 ${
                            imageLoadStates[item.id] === 'error' ? 'grayscale' : ''
                          }`}
                          onError={(e) => handleImageError(e, item)}
                          onLoad={(e) => handleImageLoad(e, item.id)}
                          onClick={(e) => handleBookImageClick(e, item)}
                          title="클릭하여 상세 페이지로 이동"
                          loading="lazy"
                        />
                        {imageLoadStates[item.id] === 'loading' && (
                          <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-gray-500 text-xs">로딩 중...</div>
                          </div>
                        )}
                        {imageLoadStates[item.id] === 'error' && (
                          <div className="absolute bottom-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                            ❌
                          </div>
                        )}
                      </div>
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
                          <div className="flex items-start">
                            <span className="font-semibold text-gray-700 min-w-[60px]">신청일:</span>
                            <span className="text-gray-800 ml-2">
                              {formatRequestDate(rentRequestDetail.requestDate)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[60px]">메시지:</span>
                          <span className="text-gray-800 ml-2 leading-relaxed">{item.detailMessage}</span>
                        </div>
                      </div>
                      
                      {item.type === 'RENT_REQUEST' && rentRequestDetail && (
                        <div className="pt-4 border-t border-gray-100">
                          {isNotificationProcessable(item.id) ? (
                            <>
                              <div className="max-w-sm">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleRentDecision(true)}
                                    disabled={isProcessingDecision}
                                    className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    {isProcessingDecision ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        처리 중...
                                      </>
                                    ) : (
                                      '수락'
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
                                    className="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    {isProcessingDecision ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        처리 중...
                                      </>
                                    ) : (
                                      '거절'
                                    )}
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                  💡 처리 후에는 신청자에게 결과 알림이 자동으로 발송됩니다.
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-600 font-medium">
                                  {rentRequestDetail.processStatus === 'APPROVED' ? '수락 완료' :
                                   rentRequestDetail.processStatus === 'REJECTED' ? '거절 완료' : 
                                   rentRequestDetail.processStatus === 'BOOK_ALREADY_LOANED' ? '이미 대여됨' : '처리 완료'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {rentRequestDetail.processStatus === 'APPROVED' ? '이 대여 신청을 수락했습니다.' :
                                 rentRequestDetail.processStatus === 'REJECTED' ? '이 대여 신청을 거절했습니다.' :
                                 rentRequestDetail.processStatus === 'BOOK_ALREADY_LOANED' ? '이 책은 다른 사용자에게 대여되었습니다.' :
                                 '이 대여 신청은 이미 처리되었습니다.'}
                              </p>
                            </div>
                          )}
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