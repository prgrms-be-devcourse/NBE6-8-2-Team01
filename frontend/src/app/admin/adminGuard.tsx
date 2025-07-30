'use client';

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthContext } from "./_hook/useAuth";

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const { isAdmin, isLogin, isInitialized } = useAuthContext();
    const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // 로그인 페이지는 가드 검증에서 제외
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        // 로그인 페이지는 검증하지 않음
        if (isLoginPage) return;
        
        // 초기화가 완료된 후에만 검증 실행
        if (!isInitialized) return;

        // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
        if (!isLogin) {
            router.replace("/admin/login");
            return;
        }

        // 로그인했지만 관리자가 아닌 경우 권한 없음 모달 표시
        if (!isAdmin) {
            setShowUnauthorizedModal(true);
            return;
        }

        // 정상적인 관리자인 경우 모달 숨김
        setShowUnauthorizedModal(false);
    }, [isAdmin, isLogin, isInitialized, isLoginPage, router]);

    // 로그인 페이지는 항상 렌더링
    if (isLoginPage) {
        return <>{children}</>;
    }

    // 초기화 전에는 로딩만 표시 (보안상 children 렌더링 금지)
    if (!isInitialized) {
        return <LoadingScreen message="인증 확인 중..." />;
    }

    // 로그인하지 않은 경우 로딩 표시 (리다이렉트 중)
    if (!isLogin) {
        return <LoadingScreen message="로그인 페이지로 이동 중..." />;
    }

    // 로그인했지만 관리자가 아닌 경우
    if (!isAdmin) {
        return (
            <>
                <LoadingScreen message="권한 확인 중..." />
                {showUnauthorizedModal && <UnauthorizedModal />}
            </>
        );
    }

    // 모든 검증을 통과한 관리자만 children 렌더링
    return <>{children}</>;
}

// 로딩 화면 컴포넌트
function LoadingScreen({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">{message}</p>
            </div>
        </div>
    );
}

// 권한 없음 모달 컴포넌트
function UnauthorizedModal() {
    const router = useRouter();
    const { logout } = useAuthContext();

    const handleGoHome = () => {
        router.replace('/');
    };

    const handleLogout = () => {
        logout(() => {
            router.replace('/admin/login');
        });
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
                            onClick={handleGoHome}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer"
                        >
                            홈으로 가기
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors cursor-pointer"
                        >
                            다시 로그인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}