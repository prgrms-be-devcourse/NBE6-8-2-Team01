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
            {/* 왼쪽: 로고 */}
            <Link href="/bookbook" className="text-3xl font-bold" style={{ color: "#D5BAA3" }}>
              북북
            </Link>

            {/* 중앙: 메뉴 */}
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

            {/* 오른쪽: 로그인/로그아웃 버튼 및 아이콘 */}
            <div className="flex items-center space-x-6">
              {isLoggedIn ? (
                  // ️ 로그인 상태일 때: 로그아웃 버튼과 아이콘들
                  <>
                    <button
                        onClick={handleLogout} // 로그아웃 핸들러 연결
                        className="bg-red-500 text-white text-lg font-semibold px-5 py-2 rounded-md shadow hover:opacity-90 transition"
                    >
                      Logout
                    </button>
                    <Bell className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                    <Link href="/bookbook/wishlist">
                      <Heart className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                    </Link>
                    <Link href="/bookbook/mypage"> {/*  마이페이지 링크 추가 권장 */}
                      <User className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
                    </Link>
                  </>
              ) : (
                  // 로그인 상태가 아닐 때: 로그인 버튼만 표시
                  <button
                      onClick={() => setShowLoginModal(true)}
                      className="bg-[#D5BAA3] text-white text-lg font-semibold px-5 py-2 rounded-md shadow hover:opacity-90 transition"
                  >
                    Login
                  </button>
              )}
            </div>
          </div>
        </header>

        {/* 로그인 모달 */}
        {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </>
  );
};

export default Header;