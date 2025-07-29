'use client';

import React from 'react';
// npm install react-icons (설치 안 되어있다면)
import { SiNaver } from 'react-icons/si';

const NaverLoginButton = () => {
  // 환경 변수에서 네이버 서버 리다이렉트 URI 가져오기
  const NAVER_SERVER_REDIRECT_URI = process.env.NEXT_PUBLIC_NAVER_SERVER_REDIRECT_URI;

  const handleNaverLogin = () => {
    if (NAVER_SERVER_REDIRECT_URI) {
      window.location.href = NAVER_SERVER_REDIRECT_URI;
    }
  };

  return (
      <button
          onClick={handleNaverLogin}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-[#03C75A] py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity duration-200"
      >
        <SiNaver size={20} /> {/* 네이버 아이콘 */}
        네이버 계정으로 로그인
      </button>
  );
};

export default NaverLoginButton;