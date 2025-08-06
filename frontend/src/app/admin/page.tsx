'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "./global/hooks/useAuth";

/*
* 관리자 기본 페이지
*
* 로그인 여부에 따라 로그인 페이지나 대시보드로 이동합니다.
*/
export default function AdminIndexPage() {
  const { isAdmin, isLogin, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // 초기화가 완료되고 관리자로 인증된 경우에만 대시보드로 이동
    if (!loading && isLogin && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isAdmin, isLogin, loading, router]);

  // AdminGuard가 모든 인증/권한 검증을 처리하므로 여기서는 단순한 대기 화면만
  return null;
}