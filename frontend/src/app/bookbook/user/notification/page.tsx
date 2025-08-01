'use client';

import React, { useState, useEffect, useCallback } from 'react';
import LoginModal from '@/app/components/LoginModal'; // ✅ alias 경로 사용
import { authFetch, logoutUser } from '@/app/util/authFetch'; // logoutUser 추가
import { useLoginModal } from '@/app/context/LoginModalContext'; // 로그인 모달 컨텍스트 추가

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
  }> | null;
  statusCode: number;
  success: boolean; // RsData에서 제공하는 success 필드 추가
}

// 테스트용 API 호출
const testConnection = async (): Promise<void> => {
  try {
    console.log('🔧 백엔드 연결 테스트 시작...');
    
    const response = await fetch('http://localhost:8080/api/v1/bookbook/user/notifications/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    console.log('테스트 응답 상태:', response.status);
    console.log('테스트 응답 헤더:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('테스트 응답 텍스트:', text);
    
    if (text) {
      const json = JSON.parse(text);
      console.log('테스트 응답 JSON:', json);
    }
  } catch (error) {
    console.error('연결 테스트 실패:', error);
  }
};

const fetchNotifications = async (openLoginModal: () => void): Promise<NotificationApiResponse> => {
  try {
    console.log('🔔 알림 API 호출 시작...');
    
    const response = await authFetch('/api/v1/bookbook/user/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }, openLoginModal);

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

// 알림 읽음 처리 API
const markNotificationAsRead = async (notificationId: number, openLoginModal: () => void): Promise<void> => {
  try {
    const response = await authFetch(`/api/v1/bookbook/user/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }, openLoginModal);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('알림 읽음 처리 에러:', error);
    throw error;
  }
};

// 알림 삭제 API
const deleteNotification = async (notificationId: number, openLoginModal: () => void): Promise<void> => {
  try {
    const response = await authFetch(`/api/v1/bookbook/user/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    }, openLoginModal);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('알림 삭제 에러:', error);
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
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 로그인 상태 추가
  const { openLoginModal } = useLoginModal(); // 로그인 모달 컨텍스트 사용
  // 인증 에러 처리 공통 함수
  const handleAuthError = useCallback(async (error: Error) => {
    const errorMessage = error.message;
    console.log('인증 에러 감지:', errorMessage);
    
    if (errorMessage.includes('리프레시 토큰') || 
        errorMessage.includes('401') || 
        errorMessage.includes('인증') ||
        errorMessage.includes('Unauthorized')) {
      
      console.log('리프레시 토큰 만료 - 자동 로그아웃 처리');
      
      // 자동 로그아웃 처리
      try {
        await logoutUser();
      } catch (logoutError) {
        console.warn('로그아웃 처리 중 오류:', logoutError);
      }
      
      // 쿠키 및 스토리지 정리 (추가 보장)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      localStorage.clear();
      sessionStorage.clear();
      
      // 상태 업데이트
      setNeedLogin(true);
      setIsLoggedIn(false);
      setError('인증이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해주세요.');
      setNotifications([]); // 알림 데이터 초기화
      
      return true;
    }
    return false;
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedLogin(false);

      const response = await fetchNotifications(openLoginModal);

      if (response.resultCode === '401-1') {
        setNeedLogin(true);
        setError(response.msg || '로그인 후 사용해주세요.');
        return;
      }

      // RsData의 success 필드 또는 resultCode로 성공 여부 판단
      if (response.success || response.resultCode.startsWith('200')) {
        setNotifications(response.data || []);
      } else {
        setError(response.msg || '알림 데이터를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const isAuthError = await handleAuthError(error);
      
      if (!isAuthError) {
        // 인증 에러가 아닌 경우에만 다른 에러 처리
        const msg = error.message;
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          setError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
        } else if (msg.includes('JSON') || msg.includes('Unexpected end')) {
          setError('서버에서 잘못된 응답을 받았습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('알 수 없는 오류가 발생했습니다: ' + msg);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [openLoginModal]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationClick = async (notificationId: number) => {
    const isCurrentlySelected = selectedId === notificationId;
    
    // 토글
    setSelectedId(isCurrentlySelected ? null : notificationId);
    
    // 읽지 않은 알림인 경우 읽음 처리
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read && !isCurrentlySelected) {
      try {
        await markNotificationAsRead(notificationId, openLoginModal);
        // 로컬 상태 업데이트
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
        
        // 인증 에러 처리
        const authError = error instanceof Error ? error : new Error(String(error));
        await handleAuthError(authError);
        // handleAuthError에서 이미 상태를 업데이트하므로 추가 처리 불필요
      }
    }
  };

  const handleDeleteNotification = async (notificationId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 클릭 이벤트 전파 방지
    
    if (!confirm('이 알림을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteNotification(notificationId, openLoginModal);
      
      // 로컬 상태에서 제거
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // 선택된 알림이 삭제된 경우 선택 해제
      if (selectedId === notificationId) {
        setSelectedId(null);
      }
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      
      // 인증 에러 처리
      const authError = error instanceof Error ? error : new Error(String(error));
      const isAuthError = await handleAuthError(authError);
      
      if (!isAuthError) {
        alert('알림 삭제에 실패했습니다. 다시 시도해주세요.');
      }
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
          onClick={() => {
            setShowLoginModal(true);
            setError(null); // 에러 메시지 초기화
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          로그인 하러 가기
        </button>

        {showLoginModal && (
          <LoginModal 
            onClose={() => {
              setShowLoginModal(false);
              // 로그인 모달을 닫은 후 페이지 새로고침하여 인증 상태 확인
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }} 
          />
        )}
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

  // 읽지 않은 알림 개수 계산
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
                      <img
                        src={item.imageUrl}
                        alt="책 이미지"
                        width={120}
                        height={180}
                        className="rounded-lg object-cover shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = '/book-placeholder.png';
                        }}
                      />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">{item.bookTitle}</h2>
                        {item.bookTitle && (
                          <div className="w-12 h-0.5 bg-blue-500 rounded"></div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[60px]">신청자:</span>
                          <span className="text-gray-800 ml-2">{item.requester}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-700 min-w-[60px]">메시지:</span>
                          <span className="text-gray-800 ml-2 leading-relaxed">{item.detailMessage}</span>
                        </div>
                      </div>
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

      {process.env.NODE_ENV === 'development' && notifications.length > 0 && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <details className="cursor-pointer">
            <summary className="font-bold mb-2">🔧 디버깅 정보 (개발용)</summary>
            <div className="mt-2 space-y-2">
              <p className="text-sm"><strong>총 알림 개수:</strong> {notifications.length}</p>
              <p className="text-sm"><strong>읽지 않은 알림:</strong> {unreadCount}</p>
              <pre className="text-xs text-gray-700 overflow-auto bg-white p-2 rounded border max-h-40">
                {JSON.stringify(notifications, null, 2)}
              </pre>
            </div>
          </details>
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