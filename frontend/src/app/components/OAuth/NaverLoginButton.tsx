'use client';

import React from 'react';

interface NaverLoginModalProps {
  onClose: () => void;
}

const NaverLoginModal: React.FC<NaverLoginModalProps> = ({ onClose }) => {
  const NAVER_LOGIN_URL = process.env.NEXT_PUBLIC_NAVER_SERVER_REDIRECT_URI;

  const handleNaverLogin = () => {
    if (NAVER_LOGIN_URL) {
      window.location.href = NAVER_LOGIN_URL;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative flex flex-col items-center gap-4">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        {/* 제목 */}
        <h2 className="text-lg font-bold mb-4 text-center">네이버 계정 로그인</h2>

        {/* 이미지 버튼 */}
        <button onClick={handleNaverLogin}>
          <img
            src="/naver.png" // ✅ 이미지 경로
            alt="네이버 로그인"
            className="w-[200px] h-auto hover:opacity-90 transition"
          />
        </button>
      </div>
    </div>
  );
};

export default NaverLoginModal;
