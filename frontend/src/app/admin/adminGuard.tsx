'use client';

import { useRouter, usePathname } from "next/navigation";
import { useAuthContext } from "./global/hooks/useAuth";
import { useEffect } from "react";
import LoadingScreen from "@/app/components/Loading";

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const { isLogin, loading } = useAuthContext();
    const pathname = usePathname();
    const router = useRouter();

    // 로그인 페이지는 가드 검증에서 제외
    const isLoginPage = pathname === '/admin/login';

    // 라우팅 로직
    useEffect(() => {
        if (loading) return;

        if (isLogin && isLoginPage) {
            // 로그인된 상태에서 로그인 페이지에 있으면 대시보드로 이동
            router.replace("/admin/dashboard");
        }

        if (!isLogin && !isLoginPage) {
            // 로그인되지 않은 상태에서 로그인 페이지가 아니면 로그인 페이지로 이동
            router.replace("/admin/login");
        }
    }, [isLogin, loading, isLoginPage, router]);

    // 로그인 페이지는 항상 렌더링
    if (isLoginPage) {
        return <>{children}</>;
    }

    // 초기화 전에는 로딩만 표시 (보안상 children 렌더링 금지)
    if (loading) {
        return <LoadingScreen message="인증 확인 중..." />;
    }

    // 로그인하지 않은 경우 로딩 표시 (리다이렉트 중)
    if (!isLogin) {
        return <LoadingScreen message="로그인 페이지로 이동 중..." />;
    }

    // 모든 검증을 통과한 관리자만 children 렌더링
    return <>{children}</>;
}

// 권한 없음 모달 컴포넌트
export function UnauthorizedModal() {
    const router = useRouter();

    const handleGoHome = () => {
        router.replace("/bookbook");
    };

    const handleRetry = () => {
        router.refresh();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center">
                    <div className="mb-6">
                        <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        접근 권한이 없습니다
                    </h3>
                    <p className="text-gray-600 mb-8">
                        이 페이지는 관리자 권한이 필요합니다.<br />
                        관리자 계정으로 다시 로그인해주세요.
                    </p>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleRetry}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer"
                        >
                            다시 시도하기
                        </button>
                        <button
                            onClick={handleGoHome}
                            className="flex-1 bg-[#CCAD94] hover:bg-[#AA8B6F] text-white font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer"
                        >
                            북북 홈으로
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}