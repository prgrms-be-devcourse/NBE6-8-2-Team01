'use client';

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
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { openLoginModal } = useLoginModal();
  const toggleMessagePanel = () => setShowMessagePanel((prev) => !prev);

  useEffect(() => {
    // 약간의 지연을 두어 하이드레이션이 완료된 후 렌더링
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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

          if (loginStatus) {
            fetchUnreadNotificationCount();
            fetchUnreadMessageCount();
          }
        } else {
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadNotificationCount();
      fetchUnreadMessageCount();

      const interval = setInterval(() => {
        fetchUnreadNotificationCount();
        fetchUnreadMessageCount();
      }, 30000);

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
      
      // toast 대신 간단한 alert 사용
      alert('로그인 후 이용해주세요.');
      
      setTimeout(() => {
        openLoginModal();
      }, 100);
    }
  };

  const handleNotificationClick = () => {
  };

  const handleMessageClick = () => {
    toggleMessagePanel();
    setTimeout(() => {
      fetchUnreadMessageCount();
    }, 500);
  };

  // 서버 사이드 렌더링 중에는 아무것도 렌더링하지 않음
  if (!mounted) {
    return null;
  }

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
                  fetchUnreadMessageCount();
                }}
            />
        )}
      </>
  );
};

export default Header;