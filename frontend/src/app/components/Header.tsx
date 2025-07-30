'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Heart, User } from 'lucide-react';
import Link from 'next/link';
import LoginModal from './LoginModal';

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // isAuthenticated 엔드포인트를 호출하여 로그인 상태 확인
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/v1/bookbook/users/isAuthenticated');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(data); // 응답 데이터가 true/false 형태라고 가정
        } else {
          setIsLoggedIn(false); // 응답 실패 시 로그인되지 않은 상태로 간주
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []); // 컴포넌트가 처음 렌더링될 때 한 번만 실행

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/v1/bookbook/users/logout', {
        method: 'POST',
        // Credentials를 포함하여 세션 쿠키가 전송되도록 설정
        credentials: 'include',
      });

      if (response.ok) {
        setIsLoggedIn(false); // 로그아웃 성공 시 상태 업데이트
        alert('로그아웃 되었습니다.');
        // 로그아웃 후 홈으로 리다이렉트
        window.location.href = '/bookbook';
      } else {
        alert('로그아웃에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그아웃 처리 중 오류 발생:', error);
      alert('로그아웃 처리 중 오류가 발생했습니다.');
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
              <Link href="/bookbook/rent/create" className="ml-8 hover:text-blue-600">
                책 빌려주기
              </Link>
            </nav>

            <div className="flex items-center space-x-6">
              {/* 항상 동일한 구조의 버튼과 아이콘 컨테이너를 유지 */}
              <div className="flex items-center space-x-6">
                <button
                    onClick={isLoggedIn ? handleLogout : () => setShowLoginModal(true)}
                    className={`text-lg font-semibold px-5 py-2 rounded-md shadow transition ${
                        isLoggedIn ? 'bg-red-500 text-white hover:opacity-90' : 'bg-[#D5BAA3] text-white hover:opacity-90'
                    }`}
                >
                  {isLoggedIn ? 'Logout' : 'Login'}
                </button>

                {/*  아이콘들은 `isLoggedIn` 상태에 따라 `invisible` 클래스를 토글합니다. */}
                {/* `pointer-events-none`는 여전히 유효합니다. */}
                <Bell className={`w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer ${!isLoggedIn ? 'invisible pointer-events-none' : ''}`} />
                <Link href="/bookbook/wishlist" className={!isLoggedIn ? 'invisible pointer-events-none' : ''}>
                  <Heart className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                </Link>
                <Link href="/bookbook/user/profile" className={!isLoggedIn ? 'invisible pointer-events-none' : ''}>
                  <User className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </>
  );
};

export default Header;