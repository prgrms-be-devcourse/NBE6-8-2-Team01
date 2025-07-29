'use client';

import React, { useState, useEffect } from 'react';

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
  }>;
  success: boolean;
}

interface LoginResponse {
  id: number;
  username: string;
  nickname: string;
  email: string;
  address: string;
  rating: number;
  role: string;
  userStatus: string;
}

// 개발용 로그인
const loginAsAdmin = async (): Promise<void> => {
  try {
    console.log('개발용 로그인 시도...');
    
    const response = await fetch('http://localhost:8080/api/v1/users/dev/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: 'devuser',
        password: 'devpassword'
      }),
      mode: 'cors',
      credentials: 'include'
    });
    
    console.log('로그인 응답 상태:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('로그인 실패 응답:', errorText);
      throw new Error(`로그인 실패: HTTP ${response.status} - ${errorText}`);
    }
    
    const data: LoginResponse = await response.json();
    console.log('로그인 성공:', data);
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(data));
    
  } catch (error) {
    console.error('로그인 에러:', error);
    throw error;
  }
};

// 알림 API 호출
const fetchNotifications = async (): Promise<NotificationApiResponse> => {
  try {
    console.log('알림 API 호출 시작...');
    
    // 로그인 상태 확인
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // 로그인이 안되어 있으면 개발용 로그인
    if (!isLoggedIn) {
      console.log('로그인이 필요해서 개발용 로그인 시도...');
      await loginAsAdmin();
    }
    
    const response = await fetch('http://localhost:8080/api/v1/bookbook/user/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include' // 세션/쿠키 포함
    });
    
    console.log('알림 API 응답 상태:', response.status, response.statusText);
    
    // 401/403 인 경우 재로그인 시도
    if (response.status === 401 || response.status === 403) {
      console.log('인증 실패, 재로그인 시도...');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      
      await loginAsAdmin();
      
      // 재시도
      const retryResponse = await fetch('http://localhost:8080/api/v1/bookbook/user/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!retryResponse.ok) {
        throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
      }
      
      return await retryResponse.json();
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('알림 데이터:', data);
    
    return data;
  } catch (error) {
    console.error('fetchNotifications 에러:', error);
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

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchNotifications();
        
        console.log('알림 API 응답 전체:', response);
        
        if (response && (response.success || response.resultCode === "200-1")) {
          setNotifications(response.data || []);
          console.log('알림 데이터 설정 완료:', response.data);
        } else {
          console.warn('API 응답이 성공이 아님:', response);
          setError('알림 데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        console.error('알림 API 호출 에러:', err);
        
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
        } else if (err instanceof Error && err.message.includes('HTTP 403')) {
          setError('알림에 접근할 권한이 없습니다. 로그인이 필요합니다.');
        } else if (err instanceof Error && err.message.includes('HTTP 401')) {
          setError('인증이 만료되었습니다. 다시 로그인해주세요.');
        } else if (err instanceof Error && err.message.includes('HTTP')) {
          setError(`서버 오류: ${err.message}`);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // 로그인 정보 삭제 후 재시도
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">🔔 알림을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-lg text-red-600 text-center">{error}</div>
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
        {/* 개발용 백엔드 상태 확인 링크 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-sm text-gray-500 text-center">
            <div className="mb-2">백엔드 상태 확인:</div>
            <a 
              href="http://localhost:8080/api/v1/bookbook/user/notifications" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              알림 API 직접 확인
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🔔 알림 메시지</h1>

      {/* 알림이 없을 때 처리 */}
      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-lg mb-2">알림이 없습니다</div>
          <div className="text-sm text-gray-400">
            새로운 알림이 오면 여기에 표시됩니다.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((item) => (
            <div key={item.id}>
              {/* 알림 배너 */}
              <div
                onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                className={`p-4 border rounded shadow-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedId === item.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : item.read ? 'bg-white' : 'bg-[#fff9f0]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className={`text-sm ${
                    selectedId === item.id 
                      ? 'font-semibold text-blue-800' 
                      : item.read ? 'text-gray-600' : 'font-semibold'
                  }`}>
                    {item.message}
                  </p>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              </div>

              {/* 선택된 알림의 상세 정보 */}
              {selectedId === item.id && (
                <div className="mt-3 mb-3 p-6 border rounded-lg shadow bg-white flex gap-6">
                  <img
                    src={item.imageUrl}
                    alt="책 이미지"
                    width={120}
                    height={180}
                    className="rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/book-placeholder.png';
                    }}
                  />
                  <div className="space-y-3 flex-1">
                    <h2 className="text-lg font-bold text-gray-800">{item.bookTitle}</h2>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">신청자:</span> {item.requester}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">메시지:</span> {item.detailMessage}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 개발용 디버깅 정보 */}
      {process.env.NODE_ENV === 'development' && notifications.length > 0 && (
        <div className="mt-8 p-4 bg-gray-100 rounded-md">
          <details className="cursor-pointer">
            <summary className="font-bold mb-2">디버깅 정보 (개발용)</summary>
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify(notifications, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}