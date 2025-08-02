'use client'; // 이 줄을 파일 맨 위에 추가해주세요.

import React, { useState, useEffect } from 'react';
import { Bell, Heart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MessagePanel from '@/app/bookbook/MessagePopup/MessagePanel';
import { authFetch, logoutUser } from '../util/authFetch';
import { useLoginModal } from '../context/LoginModalContext';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0); // 읽지 않은 메시지 개수 추가
  const { openLoginModal } = useLoginModal();
  const toggleMessagePanel = () => setShowMessagePanel((prev) => !prev);

  // 읽지 않은 알림 개수를 가져오는 함수
  const fetchUnreadNotificationCount = async () => {
    if (!isLoggedIn) {
      setUnreadNotificationCount(0);
      return;
    }

    try {
      const response = await authFetch('/api/v1/bookbook/user/notifications/unread-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }, openLoginModal);

      if (response.ok) {
        const rsData = await response.json();
        if (rsData.success || rsData.resultCode.startsWith('200')) {
          setUnreadNotificationCount(rsData.data || 0);
        }
      } else {
        console.warn('알림 개수 조회 실패:', response.status);
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('알림 개수 조회 중 오류:', error);
      setUnreadNotificationCount(0);
    }
  };

  // 읽지 않은 메시지 개수를 가져오는 함수
  const fetchUnreadMessageCount = async () => {
    if (!isLoggedIn) {
      setUnreadMessageCount(0);
      return;
    }

    try {
      const response = await authFetch('/api/v1/bookbook/chat/unread-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }, openLoginModal);

      if (response.ok) {
        const rsData = await response.json();
        if (rsData.success || rsData.resultCode.startsWith('200')) {
          setUnreadMessageCount(rsData.data || 0);
        }
      } else {
        console.warn('메시지 개수 조회 실패:', response.status);
        setUnreadMessageCount(0);
      }
    } catch (error) {
      console.error('메시지 개수 조회 중 오류:', error);
      setUnreadMessageCount(0);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await authFetch('/api/v1/bookbook/users/isAuthenticated', {
          method: 'GET',
        }, openLoginModal);

        if (response.ok) {
          const rsData = await response.json();
          const loginStatus = rsData.data;
          setIsLoggedIn(loginStatus);
          
          // 로그인된 경우에만 알림과 메시지 개수 조회
          if (loginStatus) {
            fetchUnreadNotificationCount();
            fetchUnreadMessageCount();
          }
        } else {
          // 401 에러는 authFetch에서 이미 처리되었을 가능성이 높습니다.
          setIsLoggedIn(false);
          setUnreadNotificationCount(0);
          setUnreadMessageCount(0);
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        setIsLoggedIn(false);
        setUnreadNotificationCount(0);
        setUnreadMessageCount(0);
      }
    };

    checkLoginStatus();
  }, [openLoginModal]);

  // 로그인 상태가 변경될 때 알림과 메시지 개수 업데이트
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadNotificationCount();
      fetchUnreadMessageCount();
      
      // 주기적으로 알림과 메시지 개수 업데이트 (선택사항)
      const interval = setInterval(() => {
        fetchUnreadNotificationCount();
        fetchUnreadMessageCount();
      }, 30000); // 30초마다
      
      return () => clearInterval(interval);
    } else {
      setUnreadNotificationCount(0);
      setUnreadMessageCount(0);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      setIsLoggedIn(false);
      setUnreadNotificationCount(0);
      setUnreadMessageCount(0);
    }
  };

  const handleLendBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginModal();
    }
  };

  const handleNotificationClick = () => {
    // 알림 페이지로 이동 후 개수를 0으로 리셋하지 않음
    // 사용자가 실제로 알림을 읽으면 백엔드에서 개수가 업데이트됨
  };

  const handleMessageClick = () => {
    // 메시지 패널을 열고 메시지 개수를 업데이트
    toggleMessagePanel();
    // 메시지 패널이 열릴 때 개수를 다시 확인
    setTimeout(() => {
      fetchUnreadMessageCount();
    }, 500);
  };

  return (
    <>
      <header className="w-full py-6 shadow-md bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/bookbook" className="text-3xl font-bold" style={{ color: "#D5BAA3" }}>
            북북
          </Link>

          <nav className="flex items-center text-lg font-semibold text-gray-800">
            <Link href="/bookbook" className="mr-10 hover:text-blue-600">
              홈
            </Link>
            <Link href="/bookbook/rent" className="mx-4 hover:text-blue-600">
              책 빌리러 가기
            </Link>
            <Link
              href="/bookbook/rent/create"
              className="ml-8 hover:text-blue-600"
              onClick={handleLendBookClick}
            >
              책 빌려주기
            </Link>
          </nav>

          <div className="flex items-center space-x-6 relative">
            <button
              onClick={isLoggedIn ? handleLogout : openLoginModal}
              className={`text-lg font-semibold px-5 py-2 rounded-md shadow transition ${
                isLoggedIn ? 'bg-red-500 text-white hover:opacity-90' : 'bg-[#D5BAA3] text-white hover:opacity-90'
              }`}
            >
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>

            {isLoggedIn && (
              <>
                {/* 메시지 아이콘 버튼 - 개수 표시 포함 */}
                <button onClick={handleMessageClick} className="relative">
                  <Image
                    src="/message-icon.png"
                    alt="Message"
                    width={24}
                    height={24}
                    className="cursor-pointer hover:opacity-80"
                  />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </button>
                
                {/* 알림 아이콘 - 개수 표시 포함 */}
                <Link href="/bookbook/user/notification" onClick={handleNotificationClick} className="relative">
                  <Bell className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1">
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </span>
                  )}
                </Link>
                
                <Link href="/bookbook/user/wishlist">
                  <Heart className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                </Link>
                <Link href="/bookbook/user/profile">
                  <User className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {showMessagePanel && (
        <MessagePanel 
          onClose={() => {
            setShowMessagePanel(false);
            // 메시지 패널이 닫힐 때 개수 업데이트
            fetchUnreadMessageCount();
          }} 
        />
      )}
    </>
  );
};

export default Header;