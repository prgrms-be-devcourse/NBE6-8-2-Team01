'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroSection from "./mainpage/HeroSection";
import BookRegionSection from '../components/BookRegionSection';
import SuspensionModal from '../components/SuspensionModal';
import { useUserStatusCheck } from '../hooks/useUserStatusCheck';

export default function Home() {
    const [loginSuccessDetected, setLoginSuccessDetected] = useState(false);

    const { isSuspended, isLoaded, setIsSuspended } = useUserStatusCheck(loginSuccessDetected);

    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('login_success') === 'true') {
            sessionStorage.setItem('initialLoginSucceeded', 'true');
            console.log('백엔드에서 보낸 로그인 성공 신호를 감지하여 플래그를 설정했습니다.');
            setLoginSuccessDetected(true);
        }
    }, [searchParams]);

    const handleCloseModal = () => {
        setIsSuspended(false);
        sessionStorage.removeItem('suspensionModalShown');
    };

    if (!isLoaded) {
        return (
            <main>
                <HeroSection />
                <BookRegionSection />
            </main>
        );
    }

    return (
        <main>
            <HeroSection />
            <BookRegionSection />
            {isSuspended && <SuspensionModal onClose={handleCloseModal} />}
        </main>
    );
}