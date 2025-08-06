'use client';

import React, { useEffect } from 'react';
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
    const isUserPage = pathname.startsWith('/bookbook/user') && pathname !== '/bookbook/user/signup';

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