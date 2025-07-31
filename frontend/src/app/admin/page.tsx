'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "./global/hooks/useAuth";

export default function AdminIndexPage() {
  const { isAdmin, isLogin, isInitialized } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // 초기화가 완료되고 관리자로 인증된 경우에만 대시보드로 이동
    if (isInitialized && isLogin && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isAdmin, isLogin, isInitialized, router]);

  // AdminGuard가 모든 인증/권한 검증을 처리하므로 여기서는 단순한 대기 화면만
  return null;
}