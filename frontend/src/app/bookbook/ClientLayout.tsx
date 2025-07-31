'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import UserSidebar from '../components/UserSidebar';
import { LoginModalProvider, useLoginModal } from '../context/LoginModalContext';
import LoginModal from '../components/LoginModal';

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
            {isUserPage ? (
                // 사용자 페이지 레이아웃
                <div className="flex min-h-screen">
                    <UserSidebar />
                    <div className="flex-1 p-8">{children}</div>
                </div>
            ) : (
                // 일반 페이지 레이아웃
                <main className="flex-grow">{children}</main>
            )}
            <LoginModalContainer />
        </LoginModalProvider>
    );
}