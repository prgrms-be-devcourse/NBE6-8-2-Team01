'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Heart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from './LoginModal';
import MessagePanel from '../bookbook/MessagePopup/MessagePanel';

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);

  const toggleMessagePanel = () => setShowMessagePanel((prev) => !prev);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/v1/bookbook/users/isAuthenticated', {
          credentials: 'include', // 쿠키 포함 요청
        });
        if (response.ok) {
          const rsData = await response.json();
          setIsLoggedIn(rsData.data);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      // 백엔드에서 쿠키만 삭제하도록 요청하고, 리다이렉션은 프론트엔드에서 직접 처리
      const response = await fetch('http://localhost:8080/api/v1/bookbook/users/logout', {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual'
      });

      // 백엔드로부터 2xx 응답을 받았다면 (리다이렉트 응답 포함)
      if (response.type === 'opaqueredirect' || response.ok) { // 'opaqueredirect'는 manual redirect 시 타입
        setIsLoggedIn(false);
        alert('로그아웃 되었습니다.');
        window.location.href = '/bookbook';
      } else {
        alert('로그아웃에 실패했습니다.');
        console.error('로그아웃 실패:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('로그아웃 처리 중 오류 발생:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
    }
  };

  const handleLendBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginModal(true);
    }
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
                  onClick={isLoggedIn ? handleLogout : () => setShowLoginModal(true)}
                  className={`text-lg font-semibold px-5 py-2 rounded-md shadow transition ${
                      isLoggedIn ? 'bg-red-500 text-white hover:opacity-90' : 'bg-[#D5BAA3] text-white hover:opacity-90'
                  }`}
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>

              {isLoggedIn && (
                  <>
                    <button onClick={toggleMessagePanel}>
                      <Image
                          src="/message-icon.png"
                          alt="Message"
                          width={24}
                          height={24}
                          className="cursor-pointer hover:opacity-80"
                      />
                    </button>
                  </>
              )}

              <Link href="/bookbook/user/notification" className={!isLoggedIn ? 'invisible pointer-events-none' : ''}>
                <Bell className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
              </Link>

              <Link href="/bookbook/wishlist" className={!isLoggedIn ? 'invisible pointer-events-none' : ''}>
                <Heart className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
              </Link>

              <Link href="/bookbook/user/profile" className={!isLoggedIn ? 'invisible pointer-events-none' : ''}>
                <User className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
              </Link>
            </div>
          </div>
        </header>

        {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
        )}

        {showMessagePanel && (
            <MessagePanel onClose={() => setShowMessagePanel(false)} />
        )}
      </>
  );
};

export default Header;