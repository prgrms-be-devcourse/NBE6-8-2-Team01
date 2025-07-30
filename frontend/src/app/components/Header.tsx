'use client';

import React, { useState } from 'react';
import { Bell, Heart, User } from 'lucide-react';
import Link from 'next/link';
import LoginModal from './LoginModal';

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

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

          {/* 오른쪽: 로그인 및 아이콘 */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-[#D5BAA3] text-white text-lg font-semibold px-5 py-2 rounded-md shadow hover:opacity-90 transition"
            >
              Login
            </button>
            <Bell className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
            <Link href="/bookbook/wishlist">
              <Heart className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
            </Link>
            <User className="w-6 h-6 text-gray-700 hover:text-blue-600 cursor-pointer" />
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
