'use client';

import React, { useState /*, useEffect */ } from "react";
// import { apiFetch } from "@/app/lib/backend/client"; // 🔧 백엔드 준비 전 주석
import { useRouter } from "next/navigation";
import LoginModal from "./LoginModal";

export default function AuthNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 초기값 false
  const [userName, setUserName] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  // ✅ 백엔드 연동 전 주석
  // useEffect(() => {
  //   apiFetch("/api/v1/members/me")
  //     .then((res) => {
  //       if (res.resultCode?.startsWith("202")) {
  //         setIsLoggedIn(true);
  //         setUserName(res.data.name);
  //       }
  //     })
  //     .catch(() => {
  //       setIsLoggedIn(false);
  //       setUserName("");
  //     });
  // }, []);

  const handleLogout = async () => {
    // await apiFetch("/api/v1/members/logout", { method: "POST" }); // 🔧 추후 사용
    setIsLoggedIn(false);
    setUserName("");
    window.location.href = "/";
  };

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => router.push("/user")}
          className="w-8 h-8 bg-[#8c7051] rounded-full flex items-center justify-center text-white text-sm"
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <span
          onClick={() => router.push("/user")}
          className="text-gray-700 font-semibold hover:text-[#8c7051] transition-colors"
        >
          {userName}
        </span>
        <button
          onClick={handleLogout}
          className="ml-4 text-gray-700 px-3 py-2 rounded-lg hover:bg-[#8c7051] hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  // 로그인 상태 아닐 때
  return (
    <>
      <div
        className="text-white bg-[#D5BAA3] px-4 py-2 rounded-md text-sm font-semibold cursor-pointer hover:opacity-90 transition"
        onClick={() => setShowLoginModal(true)}
      >
        로그인
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
