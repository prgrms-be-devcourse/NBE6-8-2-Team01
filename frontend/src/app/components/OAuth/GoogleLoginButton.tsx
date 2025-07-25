'use client';

import { FcGoogle } from 'react-icons/fc';

const GoogleLoginButton = () => {
  const GOOGLE_SERVER_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_SERVER_REDIRECT_URI;

  const handleGoogleLogin = () => {
    if (GOOGLE_SERVER_REDIRECT_URI) {
      window.location.href = GOOGLE_SERVER_REDIRECT_URI;
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <FcGoogle size={20} />
      구글 계정으로 로그인
    </button>
  );
};

export default GoogleLoginButton;
