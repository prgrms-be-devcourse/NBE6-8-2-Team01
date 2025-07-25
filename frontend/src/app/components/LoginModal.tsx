'use client';

import React from 'react';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
        >
          ×
        </button>

        {/* 제목 */}
        <h2 className="text-lg font-bold mb-4 text-center">SNS 로그인</h2>

        {/* 로그인 버튼 목록 */}
        <div className="flex flex-col gap-3">
          <a
            href="http://localhost:8080/api/auth/naver"
            className="bg-[#03C75A] text-white py-2 rounded-md text-center hover:opacity-90"
          >
            네이버로 로그인
          </a>
          <a
            href="http://localhost:8080/api/auth/kakao"
            className="bg-[#FEE500] text-black font-bold py-2 rounded-md text-center hover:opacity-90"
          >
            카카오로 로그인
          </a>
          <a
            href="http://localhost:8080/api/auth/google"
            className="bg-white border text-black py-2 rounded-md text-center hover:bg-gray-100"
          >
            구글로 로그인
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
