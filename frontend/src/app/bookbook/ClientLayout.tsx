'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import UserSidebar from '../components/UserSidebar';
import Header from '../components/Header';
import { LoginModalProvider, useLoginModal } from '../context/LoginModalContext';
import LoginModal from '../components/LoginModal';
import { setOpenLoginModalFunction } from '../util/axiosInstance';

function AxiosInterceptorSetup() {
    const { openLoginModal } = useLoginModal();

    useEffect(() => {
        setOpenLoginModalFunction(openLoginModal);
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
    const isUserPage = pathname.startsWith('/bookbook/user') && pathname !== '/bookbook/user/signup';

    return (
        <LoginModalProvider>
            {/*  axios 인터셉터 설정을 위해 새로 만든 컴포넌트를 Provider 내부에 렌더링합니다. */}
            <AxiosInterceptorSetup />
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
