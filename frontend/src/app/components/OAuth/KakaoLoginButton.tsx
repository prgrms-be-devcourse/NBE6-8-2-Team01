'use client';

import { RiKakaoTalkFill } from 'react-icons/ri';

const KakaoLoginButton = () => {
  const KAKAO_SERVER_REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_SERVER_REDIRECT_URI;

  const handleKakaoLogin = () => {
    if (KAKAO_SERVER_REDIRECT_URI) {
      window.location.href = KAKAO_SERVER_REDIRECT_URI;
    }
  };

  return (
    <button
      onClick={handleKakaoLogin}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] py-2 text-sm font-medium text-gray-700 hover:border hover:border-yellow-300 hover:bg-[#FFEB3B] transition-colors"
    >
      <RiKakaoTalkFill size={20} />
      카카오 계정으로 로그인
    </button>
  );
};

export default KakaoLoginButton;
