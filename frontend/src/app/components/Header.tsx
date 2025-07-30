'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Heart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from './LoginModal';
import MessagePanel from '../bookbook/MessagePopup/MessagePanel'; // ✅ 사이드패널 컴포넌트 추가

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false); // ✅ 패널 상태

  const toggleMessagePanel = () => setShowMessagePanel((prev) => !prev);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/v1/bookbook/users/isAuthenticated');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data);
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
      const response = await fetch('/api/v1/bookbook/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedIn(false);
        alert('로그아웃 되었습니다.');
        window.location.href = '/bookbook';
      } else {
        alert('로그아웃에 실패했습니다.');
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
                {/* 메시지 아이콘 버튼 */}
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

      {/* 로그인 모달 */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* 메시지 패널 */}
      {showMessagePanel && (
        <MessagePanel onClose={() => setShowMessagePanel(false)} />
      )}
    </>
  );
};

export default Header;
