'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 로그인 모달 컨텍스트 타입 정의
interface LoginModalContextType {
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

// 컨텍스트 생성 (초기값은 null로 설정)
const LoginModalContext = createContext<LoginModalContextType | null>(null);

// 컨텍스트 프로바이더 컴포넌트
interface LoginModalProviderProps {
    children: ReactNode;
}

export const LoginModalProvider: React.FC<LoginModalProviderProps> = ({ children }) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <LoginModalContext.Provider value={{ isLoginModalOpen, openLoginModal, closeLoginModal }}>
            {children}
        </LoginModalContext.Provider>
    );
};

// 컨텍스트 훅
export const useLoginModal = () => {
    const context = useContext(LoginModalContext);
    if (!context) {
        throw new Error('useLoginModal must be used within a LoginModalProvider');
    }
    return context;
};