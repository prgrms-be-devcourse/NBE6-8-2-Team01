'use client';

import React, { useState, useEffect } from 'react';
import LoginModal from '@/app/components/LoginModal'; // ✅ alias 경로 사용

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

const fetchNotifications = async (): Promise<NotificationApiResponse> => {
  try {
    const response = await fetch('http://localhost:8080/api/v1/bookbook/user/notifications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
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
  const [needLogin, setNeedLogin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ 모달 상태

  useEffect(() => {
    const loadNotifications = async () => {
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

        if (response.success || response.resultCode === '200-1') {
          setNotifications(response.data || []);
        } else {
          setError('알림 데이터를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('HTTP 401') || msg.includes('403')) {
          setNeedLogin(true);
          setError('로그인 후 사용해주세요.');
        } else if (msg.includes('Failed to fetch')) {
          setError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
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
    setNeedLogin(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">🔔 알림을 불러오는 중...</div>
      </div>
    );
  }

  if (needLogin) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-6xl mb-4">🔐</div>
        <div className="text-xl font-semibold text-gray-800">로그인 후 사용해주세요</div>
        <div className="text-sm text-gray-500 text-center">
          알림을 확인하려면 먼저 로그인이 필요합니다.
        </div>
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          로그인 하러 가기
        </button>

        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
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
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🔔 알림 메시지</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-lg mb-2">알림이 없습니다</div>
          <div className="text-sm text-gray-400">새로운 알림이 오면 여기에 표시됩니다.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((item) => (
            <div key={item.id}>
              <div
                onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                className={`p-4 border rounded shadow-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedId === item.id
                    ? 'bg-blue-50 border-blue-200'
                    : item.read
                    ? 'bg-white'
                    : 'bg-[#fff9f0]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p
                    className={`text-sm ${
                      selectedId === item.id
                        ? 'font-semibold text-blue-800'
                        : item.read
                        ? 'text-gray-600'
                        : 'font-semibold'
                    }`}
                  >
                    {item.message}
                  </p>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              </div>

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
