'use client';

import React from 'react';
import GoogleLoginButton from './OAuth/GoogleLoginButton';
import KakaoLoginButton from './OAuth/KakaoLoginButton';
import NaverLoginButton from './OAuth/NaverLoginButton'; // ✅ 네이버 로그인 버튼 컴포넌트 임포트

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={onClose}
      >
        <div
            className="bg-white p-6 rounded-lg shadow-lg w-80 relative"
            onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
              onClick={onClose}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
              aria-label="닫기"
          >
            ×
          </button>

          {/* 제목 */}
          <h2 className="text-lg font-bold mb-4 text-center">SNS 로그인</h2>

          {/* 로그인 버튼 목록 */}
          <div className="flex flex-col gap-3">
            {/* ✅ KakaoLoginButton 사용 */}
            <KakaoLoginButton />
            {/* ✅ GoogleLoginButton 사용 */}
            <GoogleLoginButton />
            {/* ✅ NaverLoginButton 사용 */}
            <NaverLoginButton />
          </div>
        </div>
      </div>
  );
};

export default LoginModal;