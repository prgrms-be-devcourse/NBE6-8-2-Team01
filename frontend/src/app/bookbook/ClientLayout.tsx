'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import UserSidebar from '../components/UserSidebar';
import Header from '../components/Header';
import { LoginModalProvider, useLoginModal } from '../context/LoginModalContext';
import LoginModal from '../components/LoginModal';
import { setFetchInterceptorOpenLoginModal } from '@/app/util/fetchIntercepter';
import ModalSetup from '../components/ModalSetup';

function InterceptorSetup() {
    const { openLoginModal } = useLoginModal();

    useEffect(() => {
        setFetchInterceptorOpenLoginModal(openLoginModal);
    }, [openLoginModal]);

    return null;
}

function LoginModalContainer() {
    const { isLoginModalOpen, closeLoginModal } = useLoginModal();
    if (!isLoginModalOpen) return null;
    return <LoginModal onClose={closeLoginModal} />;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isUserPage, setIsUserPage] = useState(false);

    useEffect(() => {
        setMounted(true);
        // pathname이 변경될 때마다 isUserPage 상태 업데이트
        if (pathname) {
            setIsUserPage(pathname.startsWith('/bookbook/user') && pathname !== '/bookbook/user/signup');
        }
    }, [pathname]);

    // 서버 사이드 렌더링 중에는 기본 레이아웃만 표시
    if (!mounted) {
        return (
            <LoginModalProvider>
                <ModalSetup />
                <InterceptorSetup />
                <Header />
                <main className="flex-grow">{children}</main>
                <LoginModalContainer />
            </LoginModalProvider>
        );
    }

    return (
        <LoginModalProvider>
            <ModalSetup />
            <InterceptorSetup />
            <Header />
            {isUserPage ? (
                <div className="flex min-h-screen">
                    <UserSidebar />
                    <div className="flex-1 p-8">{children}</div>
                </div>
            ) : (
                <main className="flex-grow">{children}</main>
            )}
            <LoginModalContainer />
        </LoginModalProvider>
    );
}