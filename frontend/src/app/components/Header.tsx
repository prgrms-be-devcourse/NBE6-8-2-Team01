'use client'; // 이 줄을 파일 맨 위에 추가해주세요.

import React, { useState, useEffect } from 'react';
import { Bell, Heart, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MessagePanel from '../bookbook/MessagePopup/MessagePanel';
import { authFetch, logoutUser } from '../util/authFetch';
import { useLoginModal } from '../context/LoginModalContext';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const { openLoginModal } = useLoginModal();
  const toggleMessagePanel = () => setShowMessagePanel((prev) => !prev);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await authFetch('/api/v1/bookbook/users/isAuthenticated', {
          method: 'GET',
        }, openLoginModal);

        if (response.ok) {
          const rsData = await response.json();
          setIsLoggedIn(rsData.data);
        } else {
          // 401 에러는 authFetch에서 이미 처리되었을 가능성이 높습니다.
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, [openLoginModal]);

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      setIsLoggedIn(false);
    }
  };

  const handleLendBookClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openLoginModal();
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
              onClick={isLoggedIn ? handleLogout : openLoginModal}
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
                <Link href="/bookbook/user/notification" >
                  <Bell className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                </Link>
                <Link href="/bookbook/user/wishlist" >
                  <Heart className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                </Link>
                <Link href="/bookbook/user/profile" >
                  <User className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {showMessagePanel && (
        <MessagePanel onClose={() => setShowMessagePanel(false)} />
      )}
    </>
  );
};

export default Header;